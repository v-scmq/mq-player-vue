<template>
  <div class="table" tabindex="0" @keydown="onKeydown" :style="{ '--table-cell-height': `${cellHeight}px` }">
    <!-- 表格列信息 -->
    <div class="table-column-wrapper" :style="{ gridTemplateColumns: `${columnWidths} ${gutterWidth}` }">
      <div class="table-cell flex selection" v-if="selection">
        <check-box v-model="isSelectAll" :disabled="data.length < 1" @update:modelValue="headerCheckChange" />
      </div>

      <div class="table-cell" :class="{ flex: column.flex }" v-for="(column, index) in columns" :key="index">
        {{ column.type === 'index' ? data.length : column.title }}
      </div>

      <div class="table-cell gutter">+</div>
    </div>

    <!-- 表格内容虚拟滚动部分 -->
    <div ref="scrollWrapper" style="flex: auto; overflow: hidden auto; position: relative" @scroll="updateVisibleData">
      <div style="position: absolute; left: 0; right: 0; z-index: -1" :style="{ minHeight: `${maxScrollHeight}px` }" />

      <!-- 表格内容部分  -->
      <div
        class="content-wrapper"
        style="display: grid; position: sticky; top: 0"
        @click="onTableCellClick"
        @pointermove="onHover"
        @pointerleave="hoverRow = -1"
        @touchend="infiniteScrollEmitter"
        @wheel="infiniteScrollEmitter"
        :style="{ gridTemplateColumns: columnWidths, paddingRight: hasScrollbar ? null : gutterWidth }"
      >
        <!-- 单元格 -->
        <template v-for="(row, rowIndex) in visibleData" :key="rowIndex">
          <div
            class="table-cell flex selection"
            v-if="selection"
            :data-row="rowIndex"
            :class="{ selected: selectedItems[rowIndex + offsetIndex], hover: hoverRow === rowIndex }"
          >
            <check-box
              v-model="selectedItems[rowIndex + offsetIndex]"
              @update:modelValue="onItemCheckChanged(rowIndex)"
            />
          </div>

          <div
            class="table-cell"
            :data-row="rowIndex"
            :key="`${rowIndex}-${columnIndex}`"
            v-for="(column, columnIndex) in columns"
            :class="{
              flex: column.flex,
              selected: selectedItems[rowIndex + offsetIndex],
              hover: hoverRow === rowIndex
            }"
          >
            <slot :name="column.property" :item="row">{{ valueGetters[columnIndex](row, rowIndex, column) }}</slot>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, computed, watch, defineComponent, onMounted, onBeforeUnmount, PropType } from 'vue';

import { TableColumn, TableRow, CellValueGetter } from './types';

export default defineComponent({
  name: 'TableView',

  props: {
    /* 表格内容部分的行单元格高度 */
    cellHeight: { type: Number, default: 36 },
    /* 表格列信息 */
    columns: { type: Array as PropType<TableColumn[]>, required: true },
    /* 表格数据 */
    data: { type: Array as PropType<TableRow[]>, required: true },
    /* 是否开启表格复选框 */
    selection: { type: Boolean, default: false }
  },

  emits: [
    /** 行单元格点击事件 */ 'row-click',
    /** 行单元格双击事件 */ 'row-dblclick',
    /** 无限滚动 */ 'infinite-scroll'
  ],

  setup(props, { emit }) {
    //列标题尾部填充单元格宽度
    const gutterWidth = ref('0px');
    // 是否有垂直滚动条
    const hasScrollbar = ref(false);
    // 已滚动的行起始索引
    const offsetIndex = ref(0);
    // 维护可见数据
    const visibleData = reactive<TableRow[]>([]);
    // 已选择的数据记录
    const selectedItems = reactive<{ [key: string]: boolean }>({});
    // 正处于指针设备悬浮上的行索引
    const hoverRow = ref(-1);
    // 是否全选(表头中的checkbox)
    const isSelectAll = ref(false);

    // 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度
    const maxScrollHeight = computed(() => props.data.length * props.cellHeight);

    // 列宽 => grid-template-columns: minmax(100px, 1fr) 100px 1fr ;
    const columnWidths = computed(() => {
      const { selection, columns } = props;
      const width = columns.map(column => column.width || '1fr').join(' ');
      // 复选框列默认为40px
      return selection ? `40px ${width}` : width;
    });

    // 获取单元格值的getter. 已废弃深度获取值, 如 column:{property: 'singer.name'},
    //                      推荐使用 column:{ valueGetter: item => item.singer?.name)
    const valueGetters = computed<CellValueGetter[]>(() =>
      props.columns.map(column => column.valueGetter || (column.type === 'index' ? getSequenceValue : getPropertyValue))
    );

    // 组件内部滚动元素引用 (相关文档 => https://v3.cn.vuejs.org/guide/composition-api-template-refs.html)
    const scrollWrapper = ref(null as unknown as HTMLElement);

    // 标记是否滚到底部
    let isAtBottom = false;
    // 可视区域单元格数量
    let visibleRowCount = 0;
    // 表格内容滚动元素的高度
    let scrollWrapperHeight = 1;
    // 组件根元素resize观察者
    let resizeObserve: ResizeObserver | null;
    // 无限滚动计时器
    let infiniteScrollTimer: number | null = null;

    /**
     * 获取序号列单元格值
     *
     * @param item 当前行单元格数据对象
     * @param index 当前行单元格索引
     * @return {string} 当前行单元格序号字符串
     */
    const getSequenceValue = (item: TableRow, index: number) => {
      return (index = ++index + offsetIndex.value) < 10 ? `0${index}` : index;
    };

    /**
     * 获取单元格的普通属性值
     *
     * @param item 当前行单元格数据对象
     * @param index 当前行单元格索引
     * @param column 当前单元格所在列配置信息
     * @return {string | number | boolean} 当前单元格的值
     */
    const getPropertyValue = (item: TableRow, index: number, column: TableColumn) => {
      return item[column.property as string];
    };

    /**
     * 更新可视区域
     */
    const updateVisibleData = () => {
      const size = props.data.length;

      // 当数据总量小于等于可视区域数据量时, 直接展示所有数据
      if (size <= visibleRowCount) {
        // 重置起始索引为0
        offsetIndex.value = 0;
        // 渲染所有数据
        visibleData.splice(0, visibleData.length, ...props.data);

        // 至少有一条数据在底部
        isAtBottom = size > 0;

        return;
      }

      // 0 |-----------------|  0
      // 1 |-----------------|  40
      // 2 |-----------------|  80
      // 3 |-----------------|  120
      // 4 |-----------------|  160
      // 5 |-----------------|  200
      // 6 |-----------------|  240

      // 假设行单元格高度为40, 发生滚动后, 若 top = 50, 则
      // start = top:50 / cellHeight:40 = 1

      // 获取已滚动距离
      const top = Math.ceil(scrollWrapper.value.scrollTop);

      // 可视数据起始索引、可视数据结束索引
      let start, end;

      // 是否滚动到底部, 对于出现滚动条元素的元素 scrollTop + height - scrollHeight = 0
      // 注意: 理论上使用 === 即可, 但是在某些情况下(如缩放,见MDN)scrollTop可能出现小数, 因此最好使用 >=
      isAtBottom = top >= maxScrollHeight.value - scrollWrapperHeight;

      // 若滚动已到达底部
      if (isAtBottom) {
        end = size;
        start = end - visibleRowCount;
      } else {
        start = (top / props.cellHeight) ^ 0;
        end = start + visibleRowCount;
      }

      // 获取可视区域对应的数据([start,end]范围内的数据)
      visibleData.splice(0, visibleData.length, ...props.data.slice(start, end));

      // 重置起始索引为start
      offsetIndex.value = start;

      // 注: *** 已使用css position:sticky + top:0 固定在可视区域; 以下方案不再使用 ***
      // 将整个内容部分在y轴方向平移到可视区域
      // contentWrapper.style.transform = `translate3d(0, ${top}px, 0)`;
    };

    /**
     * 列标题上的复选框勾选改变事件
     *
     * @param newValue 勾选状态
     */
    const headerCheckChange = (newValue: boolean) => {
      const map = selectedItems;
      // 获取所有的key(string)
      const keys = Object.keys(map) as unknown as number[];

      if (!newValue) {
        keys.forEach(key => delete map[key]);
      } else {
        let max = props.data.length - 1;
        // key:string ^ 0 => number
        keys.forEach(key => (0 ^ key) > max && delete map[key]);

        for (; max >= 0; --max) {
          map[max] = true;
        }
      }
    };

    /** 选择所有单元格 */
    const selectAll = () => {
      props.data.length && props.selection && headerCheckChange((isSelectAll.value = true));
    };

    /** 清除所有选择 */
    const clearSelection = () => {
      headerCheckChange((isSelectAll.value = false));
    };

    onMounted(() => {
      const element = scrollWrapper.value;

      // 计算滚动条宽度
      let overflowY = element.style.overflowY;
      element.style.overflowY = 'scroll';

      // offsetWidth = 内容(包含滚动条) + padding + border ; clientWidth = 内容宽度 + padding
      gutterWidth.value = `${element.offsetWidth - element.clientWidth}px`;
      element.style.overflowY = overflowY;

      /** 当根元素宽高发生变化时,回调此方法 */
      resizeObserve = new ResizeObserver(([{ target, contentRect }]) => {
        // 获取滚动元素高度
        const height = Math.max(1, contentRect.height);

        // 是否可滚动
        const scrollable = (target as HTMLElement).offsetWidth - (target as HTMLElement).clientWidth > 0;

        // 若 更新滚动条是否存在的标记 发生变化, 则更新它
        if (hasScrollbar.value !== scrollable) {
          hasScrollbar.value = scrollable;
        }

        scrollWrapperHeight = height;
        // 计算可视行单元格数量
        const count = Math.ceil(height / props.cellHeight);

        // 若可视行单元格数量发生变化
        if (visibleRowCount !== count) {
          visibleRowCount = count;

          // 更新可视区域数据
          updateVisibleData();
        }
      });

      resizeObserve.observe(element);
    });

    // 组件被卸载前, 解除引用
    onBeforeUnmount(() => {
      resizeObserve && resizeObserve.disconnect();

      scrollWrapper.value = isAtBottom = infiniteScrollTimer = scrollWrapperHeight = resizeObserve = null as any;
    });

    // 监听表格数据变化, 更新可视区域数据
    watch(props.data, updateVisibleData);
    // 观察selection属性变化, 无论是开启或关闭都清除所选
    watch(() => props.selection, clearSelection);

    return {
      // 滚动元素引用
      scrollWrapper,
      columnWidths,
      // 列标题尾部填充单元格宽度
      gutterWidth,
      // 已滚动的行起始索引
      offsetIndex,
      // 维护可见数据
      visibleData,
      // 已选择的数据记录
      selectedItems,
      // 正处于指针设备悬浮上的行索引
      hoverRow,
      // 是否全选
      isSelectAll,

      /** 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度 */
      maxScrollHeight,
      // 是否有垂直滚动条
      hasScrollbar,
      valueGetters,

      updateVisibleData,
      headerCheckChange,

      /**
       * 行单元格选中状态改变事件回调
       *
       * @param index 行单元格索引(传入的只是在可视区域的索引)
       */
      onItemCheckChanged(index: number) {
        // 转换为实际行单元格索引
        index += offsetIndex.value;

        // 若当前行取消选择(true=>false)
        if (!selectedItems[index]) {
          delete selectedItems[index];
        }

        // 若勾选则,放入选择记录列表
        isSelectAll.value = Object.keys(selectedItems).length === props.data.length;
      },

      /**
       * 表格单元格被点击时的回调
       *
       * @param event 指针设备点击事件
       */
      onTableCellClick(event: PointerEvent | MouseEvent) {
        let target = event.target as HTMLElement,
          count = event.detail;
        // 获取已有的class
        const classList = target.classList;

        // 若不是单元格 且不是 内容元素, 那么查找单元格
        if (!classList.contains('table-cell') && !classList.contains('content-wrapper')) {
          const parent = target.closest<HTMLElement>('.table-cell');
          target = parent || target;
        }

        // 数据行索引(string)
        const value = target.getAttribute('data-row');

        if (!value) {
          return;
        }

        // 转换为实际的行单元格索引
        const index = ((value as unknown as number) ^ 0) + offsetIndex.value;

        // 若是单击
        if (count === 1) {
          emit('row-click', props.data, index);
          let map = selectedItems;

          // --------若是多选模式(启用表头复选框时,即是多选模式)-------
          if (props.selection) {
            // 若选中则取消选中(移除索引)
            if (map[index]) {
              delete map[index];
            } else {
              map[index] = true;
            }

            isSelectAll.value = Object.keys(map).length === props.data.length;

            return;
          }

          // ---------------否则是单选模式----------------
          if (isSelectAll.value) {
            isSelectAll.value = false;
          }

          // 若之前选择过记录大于1,则废弃原有选择记录,保留当前行作为选择记录;
          Object.keys(map).forEach(key => delete map[key]);
          // 将当前行数据设置为选中
          map[index] = true;
        } else if (count === 2) {
          emit('row-dblclick', props.data, index);
        }
      },

      /**
       * table组件键盘快捷键, table组件获得焦点时(必须有tabindex属性)
       *
       * @param {KeyboardEvent} event 键盘按键事件
       */
      onKeydown(event: KeyboardEvent) {
        // 对于出现滚动条的元素的scrollTop值无需检查值范围的合法性,因为元素内部已做控制
        switch (event.key || '') {
          case 'PageUp': // pageUp键滚动到上一页单元格
            return void (scrollWrapper.value.scrollTop -= props.cellHeight * visibleRowCount);
          case 'PageDown': // pageDown键滚动到下一页单元格
            return void (scrollWrapper.value.scrollTop += props.cellHeight * visibleRowCount);
          case 'ArrowUp': // 上方向键滚动到上一行单元格
            return void (scrollWrapper.value.scrollTop -= props.cellHeight);
          case 'ArrowDown': // 下方向键滚动到下一行单元格
            return void (scrollWrapper.value.scrollTop += props.cellHeight);
          case 'Home': // home键滚动到第一行单元格
            return scrollWrapper.value.scrollTo(0, 0); // ({left:0, top:0, behavior:'smooth'})
          case 'End': // end键滚动最后一行单元格
            return scrollWrapper.value.scrollTo(0, maxScrollHeight.value);
          case 'a':
          case 'A': // Ctrl + A 组合键全选所有单元格 ; Ctrl + Shirt + A 组合键全不选
            return void (event.ctrlKey && (event.shiftKey ? clearSelection() : selectAll()));
        }
      },

      onHover(event: Event) {
        let element: HTMLElement | null = event.target as HTMLElement;

        // 若不是TableCell, 则尝试从上向上逐层查找元素, 直到找到TableCell 或 找不到而返回null
        if (!element.classList.contains('table-cell')) {
          element = element.closest('.table-cell');
        }

        const value = element && element.getAttribute('data-row');

        hoverRow.value = value ? (value as unknown as number) ^ 0 : -1;
      },

      /**
       * (无限滚动事件Emitter) 满足以下条件时, 将发出无限滚动事件
       *
       * 1.当视图可视区域已将数据滚动到最底部
       * 2.在触摸设备上通过从下向上拖动 或 在非触摸设备上使用滚轮向下滚动
       *
       * @param {WheelEvent | TouchEvent} event 事件对象
       */
      infiniteScrollEmitter(event: WheelEvent | TouchEvent) {
        /*
          TODO: 触摸设备上拖动方向检测, 可在touchstart 和 touchend 上 比较2次的clientY ;
                即使滚动到底底部, 此时从上向下拖动似乎并不会引起isAtBottom的错误判断, 因为监听的时拖动结束
                拖动开始时,内容就开始发生了滚动,从而isAtBottom是false .

         */
        // 若没有滚动到底部, 则什么也不做
        if (!isAtBottom || (event as WheelEvent).deltaY <= 0) {
          return;
        }

        // 若计时器正在使用,则清除计时器
        if (infiniteScrollTimer !== null) {
          clearTimeout(infiniteScrollTimer);
          infiniteScrollTimer = null;
        }

        infiniteScrollTimer = window.setTimeout(() => {
          infiniteScrollTimer = null;
          emit('infinite-scroll');
        }, 500);
      }
    };
  }
});
</script>
