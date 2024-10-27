<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { PropType } from 'vue';
import type { AccordionDataGroup } from './types';

defineProps({
  list: { type: Array as PropType<AccordionDataGroup[]>, required: true }
});

const emit = defineEmits(['change']);

// 组件高度
const scrollWrapperHeight = ref(0);
// 主列表项已展开的索引
const expandedIndex = ref(0);
// 子列表项被选中的索引(分类组索引-子分类索引)
const selectedId = ref('0-0');
// 组件根元素引用
const el = ref(null as any as HTMLElement);
// 组件根元素Resize观察者
let resizeObserver: ResizeObserver | null;

onMounted(() => {
  // 当根元素宽高发生变化时,回调此方法以计算滚动盒子内部高度
  resizeObserver = new ResizeObserver(([entry]) => {
    // 获取组件根节点 和 组件根节点的高度
    let node = entry.target as HTMLElement,
      height = node.offsetHeight;
    // 获取所有标题层子节点
    let nodes = node.querySelectorAll<HTMLElement>('.list-view .titled-pane');
    // 滚动高度 = 根节点高度 - 所有标题层子节点高度
    nodes.forEach(node => (height -= node.offsetHeight));
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

/**
 * ListView被点击时触发
 *
 * @param event 指针事件
 * @param data 所点击对应的数据项
 * @param index 所点击对应的数据项索引
 */
const onClick = (event: PointerEvent | MouseEvent, data: AccordionDataGroup, index: number) => {
  event.stopPropagation();

  const node = event.target as HTMLElement;
  const dataIndex = node.getAttribute('data-index');

  if (dataIndex) {
    const itemIndex = Number(dataIndex);
    const newId = `${index}-${itemIndex}`;

    if (selectedId.value !== newId) {
      selectedId.value = newId;
      emit('change', data.items[itemIndex], data, index);
    }
  } else {
    // 若当前分类组已被展开,那么折叠它, 否则展开它
    expandedIndex.value = expandedIndex.value === index ? -1 : index;
  }
};
</script>

<template>
  <div
    ref="el"
    class="c-accordion col"
    :style="{ '--accordion-scroll-wrapper-height': `${scrollWrapperHeight}px` }"
  >
    <div
      class="c-list-view col"
      v-for="(data, groupIndex) in list"
      @click="onClick($event, data, groupIndex)"
      :class="{ expand: expandedIndex === groupIndex }"
      :key="groupIndex"
    >
      <div class="row titled-pane">{{ data.title }}</div>

      <div class="col scroll-wrapper">
        <div
          class="item"
          v-for="(item, index) in data.items"
          :key="index"
          :data-index="index"
          :class="{ selected: selectedId === `${groupIndex}-${index}` }"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
