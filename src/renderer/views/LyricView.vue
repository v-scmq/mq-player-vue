<template>
  <div data-placeholder='暂无歌词' class='lyric-view' :class='{empty: lyricList.length < 1}'
       :ref='element => void (elements[-1] = element)' @pointerdown='onDragStart'>

    <div class='content-wrapper' :class='{animation: scrollable}'
         :style='{transform: `translateY(${translatedY}px)`}'>

      <div class='lyric-item' v-for='(line, index) in lyricList' :key='index'
           :ref='element => void (elements[index] = element)'
           :class='{active: selectedIndex === index}'>
        {{ line.content }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {ref, watch, defineComponent, inject, nextTick, onMounted, onUnmounted, computed} from 'vue';

import {LyricLine} from '../../types';

export default defineComponent({

  name: 'LyricView',

  setup() {
    // 已选定的歌词索引
    const selectedIndex = ref(-1);
    // 包裹所有歌词的内容元素在y轴方向上的平移
    const translatedY = ref(0);
    // 是否可滚动歌词内容
    const scrollable = ref(true);

    // 组件根元素 和 所有的歌词内容元素
    let elements: HTMLElement[] = [];

    // 注入歌词信息
    const lyrics = inject('lyrics') as { list: LyricLine[], playedTime: number };

    // 若有歌词翻译, 则歌词翻译在普通歌词的下一行显示
    const lyricList = computed(() => lyrics.list.map(({start, end, content, translation}) => ({
      start, end,
      content: translation
          ? `${content}\n${translation}`
          : content
    })));

    // 组件根元素可见高度
    let visibleHeight = 1;
    // 已滚动的歌词内容索引
    let scrolledIndex = 0;

    // 歌词内容在y轴方向上的最小平移量
    let minTranslateY = 0;
    // 歌词内容在y轴方向上的最大平移量
    let maxTranslateY = 0;
    // 指针设备在歌词内容元素上按下时, 歌词内容在y轴方向上的平移量
    let translateYInit = 0;

    // 指针设备在节点上按下时的y偏移量
    let offsetY = 0;
    // 滚动计时器
    let scrollTimer: number | null = null;

    // dom元素resize观察者
    let resizeObserver: ResizeObserver;

    /**
     * 计算指定index的歌词在父元素中垂直方向上处于中央的translateY(单位px)
     *
     * @param index 指定需要计算歌词平移量的index
     * @return {number} 歌词信息元素在父元素垂直居中的平移量
     */
    const computeTranslateY = (index: number) => {
      //       ---------------------------  content-wrapper
      //     + |                         |  ↖
      //     + |                         |     translateY(所求值)
      //     + |                         |  ↙
      // top + ===========================  root-element
      //     + |                         |  ↖
      //     + |                         |  ↙ (rootElement.height - targetElement.height) / 2
      //       |*************************|  target-element(处于视图垂直居中的元素)
      //       |                         |
      //       |                         |
      //       ===========================
      //
      // 注: top右侧 +号等价于{符号 , 它指示目标元素到它的父元素content-wrapper的上偏移量
      //     translateY = - (top - (组件可见高度 - 目标元素高度) / 2)
      //                =   -top + (组件可见高度 - 目标元素高度) / 2

      const element = elements[index];

      if (!element) {
        return 0;
      }

      const {offsetHeight: height, offsetTop: top} = element;
      return -top + (visibleHeight - height) / 2;
    }

    /**
     * 滚动歌词内容到可见视图的中央
     */
    const scrollLyric = () => {
      if (!scrollable.value) {
        return;
      }

      const {list, playedTime} = lyrics;
      const max = list.length;
      let active = false, index = 0;

      for (; index < max; ++index) {
        const line = list[index];

        if (playedTime < line.start) {
          active = false;
          break;
        }

        if (playedTime <= line.end) {
          active = true;
          break;
        }
      }

      // 若播放时间处于某一行歌词,那么高亮它, 否则取消高亮
      const newSelectedIndex = active ? index : -1;

      // 若标记的选择歌词索引发生了变化了, 则更新选择索引标记
      if (selectedIndex.value !== newSelectedIndex) {
        selectedIndex.value = newSelectedIndex;
      }

      // 若需要滚动, 那么将指定索引的歌词内容滚动到可视区域的中央
      if (scrolledIndex !== (active ? index : --index)) {
        scrolledIndex = index;
        translatedY.value = computeTranslateY(index);
      }
    };

    /**
     * 开始拖动(指针设备在滑块上按下)时触发, 此时并还未开始拖动,仅仅是准备好拖动.
     * 需要注意检测中断拖动不能依靠滑块(div)元素本身,需要借助document对象 或 window对象
     * 因为元素本身在鼠标移动后,所监听的鼠标释放事件并不会触发,但是document或window一定会触发
     *
     * @param {PointerEvent} event 指针事件
     */
    const onDragStart = (event: PointerEvent) => {
      event.preventDefault();

      // 关闭歌词滚动
      scrollable.value = false;
      // 清除计时器
      scrollTimer && window.clearTimeout(scrollTimer);
      scrollTimer = null as any;

      offsetY = event.pageY;
      translateYInit = translatedY.value;

      document.onpointermove = onDragging;
      document.onpointerup = onDragEnd;
    };

    /**
     * 滑块被拖动时触发.在此过程中,只会提交input事件以修改value属性值
     * @param {PointerEvent} event 指针事件
     */
    const onDragging = (event: PointerEvent) => {
      event.preventDefault();

      const value = translateYInit + event.pageY - offsetY;
      translatedY.value = Math.min(Math.max(value, minTranslateY), maxTranslateY);
    };

    /**
     * 鼠标停止拖动(鼠标在页面开始按下后,然后释放)时触发.
     * 此时只会提交change事件,并且传出的第2个参数boolean值true以方便侦测滑块拖动结束
     */
    const onDragEnd = () => {
      document.onpointermove = document.onpointerup = null;

      scrollTimer = window.setTimeout(() => void (scrollable.value = true), 2000);
    };

    onMounted(() => {
      resizeObserver = new ResizeObserver(([{contentRect}]) => {
        // 可见高度设定为组件根元素内容盒子的高度
        visibleHeight = contentRect.height;

        // 因为 宽度 或 高度 发生了变化, 重置滚动索引,使其能够重新滚动
        scrolledIndex = -1;
        // 尝试滚动歌词内容
        scrollLyric();

        // 计算最大平移量(基本上是正值)
        maxTranslateY = computeTranslateY(0);
        // 计算最小平移量(平移得越多, 负得越多, 则变得越小)
        minTranslateY = computeTranslateY(elements.length - 1);
      });

      // 开始观察组件根元素的 宽度 或 高度 变化
      resizeObserver.observe(elements[-1]);
    });

    // onBeforeUpdate(() => {
    //   elements.value = [];
    // })

    onUnmounted(() => {
      // 取消和结束目标对象上所有对element的观察
      resizeObserver.disconnect();

      // 断开所有引用
      for (let index = elements.length - 1; index >= -1; --index) {
        elements[index] = null as any;
      }

      visibleHeight = resizeObserver = elements = null as any;
    });


    // 监听歌词变化, 重新计算歌词 在 y轴方向上的 最大 和 最小 平移量
    watch(lyricList, () => void (nextTick(() => {
      // 计算最大平移量(基本上是正值)
      maxTranslateY = computeTranslateY(0);
      // 计算最小平移量(平移得越多, 负得越多, 则变得越小)
      minTranslateY = computeTranslateY(elements.length - 1);

    })), {immediate: true});

    // 开始监听 歌词内容 和 播放时间 的变化
    watch(() => lyrics.playedTime as any, scrollLyric);

    return {elements, selectedIndex, translatedY, scrollable, lyricList, onDragStart};
  },

})
</script>