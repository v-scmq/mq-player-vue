<template>
  <div class='table' tabindex='0' ref='el' @keydown='onKeydown' :style='{"--table-cell-height":`${cellHeight}px`}'>
    <!-- 表格列信息 -->
    <div class='table-row-columns' :style='{gridTemplateColumns:`${columnWidths} ${gutterWidth}`}'>
      <div class='table-cell' v-for='(column,index) in columns' :key='index'>
        <check-box v-if="column.type === 'checkbox' " v-model='isSelectAll' @update:modelValue='headerCheckChange'/>
        <template v-else>{{ column.type === 'index' ? data.length : column.title }}</template>
      </div>

      <div class='table-cell gutter'>+</div>
    </div>

    <!-- 表格内容虚拟滚动部分 -->
    <div class='scroll-wrapper' @scroll='updateVisibleData' style='flex:auto;overflow-y:auto;position:relative'>
      <div style='position:absolute;left:0;right:0;z-index:-1;' :style='{minHeight:`${maxScrollHeight}px`}'/>
      <!-- 表格内容部分  -->
      <div class='content-wrapper' style='display:grid;position:sticky;top:0' @click='onTableCellClick'
           :style='{gridTemplateColumns:columnWidths, paddingRight:hasScrollbar ? null : gutterWidth}'
           @pointermove='onHover'>

        <!-- 单元格 -->
        <template v-for='(item, row) in visibleData'>
          <div class='table-cell' :key='`${row}-${col}`' v-for='(column, col) in columns' :data-row='row'
               :class='{selected: selectedItems[row + offsetIndex], hover:hoverRow ===row}'>
            <check-box v-if="column.type==='checkbox'" v-model='selectedItems[row + offsetIndex]'
                       @update:modelValue='onItemCheckChanged(row)'/>
            <slot v-else :name='column.property' :item='item'> {{ valueGetters[col](item, column, row) }}</slot>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, reactive, computed, watch, getCurrentInstance, onMounted, onBeforeUnmount} from 'vue';

/**
 * @typedef {Object} TableRowData 表格行单元格数据对象
 *
 * @property {any} [key:string] 数据取值属性
 */

/**
 *  @typedef {(item:TableRowData, column:TableColumn, rowIndex:number) => any} CellValueGetter
 */

/**
 * @typedef {Object} TableColumn 表格列信息
 *
 * @property {string | undefined} title 列标题
 * @property {'checkbox' | 'index' | undefined} type 列类型(若是 'checkbox', 则则指定标题和单元格取值相关属性都无效)
 * @property {string | undefined} width 列宽,默认为 1fr; 取值参考{@link CSSStyleDeclaration.gridTemplateColumns}
 * @property {string | undefined} property 单元格取值属性名称
 * @property {CellValueGetter | undefined} valueGetter 自定义单元格取值方法
 */

export default {
  name: 'TableView',
  props: {
    /* 表格列信息 */
    columns: {default:/** @type {TableColumn[]} */ []},
    /* 表格内容部分的行单元格高度 */
    cellHeight: {type: Number, default: 40},
    /* 表格数据 */
    data: {default: /** @type {TableRowData[]} */ []}
  },

  emits: [
    /** 行单元格点击事件 */ 'row-click',
    /** 行单元格双击事件 */ 'row-dblclick',
    /** 无限滚动 */ 'infinite-scroll'
  ],

  setup(props, {emit}) {
    //列标题尾部填充单元格宽度
    const gutterWidth = ref('0px');
    // 可视区域单元格数量
    const visibleRowCount = ref(0);
    // 已滚动的行起始索引
    const offsetIndex = ref(0);
    // 维护可见数据
    const visibleData = reactive([]);
    // 已选择的数据记录
    const selectedItems = reactive({});
    // 正处于指针设备悬浮上的行索引
    const hoverRow = ref(-1);
    // 是否全选
    const isSelectAll = ref(false);

    // 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度
    const maxScrollHeight = computed(() => props.data.length * props.cellHeight);
    // 检测是否是多选模式
    const isMultipleSelect = computed(() => props.columns.find(column => column.type === 'checkbox'));
    // 列宽 => grid-template-columns: minmax(100px, 1fr) 100px 1fr ;
    const columnWidths = computed(() => props.columns.map(column => column.width || '1fr').join(' '));
    // 是否有垂直滚动条
    const hasScrollbar = computed(() => props.data.length > visibleRowCount.value);

    // 获取单元格值的getter. 已废弃深度获取值, 如 column:{property: 'singer.name'},
    //                      推荐使用 column:{ valueGetter: item => item.singer?.name)
    /** @type {ComputedRef<CellValueGetter[]>} */
    const valueGetters = computed(() => props.columns.map(column =>
        column.valueGetter || (column.type === 'checkbox' ? null :
            column.type === 'index' ? getSequenceValue : getPropertyValue)
    ));

    // 表格内容滚动元素的高度
    let scrollWrapperHeight = 1;

    let resizeObserve, el, scrollWrapper;

    // 无限滚动计时器
    let infiniteScrollTimer = null;

    /**
     * 获取序号列单元格值
     *
     * @param {Object} item   当前行单元格数据对象
     * @param {Object} column 当前单元格所在列配置信息
     * @param {number} index  当前行单元格索引
     * @return {string}       当前行单元格序号字符串
     */
    const getSequenceValue = (item, column, index) => {
      return (index = ++index + offsetIndex.value) < 10 ? `0${index}` : index;
    };

    /**
     * 获取单元格的普通属性值
     *
     * @param {Object} item      当前行单元格数据对象
     * @param {Object} column    当前单元格所在列配置信息
     * @return {string | number} 当前单元格的值
     */
    const getPropertyValue = (item, column) => {
      return item[column.property];
    };

    /**
     * 更新可视区域
     *
     * @param {Event} event 滚动事件
     */
    const updateVisibleData = (event = null) => {
      // 当数据总量小于等于可视区域数据量时, 直接展示所有数据
      if (!hasScrollbar.value) { // props.data.length <= visibleRowCount.vue
        // 重置起始索引为0
        offsetIndex.value = 0;
        // 渲染所有数据
        visibleData.splice(0, visibleData.length, ...props.data);

        // 若计时器正在使用,则清除计时器
        if (infiniteScrollTimer !== null) {
          clearTimeout(infiniteScrollTimer);
          infiniteScrollTimer = null;
        }

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
      const top = scrollWrapper.scrollTop;

      // 可视数据起始索引、可视数据结束索引
      let start, end;

      // 是否滚动到底部, 对于出现滚动条元素的元素 scrollTop + height - scrollHeight = 0
      // 注意: 理论上使用 === 即可, 但是在某些情况下(如缩放,见MDN)scrollTop可能出现小数, 因此最好使用 >=
      const isAtBottom = top + scrollWrapperHeight >= maxScrollHeight.value;

      // 若滚动已到达底部
      if (isAtBottom) {
        end = props.data.length;
        start = end - visibleRowCount.value;

      } else {
        start = (top / props.cellHeight) ^ 0;
        end = start + visibleRowCount.value;
      }

      // 获取可视区域对应的数据([start,end]范围内的数据)
      visibleData.splice(0, visibleData.length, ...props.data.slice(start, end));

      // 重置起始索引为start
      offsetIndex.value = start;

      // 注: *** 已使用css position:sticky + top:0 固定在可视区域; 以下方案不再使用 ***
      // 将整个内容部分在y轴方向平移到可视区域
      // contentWrapper.style.transform = `translate3d(0, ${top}px, 0)`;

      // 若计时器正在使用,则清除计时器
      if (infiniteScrollTimer !== null) {
        clearTimeout(infiniteScrollTimer);
        infiniteScrollTimer = null;
      }

      // 若滚动到底部(event存在的情况下,可以证明是由鼠标滚动引起的)
      if (event && isAtBottom) {
        infiniteScrollTimer = setTimeout(() => {
          infiniteScrollTimer = null;
          emit('infinite-scroll')
        }, 500);
      }
    };

    /**
     * 表格单元格被点击时的回调
     *
     * @param {PointerEvent} event 指针设备点击事件
     */
    const onTableCellClick = (event) => {
      let {detail,/** @type {HTMLElement} */ target} = event;
      // 获取已有的class
      const className = target.className;

      // 若不是单元格 且不是 内容元素, 那么查找单元格
      if (!className.includes('table-cell') && !className.includes('content-wrapper')) {
        // 若未找到, 则什么也不做
        if ((target = target.closest('.table-cell')) == null) {
          return;
        }
      }

      /** @type {Attr | string | null} */
      let value = target.attributes.getNamedItem('data-row');

      if (!value || !(value = value.value)) {
        return;
      }

      // 转换为实际的行单元格索引
      const index = (value ^ 0) + offsetIndex.value;

      // 若是单击
      if (detail === 1) {
        emit('row-click', index);
        let map = selectedItems;

        // --------若是多选模式,即启用表头复选框时,即是多选模式-------
        if (isMultipleSelect.value) {
          // 若选中则取消选中(移除索引)
          if (map[index]) {
            delete map[index];
          } else {
            map[index] = true;
          }
          return isSelectAll.value = Object.keys(map).length === props.data.length;
        }

        // ---------------否则是单选模式----------------
        if (isSelectAll.value) {
          isSelectAll.value = false;
        }

        // 若之前选择过记录大于1,则废弃原有选择记录,保留当前行作为选择记录;
        Object.keys(map).forEach(key => delete map[key]);
        // 将当前行数据设置为选中
        map[index] = true;

      } else if (detail === 2) {
        emit('row-dblclick', index);
      }
    };

    /**
     * 行单元格选中状态改变事件回调
     * @param {number} index 行单元格索引(传入的只是在可视区域的索引)
     */
    const onItemCheckChanged = index => {
      // 转换为实际行单元格索引
      index += offsetIndex.value;

      // 若当前行取消选择(true=>false)
      if (!selectedItems[index]) {
        delete selectedItems[index];
      }

      // 若勾选则,放入选择记录列表
      isSelectAll.value = Object.keys(selectedItems).length === props.data.length;
    };

    /**
     * 列标题上的复选框勾选改变事件
     * @param {boolean} newValue 勾选状态
     */
    const headerCheckChange = newValue => {
      let map = selectedItems, keys = Object.keys(map);

      if (!newValue) {
        keys.forEach(key => delete map[key]);

      } else {
        let max = props.data.length - 1;
        keys.forEach(key => key > max ? delete map[key] : null);

        for (; max >= 0; --max) {
          map[max] = true;
        }
      }
    };

    /**
     * table组件键盘快捷键
     * table组件获得焦点时(必须有tabindex属性)
     * @param {KeyboardEvent} event 键盘按键事件
     */
    const onKeydown = event => {
      // 对于出现滚动条的元素的scrollTop值无需检查值范围的合法性,因为元素内部已做控制
      switch (event.key) {
        case 'PageUp':    // pageUp键滚动到上一页单元格
          return scrollWrapper.scrollTop -= props.cellHeight * visibleRowCount.value;
        case 'PageDown':  // pageDown键滚动到下一页单元格
          return scrollWrapper.scrollTop += props.cellHeight * visibleRowCount.value;
        case 'ArrowUp':   // 上方向键滚动到上一行单元格
          return scrollWrapper.scrollTop -= props.cellHeight;
        case 'ArrowDown': // 下方向键滚动到下一行单元格
          return scrollWrapper.scrollTop += props.cellHeight;
        case 'Home':      // home键滚动到第一行单元格
          return scrollWrapper.scrollTo(0, 0);
        case 'End':       // end键滚动最后一行单元格
          return scrollWrapper.scrollTo(0, maxScrollHeight.value);
        case 'A':         // Ctrl + A 组合键全选所有单元格
          return event.ctrlKey ? selectAll() : null;
      }
    };

    /** 选择所有单元格 */
    const selectAll = () => {
      if (props.data.length && isMultipleSelect.value) {
        headerCheckChange(isSelectAll.value = true);
      }
    };


    /** 清除所有选择 */
    // const clearSelection = () => {
    //   headerCheckChange(isSelectAll.value = false);
    // };

    onMounted(() => {
      /** @type {HTMLElement | any} */
      el = getCurrentInstance().refs.el;
      scrollWrapper = el.querySelector('.scroll-wrapper');

      // 计算滚动条宽度
      let overflowY = el.style.overflowY;
      el.style.overflowY = 'scroll';

      // offsetWidth = 内容(包含滚动条) + padding + border ; clientWidth = 内容宽度 + padding
      gutterWidth.value = `${el.offsetWidth - el.clientWidth}px`;
      el.style.overflowY = overflowY;

      /** 当根元素宽高发生变化时,回调此方法 */
      resizeObserve = new ResizeObserver(() => {
        // 获取滚动元素高度
        const height = Math.max(1, scrollWrapper.offsetHeight);

        // 若高度发生变化
        if (scrollWrapperHeight !== height) {
          // 更新滚动元素的高度缓存值
          scrollWrapperHeight = height;

          // 计算可视行单元格数量
          const count = Math.ceil(height / props.cellHeight);

          // 若可视行单元格数量发生变化
          if (visibleRowCount.value !== count) {
            visibleRowCount.value = count;

            // 更新可视区域数据
            updateVisibleData();
          }
        }
      });

      resizeObserve.observe(el);
    });

    onBeforeUnmount(() => {
      if (resizeObserve != null) {
        resizeObserve.unobserve(el);
        resizeObserve.disconnect();
      }
      resizeObserve = scrollWrapper = null;
    });

    // 监听表格数据变化, 更新可视区域数据
    watch(props.data, updateVisibleData);

    return {
      columnWidths,
      // 列标题尾部填充单元格宽度
      gutterWidth,

      // 可视区域单元格数量
      visibleRowCount,
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

      /** 检测是否是多选模式 */
      isMultipleSelect,
      /** 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度 */
      maxScrollHeight,
      // 是否有垂直滚动条
      hasScrollbar,

      updateVisibleData,
      onTableCellClick,
      onItemCheckChanged,
      onKeydown,
      headerCheckChange,
      valueGetters,

      onHover(event) {
        const attr = event.target.attributes
            .getNamedItem('data-row');
        const value = attr && attr.value;
        hoverRow.value = value ? (value ^ 0) : -1;
      }
    };
  }
}
</script>
