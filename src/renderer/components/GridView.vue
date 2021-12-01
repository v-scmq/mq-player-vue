<template>
  <div class='grid-view' style='position:relative;flex:1;overflow:hidden auto;' ref='el'
       @scroll='updateVisibleData' @click='onClick'>

    <div style='position:absolute;left:0;right:0;z-index:-1;'
         :style='{minHeight:`${maxScrollHeight}px`}'></div>

    <div class='content-wrapper' :style='{gridTemplateColumns: cellWidths}'
         @touchend='infiniteScrollEmitter' @wheel='infiniteScrollEmitter'>
      <div class='item-cell' v-for='(item, index) in visibleData' :key='index' :data-index='index'>
        <slot :item='item'>{{ item }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
import {computed, reactive, ref, watch, onBeforeUnmount, onMounted} from 'vue';

export default {
  name: 'grid-view',

  props: {
    // 单元格宽度(作为grid布局的grid-template-columns样式属性使用)
    cellWidths: String,
    // 单元格高度(用于虚拟滚动计算可视区域内容行数)
    cellHeight: Number,
    // 作为循环渲染的数据内容
    data: {default: []},
  },

  emits: [/* 单元格点击事件 */ 'cell-click', /* 无限滚动 */ 'infinite-scroll'],

  setup(props, {emit}) {
    // 可视区域数据
    const visibleData = reactive([]);

    // 可见的列数
    const visibleColumnCount = ref(1);

    // 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度
    const maxScrollHeight = computed(() => Math.ceil(
        props.data.length / visibleColumnCount.value * props.cellHeight));

    // (相关文档 => https://v3.cn.vuejs.org/guide/composition-api-template-refs.html)
    /** @type {Ref<HTMLElement | null>} 组件根元素引用 */
    const el = ref(null);

    // 可见的行数 (无需作为响应式数据使用,因为没有参与数据响应式更新)
    let visibleRowCount = 1;

    // 可见数据起始索引
    let offsetIndex = 0;

    /** @type {HTMLElement} 内容元素(grid布局部分) */
    let contentWrapper;

    /** @type {ResizeObserver} 元素resize观察者对象(用于监听组件根元素大小变化) */
    let resizeObserver;

    /** @type {number | null} 组件根元素高度 */
    let offsetHeight = 1;

    /** @type {boolean | null} 标记是否滚到底部 */
    let isAtBottom = false;

    /** @type {number | null} 无限滚动计时器 */
    let infiniteScrollTimer = null;

    /**
     * 更新可视区域数据
     */
    const updateVisibleData = () => {
      // 可见数据总量 = 可见行数 * 可见列数
      const visibleCount = visibleRowCount * visibleColumnCount.value;

      // 当数据总量小于等于可视区域数据量时, 直接展示所有数据
      if (props.data.length <= visibleCount) {
        visibleData.splice(0, visibleData.length, ...props.data);

        isAtBottom = visibleData.length > 0;

        return;
      }


      // | 0 -  1 -  2 -  3 -  4 -  5|  0
      // | 6 -  7 -  8 -  9 - 10 - 11|  208
      // |12 - 13 - 14 - 15 - 16 - 17|  416
      // |18 - 19 - 20 - 21 - 22 - 23|  624

      // 假设每行可见个数为6, 可见行数为3, 发生滚动后, 若 top = 208 , 则
      // start = top:208 / cellHeight:208 * visibleColumnCount:6

      // 已滚动距离、元素高度、最大滚动高度(实际上是maxScrollHeight.value)
      const top = el.value.scrollTop;
      // 是否滚动到底部, 对于出现滚动条元素的元素 scrollTop + height - scrollHeight = 0
      // 注意: 理论上使用 === 即可, 但是在某些情况下(如缩放,见MDN)scrollTop可能出现小数, 因此最好使用 >=
      isAtBottom = top >= maxScrollHeight.value - offsetHeight;

      // 可视数据起始索引、可视数据结束索引
      let start, end;

      // 若滚动已到达底部
      if (isAtBottom) {
        end = props.data.length;
        start = end - visibleCount;

      } else {
        start = ((top / props.cellHeight) ^ 0) * visibleColumnCount.value;
        end = start + visibleCount;

        // 结束索引 和 数据总量 的 差值
        let dValue = end - props.data.length;
        if (dValue >= 0) {
          end = props.data.length;
          start -= dValue;
        }
      }

      // 获取可视区域对应的数据([start,end]范围内的数据)
      let list = props.data.slice(offsetIndex = start, end);
      visibleData.splice(0, visibleData.length, ...list);

      // 注: *** 已使用css position:sticky + top:0 固定在可视区域; 以下方案不再使用 ***
      // 将整个内容部分在y轴方向平移到可视区域
      // contentWrapper.style.transform = `translate3d(0, ${top}px, 0)`;
    };

    onMounted(() => {
      contentWrapper = el.value.querySelector('.content-wrapper');

      // 缓存组件根元素之前的宽度和高度
      let oldWidth, oldHeight;

      /**
       * 组件根元素宽高观察者对象,当宽高发生变化时,计算可视区域能显示的数据量
       *
       * {@link ResizeObserverEntry} 的contentRect是内容矩形盒子,这部分不包含border和padding
       */
      resizeObserver = new ResizeObserver(([{contentRect}]) => {
        // 获取组件根元素内容宽度
        const width = Math.max(1, contentRect.width);
        // 获取组件根元素内容高度
        const height = Math.max(1, contentRect.height);
        // 获取组件根元素实际高度
        offsetHeight = el.value.offsetHeight;

        // 标记是否需要更新可视区域数据
        let update = false;

        // 内容元素(grid布局)的已计算样式
        let computedStyle;

        // 若高度发生变化
        if (oldHeight !== height) {
          // 获取行间隙(如 '32px')
          const {gridRowGap} = computedStyle = window.getComputedStyle(contentWrapper);
          // 计算不包括行间隙的显示行数
          let count = Math.ceil((oldHeight = height) / props.cellHeight);

          if (gridRowGap.includes('px')) {
            // 计算所有行之间的间隙(注: number * string类型的number => number)
            let gapHeight = --count * gridRowGap.substring(0, gridRowGap.length - 2);
            // 可见行数 = (总高度 - 所有行间隙) / 每行的高度
            count = Math.ceil((height - gapHeight) / props.cellHeight);

          }

          // 若可视行单元格数量发生变化
          if (visibleRowCount !== count) {
            visibleRowCount = count;
            update = true;
          }
        }

        // 若宽度发生变化
        if (oldWidth !== width) {
          oldWidth = width;
          let count = 1;
          // '0px 0px 0px 0px 0px 0px'
          const {gridTemplateColumns} = computedStyle || window.getComputedStyle(contentWrapper);
          for (let index = gridTemplateColumns.length - 1; index >= 0; --index) {
            if (gridTemplateColumns.charAt(index) === ' ') {
              ++count;
            }
          }

          // 若可视列单元格数量发生变化
          if (visibleColumnCount.value !== count) {
            visibleColumnCount.value = count;
            update = true;
          }
        }

        // 若update为true, 则更新可视区域数据
        update && updateVisibleData();
      });

      resizeObserver.observe(el.value);
    });

    // 组件被卸载前, 解除引用
    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.unobserve(el.value);
        resizeObserver.disconnect();
      }
      resizeObserver = contentWrapper = null;
      isAtBottom = infiniteScrollTimer = offsetHeight = null;
    });

    // 监听表格数据变化
    watch(props.data, updateVisibleData);

    return {
      el, maxScrollHeight, visibleData, updateVisibleData,

      /**
       * 单元格被点击时的回调
       *
       * @param {PointerEvent} event 指针设备点击事件
       */
      onClick(event) {
        /** @type {HTMLElement} */
        let target = event.target;
        if (!target.classList.contains('item-cell')) {
          if ((target = target.closest('.item-cell')) == null) {
            return;
          }
        }

        let value = target.attributes.getNamedItem('data-index');
        if (value && (value = value.value)) {
          const index = offsetIndex + (value ^ 0);

          index >= 0 && index < props.data.length
          && emit('cell-click', props.data[index]);
        }
      },

      /**
       * (无限滚动事件Emitter) 满足以下条件时, 将发出无限滚动事件
       *
       * 1.当视图可视区域已将数据滚动到最底部
       * 2.在触摸设备上通过从下向上拖动 或 在非触摸设备上使用滚轮向下滚动
       *
       * @param {WheelEvent | TouchEvent} event
       */
      infiniteScrollEmitter(event) {
        /*
          TODO: 触摸设备上拖动方向检测, 可在touchstart 和 touchend 上 比较2次的clientY ;
                即使滚动到底底部, 此时从上向下拖动似乎并不会引起isAtBottom的错误判断, 因为监听的时拖动结束
                拖动开始时,内容就开始发生了滚动,从而isAtBottom是false .

         */
        // 若没有滚动到底部, 则什么也不做
        if (!isAtBottom || event.deltaY <= 0) {
          return
        }

        // 若计时器正在使用,则清除计时器
        if (infiniteScrollTimer !== null) {
          clearTimeout(infiniteScrollTimer);
          infiniteScrollTimer = null;
        }

        infiniteScrollTimer = setTimeout(() => {
          infiniteScrollTimer = null;
          emit('infinite-scroll')
        }, 500);
      }

    };
  }
};
</script>