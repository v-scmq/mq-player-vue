<template>
  <div class='accordion v-column' ref='el' :style="{'--accordion-scroll-wrapper-height':`${scrollWrapperHeight}px`}">
    <div class='list-view v-column' v-for='(data, groupIndex) in list' @click='onClick($event, data, groupIndex)'
         :class='{expand: expandedIndex === groupIndex}' :key='groupIndex'>

      <div class='v-row titled-pane'>{{ data.title }}</div>

      <div class='v-column scroll-wrapper'>
        <div class='item' v-for='(item, index) in data.items' :key='index' :data-index='index'
             :class='{selected: selectedId === `${groupIndex}-${index}`}'>{{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {onBeforeUnmount, onMounted, ref} from 'vue';

/**
 * @typedef {Object} DataItem 手风琴子列表项信息
 *
 * @property {string | number | undefined} id 数据id
 * @property {string} name 名称
 */

/**
 * @typedef {Object} DataItemGroup 手风琴主列表项信息
 *
 * @property {string | number | undefined} id 分组id
 * @property {string} title 分组标题
 * @property {DataItem[]} items 子列表项数据信息
 */

export default {
  name: 'Accordion',
  props: {list: {default: /** @type {DataItemGroup[]} */[]}},
  emits: ['change'],

  setup(props, {emit}) {
    // 组件高度
    const scrollWrapperHeight = ref(0);
    // 主列表项已展开的索引
    const expandedIndex = ref(0);
    // 子列表项被选中的索引(分类组索引-子分类索引)
    const selectedId = ref('0-0');

    /** @type {Ref<HTMLElement | null>} */
    const el = ref(null);
    /** @type {ResizeObserver} */
    let resizeObserver;

    onMounted(() => {
      // 当根元素宽高发生变化时,回调此方法以计算滚动盒子内部高度
      resizeObserver = new ResizeObserver(([entry]) => {
        // 获取组件根节点 和 组件根节点的高度
        let node = entry.target, height = node.offsetHeight;
        // 获取所有标题层子节点
        let nodes = node.querySelectorAll('.list-view .titled-pane');
        // 滚动高度 = 根节点高度 - 所有标题层子节点高度
        nodes.forEach(node => height -= node.offsetHeight);
        // 设置滚动高度
        scrollWrapperHeight.value = height;
      });

      // 观察根节点大小变化
      resizeObserver.observe(el.value);
    });

    onBeforeUnmount(() => {
      if (resizeObserver != null) {
        resizeObserver.unobserve(el.value);
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    });

    return {
      el, scrollWrapperHeight, expandedIndex, selectedId,
      /**
       * ListView被点击时触发
       * @param {PointerEvent} event 指针事件
       * @param {DataItemGroup} data 所点击对应的数据项
       * @param {number} index 所点击对应的数据项索引
       */
      onClick: (event, data, index) => {
        event.stopPropagation();

        const node = event.target, classList = node.classList;

        if (classList.contains('item')) {
          const itemIndex = node.getAttribute('data-index') ^ 0;
          const newId = `${index}-${itemIndex}`;
          if (selectedId.value !== newId) {
            selectedId.value = newId;
            emit('change', data.items[itemIndex], data, index);
          }

        } else {
          // 若当前分类组已被展开,那么折叠它, 否则展开它
          expandedIndex.value = expandedIndex.value === index ? -1 : index;
        }
      }

    };

  }
}
</script>
