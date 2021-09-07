<template>
  <!-- 使用 getCurrentInstance().refs.el 替代 getCurrentInstance().vnode.el -->
  <div class="table" tabindex="0" ref="el" @keydown="onKeydown" :style="{'--table-cell-height':`${cellHeight}px`}">
    <!-- 表格列信息 -->
    <div class="column">
      <template v-for="(column,index) in columns" :key="index">
        <div class="table-cell" :style="{flex:column.flex}">
          <check-box v-if="column.type === 'checkbox' " v-model:value="isSelectAll" @update:value="headerCheckChange"/>
          <template v-else>
            {{ column.type === 'index' ? data.length : column.title }}
          </template>
        </div>
      </template>
      <div class="table-cell gutter" :style="{width:gutterWidth}">
        <div>
          <svg width="1em" height="1em" viewBox="0 0 16 16">
            <path
                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 表格内容虚拟滚动部分 -->
    <div class="scroll-wrapper" @scroll="updateVisibleData" style="flex:auto;overflow-y:auto;position:relative">
      <div style="position:absolute;left:0;right:0;z-index:-1;" :style="{minHeight:`${maxScrollHeight}px`}"/>
      <!-- 表格内容部分  -->
      <div class="content-wrapper" :style="{paddingRight:data.length < visibleRowCount ? gutterWidth : null}">
        <!-- 行单元格 -->
        <div class="table-row-cell" :key="row" v-for="(item,row) in visibleData"
             :class="{'selected':selectedItems[row+offsetIndex]}" @click="onTableRowClicked($event,row)">
          <!-- 单元格 -->
          <div class="table-cell" :key="col" v-for="(column,col) in columns" :style="{flex:column.flex}">
            <check-box v-if="column.type==='checkbox'" v-model:value="selectedItems[row+offsetIndex]"
                       @update:value="onItemCheckChanged(row)"/>
            <slot v-else :name="column.property" :item="item"> {{ column.getCellValue(item, column, row) }}</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref, reactive, computed, watch, nextTick,
  getCurrentInstance, onMounted, onBeforeUnmount,
} from "vue";

export default {
  name: "TableView",
  props: {
    /* 表格列信息 */
    columns: {type: Array},
    /* 表格内容部分的行单元格高度 */
    cellHeight: {type: Number, default: 40},
    /* 表格数据 */
    data: {type: Array, default: () => []}
  },

  emits: {
    'row-click': null,
    'row-dblclick': null
  },

  setup(props, context) {
    let resizeObserve, el, scrollWrapper, contentWrapper;

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
    // 是否全选
    const isSelectAll = ref(false);

    // 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度
    const maxScrollHeight = computed(() => props.data.length * props.cellHeight);
    // 检测是否是多选模式
    const isMultipleSelect = computed(() => props.columns.find(column => column.type === 'checkbox'));

    /**
     * 获取序号列单元格值
     *
     * @param item {Object}   当前行单元格数据对象
     * @param column {Object} 当前单元格所在列配置信息
     * @param index {Number}  当前行单元格索引
     * @return {String}       当前行单元格序号字符串
     */
    const getSequenceValue = (item, column, index) => {
      return (index = ++index + offsetIndex.value) < 10 ? `0${index}` : index;
    };

    /**
     * 获取单元格的普通属性值
     *
     * @param item {Object}    当前行单元格数据对象
     * @param column {Object}  当前单元格所在列配置信息
     * @return {String|Number} 当前单元格的值
     */
    const getPropertyValue = (item, column) => {
      return item[column.property];
    };

    /**
     * 获取单元格的多级属性值(当某一级属性值不能获取时,将中断获取)
     *
     * @param item {Object}           当前行单元格数据对象
     * @param column {Object}         当前单元格所在列配置信息
     * @return {String|Number|Object} 当前单元格的值
     */
    const getDeepPropertyValue = (item, column) => {
      let value = item;
      for (let property of column._properties) {
        if (value) {
          value = value[property];
        } else {
          return null;
        }
      }
      return value;
    };

    /**
     * 更新可视区域
     */
    const updateVisibleData = () => {
      let top = scrollWrapper.scrollTop;
      let start = Math.floor(top / props.cellHeight);

      // 获取可视区域对应的数据([start,end]范围内的数据)
      let list = props.data.slice(offsetIndex.value = start, start + visibleRowCount.value);
      visibleData.splice(0, visibleData.length, ...list);

      // 出现滚动条元素的scrollTop + 滚动元素的scrollHeight 可以检测是否滚动到底部
      top = (top + contentWrapper.scrollHeight) > maxScrollHeight.value ? start * props.cellHeight : top;
      // 将整个内容部分在y轴方向平移到可视区域
      contentWrapper.style.transform = `translate3d(0, ${top}px, 0)`;
    };

    /**
     * 表格行单元个被点击时的回调
     * @param event {MouseEvent} 事件
     * @param index {Number} 被点击行单元格索引(传入的只是在可视区域的索引)
     */
    const onTableRowClicked = (event, index) => {
      // 转换为实际的行单元格索引
      index += offsetIndex.value;

      // 若是单击
      if (event.detail === 1) {
        context.emit('row-click', index);
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

      } else if (event.detail === 2) {
        context.emit('row-dblclick', index);
      }
    };

    /**
     * 行单元格选中状态改变事件回调
     * @param index {Number} 行单元格索引(传入的只是在可视区域的索引)
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
     * @param newValue {Boolean} 勾选状态
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
     * @param event {KeyboardEvent} 键盘按键事件
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
      contentWrapper = el.querySelector('.content-wrapper');

      let oldTableHeight = null;

      // 计算滚动条宽度
      let overflowY = el.style.overflowY;
      el.style.overflowY = 'scroll';

      // offsetWidth = 内容(包含滚动条) + padding + border ; clientWidth = 内容宽度 + padding
      gutterWidth.value = `${el.offsetWidth - el.clientWidth}px`;
      el.style.overflowY = overflowY;

      /** 当根元素宽高发生变化时,回调此方法 */
      resizeObserve = new ResizeObserver(() => {
        let height = scrollWrapper.offsetHeight;
        if (!height) {
          return
        }

        // 若高度没有发生变化
        if (oldTableHeight === height) {
          return scrollWrapper.scrollTop = offsetIndex.value * props.cellHeight;
        }

        // 若高度发生变化
        let count = Math.ceil((oldTableHeight = height) / props.cellHeight);
        // 若可视行单元格数量发生变化
        if (visibleRowCount.value !== count) {
          visibleRowCount.value = count;

          // 若没有任何数据
          if (!props.data || !props.data.length) {
            offsetIndex.value = 0;
            return visibleData.length ? visibleData.splice(0, visibleData.length) : null;
          }

          // 若所有数据小于可视行数,则全部显示
          if (props.data.length <= count) {
            offsetIndex.value = 0;
            return visibleData.splice(0, visibleData.length, ...props.data);
          }

          // 数组切片,提取填充可视范围的数据
          if (offsetIndex.value + count >= props.data.length) {
            offsetIndex.value = props.data.length - count;
          }

          let list = props.data.slice(offsetIndex.value, count + offsetIndex.value);
          visibleData.splice(0, visibleData.length, ...list);
        }
        nextTick(() => scrollWrapper.scrollTop = offsetIndex.value * props.cellHeight);

      });

      resizeObserve.observe(el);
    });

    onBeforeUnmount(() => {
      if (resizeObserve != null) {
        resizeObserve.unobserve(el);
        resizeObserve.disconnect();
      }
      resizeObserve = scrollWrapper = contentWrapper = null;
    });

    // 当新增、删除、修改列信息时,重新为列配置对象配置单元格宽度和获取值的方法.
    watch(props.columns, newColumns => {
      for (let column of newColumns) {
        column._properties ? delete column._properties : null;
        column.flex = column.width ? `0 0 ${column.width}px` : '1';

        if (column.type === 'checkbox') {
          column.getCellValue = null;
          continue;
        }

        if (column.valueGetter instanceof Function) {
          column.getCellValue = column.valueGetter;
          continue;
        }

        if (column.type === 'index') {
          column.getCellValue = getSequenceValue;
          continue;
        }

        if (!column.property.includes('.')) {
          column.getCellValue = getPropertyValue;
          continue;
        }

        // 处理列配置信息提供了多级属性名称的单元格值
        // 当某一级属性值不能获取时,将中断获取
        column._properties = column.property.split('.');
        column.getCellValue = getDeepPropertyValue;
      }
    }, {immediate: true});

    // 监听表格数据变化
    watch(props.data, newData => {
      // 更新可视区域数据
      let node = scrollWrapper, count = visibleRowCount.value;
      if (offsetIndex.value + count < newData.length) {
        updateVisibleData();
      } else {
        let oldValue = node.scrollTop;
        node.scrollTop = (newData.length - count) * props.cellHeight;
        // 若scrollTop值未发生改变,主动调用方法更新数据
        node.scrollTop === oldValue ? updateVisibleData() : null;
      }
    });

    return {
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
      // 是否全选
      isSelectAll,

      /** 检测是否是多选模式 */
      isMultipleSelect,
      /** 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度 */
      maxScrollHeight,

      updateVisibleData,
      onTableRowClicked,
      onItemCheckChanged,
      onKeydown,
      headerCheckChange,

    };
  }
}
</script>
