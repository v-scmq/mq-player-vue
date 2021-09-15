<template>
  <div class='accordion v-column' ref='el' :style="{'--accordion-scroll-wrapper-height':`${scrollWrapperHeight}px`}">
    <div class='list-view v-column' v-for='(data,index) in list' :key='index' @click='onClick($event,data,index)'>
      <div class='v-row titled-pane'>
        <svg viewBox='-0.5 -2 8 8' width='1em' height='1em' class='icon'>
          <path d='M 0 0 h 7 l -3.5 4 z'></path>
        </svg>
        {{ data.title }}
      </div>
      <div class='v-column scroll-wrapper'>
        <div class='item' v-for='(item,index) in data.items' :key='index' :data-index="index">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {nextTick, onBeforeUnmount, onMounted, ref, watch, getCurrentInstance} from "vue";

export default {
  name: "Accordion",
  props: {list: {default: []}},
  emits: ['change'],

  setup(props, context) {
    const scrollWrapperHeight = ref(0);

    let selectedItem = null;

    let /** @type {HTMLElement} */ el, /** @type {ResizeObserver} */ resizeObserver;

    /** 当没有任何展开的列表项时,展开一个默认的列表项 */
    const expandDefault = () => {
      let nodes = el.querySelectorAll('.list-view');
      // 若没有任何列表项时,则重置已选定的记录
      if (nodes.length < 1) {
        selectedItem = null;
        return;
      }

      // 检测列表项是否至少有一项被展开
      for (let node of nodes) {
        if (node.classList.contains('expand')) {
          return;
        }
      }

      // 默认展开列表项的第一个
      nodes[0].classList.toggle('expand');
      // 获取第一个列表项的第一个子列表项
      let node = nodes[0].querySelector('.scroll-wrapper .item:first-child');
      // 若存在子列表项
      if (node) {
        // 记录第一个列表项的第一个子列表项为所选记录
        selectedItem = props.list[0].items[0];
        // 强制选中第一个列表项的第一个子列表项
        node.classList.toggle('selected', true);
      }
    };

    onMounted(() => {
      el = getCurrentInstance().refs.el;

      // 当根元素宽高发生变化时,回调此方法以计算滚动盒子内部高度
      resizeObserver = new ResizeObserver(([entry]) => {
        let node = entry.target, height = node.offsetHeight;
        let nodes = node.querySelectorAll('.list-view .titled-pane');
        nodes.forEach(node => height -= node.offsetHeight);
        scrollWrapperHeight.value = height;
      });

      resizeObserver.observe(el);

      if (props.list && props.list.length) {
        let items = props.list[0].items;
        if (items && items.length) {
          selectedItem = items[0];
        }
        nextTick(() => expandDefault())
      }
    });

    onBeforeUnmount(() => {
      if (resizeObserver != null) {
        resizeObserver.unobserve(el);
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    });

    /** 当数据发生变化时 */
    watch(props.list, () => nextTick(expandDefault));

    return {
      scrollWrapperHeight,
      /**
       * ListView被点击时触发
       * @param event {MouseEvent}               鼠标事件
       * @param data {{name:String,items:Array}} 鼠标所击对应的数据项
       * @param index {Number}                   鼠标所击对应的数据项索引
       */
      onClick: (event, data, index) => {
        event.stopPropagation();
        let nodes = el.querySelectorAll('.list-view');
        let node = event.target, classList = node.classList;
        let parent = classList.contains('list-view') ? node : node.parentNode;

        if (classList.contains('item')) {
          // 获取所有选中的ListView的子项
          nodes = el.querySelectorAll('.list-view .item.selected');
          // 移除选中class标记
          nodes.forEach(node => node.classList.remove('selected'));
          // 强制为当前所点击ListView子项添加选中class标记
          classList.toggle('selected', true);
          let current = data.items[node.getAttribute('data-index')];
          if (selectedItem.value !== current) {
            context.emit('change', selectedItem = current, data, index);
          }
          return;
        }

        for (let item of nodes) {
          if (parent === item) {
            item.classList.toggle('expand');
          } else {
            item.classList.toggle('expand', false);
          }
        }
      }
    };
  }
}
</script>
