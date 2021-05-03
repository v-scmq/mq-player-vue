<template>
  <!--  增加tabindex属性,使根元素能够获得焦点 -->
  <div class="table" tabindex="0" @keydown="onKeydown" :style="{'--table-cell-height':`${cellHeight}px`}">

    <!-- 表格列信息 -->
    <div class="column">
      <template v-for="(column,index) in columns">
        <div class="table-cell" :key="index" :style="{flex:column.flex}">
          <check-box v-if="column.type === 'checkbox' " v-model="isSelectAll" @input="onSelectChange"/>
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
        <div class="table-row-cell" :key="rowIndex" v-for="(item,rowIndex) in visibleData"
             :class="{'selected':item._checked}" @click="onTableRowClicked($event,rowIndex)">
          <!-- 单元格 -->
          <div class="table-cell" :key="index" v-for="(column,index) in columns" :style="{flex:column.flex}">
            <check-box v-if="column.type==='checkbox'" v-model="item._checked" @input="onItemCheckChanged(rowIndex)"/>
            <slot v-else :name="column.property" :item="item">{{ column.getCellValue(item, column, rowIndex) }}</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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

  data: () => ({
    // dom元素宽高观察者
    $resizeObserver: null,
    // 列表题尾部填充单元格宽度
    gutterWidth: '0px',
    // 表格内容部分
    $contentWrapper: null,
    // 表格内容滚动部分
    $scrollWrapper: null,

    // 记录表格高度
    $oldTableHeight: null,
    // 可视区域单元格数量
    visibleRowCount: 0,
    // 已滚动的行起始索引
    offsetIndex: 0,
    // 维护可见数据
    visibleData: [],
    // 已选择的索引记录
    selectedIndexes: [],
    // 是否全选
    isSelectAll: null,
  }),

  created() {
    // 监听配置选项
    let options = {deep: true, immediate: true};
    // 深度监听列信息变化
    this._unWathColumn = this.$watch('columns', this.columnChanged, options);

    this.selectedIndexes.splice(0);
    // 为表格数据的生成为响应式复选框勾选 “_checked” 属性
    this.data.forEach(this.responsive);
  },

  mounted() {
    this.computeScrollWidth();

    this.$data.$scrollWrapper = this.$el.querySelector('.scroll-wrapper');
    this.$data.$contentWrapper = this.$el.querySelector('.content-wrapper');

    // this.onResize(); // ResizeObserver,会实时监听到元素宽高变化
    this.$data.$resizeObserver = new ResizeObserver(this.onResize);
    this.$data.$resizeObserver.observe(this.$el);
  },

  beforeDestroy() {
    if (this.$data.$resizeObserver != null) {
      this.$data.$resizeObserver.unobserve(this.$el);
      this.$data.$resizeObserver.disconnect();
      this.$data.$resizeObserver = null;
    }

    // 移除列信息改变监听
    if (this._unWathColumn) {
      this._unWathColumn();
      this._unWathColumn = null;
    }
  },

  computed: {
    /** 检测是否是多选模式 */
    isMultipleSelect() {
      return this.columns.find(column => column.type === 'checkbox');
    },

    /** 计算虚拟滚动部分撑开表格内容而出现滚动条的最大高度 */
    maxScrollHeight() {
      return this.data.length * this.cellHeight;
    }
  },

  watch: {
    data(newData) {
      this.selectedIndexes.splice(0);
      newData.forEach(this.responsive);

      // 更新可视区域数据
      let node = this.$data.$scrollWrapper, count = this.visibleRowCount;
      if (this.offsetIndex + count < newData.length) {
        this.updateVisibleData();
      } else {
        let oldValue = node.scrollTop;
        node.scrollTop = (newData.length - count) * this.cellHeight;
        // 若scrollTop值未发生改变,主动调用方法更新数据
        node.scrollTop === oldValue ? this.updateVisibleData() : null;
      }
    }
  },

  methods: {
    /**
     * 获取序号列单元格值
     *
     * @param item {Object}   当前行单元格数据对象
     * @param column {Object} 当前单元格所在列配置信息
     * @param index {Number}  当前行单元格索引
     * @return {String}       当前行单元格序号字符串
     */
    getSequenceValue(item, column, index) {
      return (index = ++index + this.offsetIndex) < 10 ? `0${index}` : index;
    },

    /**
     * 获取单元格的普通属性值
     *
     * @param item {Object}    当前行单元格数据对象
     * @param column {Object}  当前单元格所在列配置信息
     * @return {String|Number} 当前单元格的值
     */
    getPropertyValue(item, column) {
      return item[column.property];
    },

    /**
     * 获取单元格的多级属性值(当某一级属性值不能获取时,将中断获取)
     *
     * @param item {Object}           当前行单元格数据对象
     * @param column {Object}         当前单元格所在列配置信息
     * @return {String|Number|Object} 当前单元格的值
     */
    getDeepPropertyValue(item, column) {
      let value = item;
      for (let property of column._properties) {
        if (value) {
          value = value[property];
        } else {
          return null;
        }
      }
      return value;
    },

    /**
     * 当新增、删除、修改列信息时,重新为列配置对象配置单元格宽度和获取值的方法.
     *
     * @param newColumns {Array<Object>} 新的列配置信息
     */
    columnChanged(newColumns) {
      for (let column of newColumns) {
        delete column._properties;
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
          column.getCellValue = this.getSequenceValue;
          continue;
        }

        if (!column.property.includes('.')) {
          column.getCellValue = this.getPropertyValue;
          continue;
        }

        // 处理列配置信息提供了多级属性名称的单元格值
        // 当某一级属性值不能获取时,将中断获取
        column._properties = column.property.split('.');
        column.getCellValue = this.getDeepPropertyValue;
      }
    },

    /**
     * 若每一个选项没有 “_checked” 属性为其加上此属性,使用下划线开头是减少原有属性冲突
     * 生成响应式数据
     * @param item {Object} 为item对象添加响应式的_checked属性
     * @param index {Number} 索引
     */
    responsive(item, index) {
      if (item._checked === undefined) {
        this.$set(item, '_checked', false);
      } else if (item._checked) {
        this.selectedIndexes.push(index);
      }
    },

    /** 计算滚动条宽度 */
    computeScrollWidth() {
      let {$el: node} = this, overflowY = node.style.overflowY;
      node.style.overflowY = 'scroll';

      // offsetWidth = 内容(包含滚动条) + padding + border ; clientWidth = 内容宽度 + padding
      this.gutterWidth = `${node.offsetWidth - node.clientWidth}px`;
      node.style.overflowY = overflowY;
    },

    /** 当根元素宽高发生变化时,回调此方法 */
    onResize() {
      let height = this.$data.$scrollWrapper.offsetHeight;
      if (height) {
        // 若高度发生变化
        if (this.$data.$oldTableHeight !== height) {
          this.onHeightChanged(this.$data.$oldTableHeight = height);
          this.$nextTick(() => this.$data.$scrollWrapper.scrollTop = this.offsetIndex * this.cellHeight)
        } else {
          this.$data.$scrollWrapper.scrollTop = this.offsetIndex * this.cellHeight;
        }
      }
    },

    /** 当根元素高度发生变化时,回调此方法 */
    onHeightChanged(height) {
      let count = Math.ceil(height / this.cellHeight);
      // 若可视行单元格数量发生变化
      if (this.visibleRowCount !== count) {
        this.visibleRowCount = count;
        // 若没有任何数据
        if (!this.data || !this.data.length) {
          this.offsetIndex = 0;
          return this.visibleData = this.visibleData.length ? [] : this.visibleData;
        }

        // 若所有数据小于可视行数,则全部显示
        if (this.data.length <= count) {
          this.offsetIndex = 0;
          return this.visibleData = [...this.data];
        }

        // 数组切片,提取填充可视范围的数据
        if (this.offsetIndex + count >= this.data.length) {
          this.offsetIndex = this.data.length - count;
        }
        this.visibleData = this.data.slice(this.offsetIndex, count + this.offsetIndex);
      }
    },

    /**
     * 更新可视区域
     */
    updateVisibleData() {
      let top = this.$data.$scrollWrapper.scrollTop;
      let start = Math.floor(top / this.cellHeight);

      // 获取可视区域对应的数据([start,end]范围内的数据)
      this.visibleData = this.data.slice(this.offsetIndex = start, start + this.visibleRowCount);
      // 出现滚动条元素的scrollTop + 滚动元素的scrollHeight 可以检测是否滚动到底部
      top = (top + this.$data.$contentWrapper.scrollHeight) > this.maxScrollHeight ? start * this.cellHeight : top;
      // 将整个内容部分在y轴方向平移到可视区域
      this.$data.$contentWrapper.style.webkitTransform = `translate3d(0, ${top}px, 0)`;
    },

    /**
     * 表格行单元个被点击时的回调
     * @param event {MouseEvent} 事件
     * @param index {Number} 被点击行单元格索引(传入的只是在可视区域的索引)
     */
    onTableRowClicked(event, index) {
      // 转换为实际的行单元格索引
      index += this.offsetIndex;

      // 若是单击
      if (event.detail === 1) {
        this.$emit('row-click', index);
        let list = this.selectedIndexes, item = this.data[index];

        // --------若是多选模式,即启用表头复选框时,即是多选模式-------
        if (this.isMultipleSelect) {
          let _index = list.indexOf(index);

          // 反转勾选状态
          if ((item._checked = !item._checked)) {
            _index < 0 ? list.push(index) : null;
          } else {
            _index >= 0 ? list.splice(_index, 1) : null;
          }
          return this.isSelectAll = list.length === this.data.length;
        }

        // ---------------否则是单选模式----------------
        if (this.isSelectAll) {
          this.isSelectAll = false;
        }

        // 若之前选择过记录大于1,则废弃原有选择记录,保留当前行作为选择记录;
        // 否则直接替换原有的1个选择记录
        list.length > 1 ? this.selectedIndexes = [index] : list[0] = index;

        // 直接全部数据选中属性值设置为false
        this.data.forEach(item => item._checked = false)
        // 将当前行数据设置为选中
        this.data[index]._checked = true;

      } else if (event.detail === 2) {
        this.$emit('row-dblclick', index);
      }
    },

    /**
     * 行单元格选中状态改变事件回调
     * @param index {Number} 行单元格索引(传入的只是在可视区域的索引)
     */
    onItemCheckChanged(index) {
      // 转换为实际行单元格索引
      index += this.offsetIndex;

      // 查找当前行单元格索引是否在选择记录中已存在
      let _index = this.selectedIndexes.indexOf(index);
      if (_index > -1) {
        this.selectedIndexes.splice(_index, 1);
      }

      // 若勾选则,放入选择记录列表
      if (this.data[index]._checked) {
        this.selectedIndexes.push(index);
      }
      this.isSelectAll = this.selectedIndexes.length === this.data.length;
    },

    /**
     * 列标题上的复选框勾选改变事件
     * @param newValue {Boolean} 勾选状态
     */
    onSelectChange(newValue) {
      let list = this.selectedIndexes;
      if (newValue) {
        this.data.forEach((item, index) => {
          list[index] = index;
          item._checked = true;
        });

        // 保证选择记录总数小于等于总数据量
        if (list.length > this.data.length) {
          list.splice(this.data.length, list.length - this.data.length);
        }

      } else {
        this.data.forEach(item => item._checked = false);
        list.splice(0, list.length);
      }
    },

    /**
     * table组件键盘快捷键
     * table组件获得焦点时(必须有tabindex属性)
     * @param event {KeyboardEvent} 键盘按键事件
     */
    onKeydown(event) {
      // 对于出现滚动条的元素的scrollTop值无需检查值范围的合法性,因为元素内部已做控制
      switch (event.key) {
        case 'PageUp':    // pageUp键滚动到上一页单元格
          return this.$data.$scrollWrapper.scrollTop -= this.cellHeight * this.visibleRowCount;
        case 'PageDown':  // pageDown键滚动到下一页单元格
          return this.$data.$scrollWrapper.scrollTop += this.cellHeight * this.visibleRowCount;
        case 'ArrowUp':   // 上方向键滚动到上一行单元格
          return this.$data.$scrollWrapper.scrollTop -= this.cellHeight;
        case 'ArrowDown': // 下方向键滚动到下一行单元格
          return this.$data.$scrollWrapper.scrollTop += this.cellHeight;
        case 'Home':      // home键滚动到第一行单元格
          return this.$data.$scrollWrapper.scrollTo(0, 0);
        case 'End':       // end键滚动最后一行单元格
          return this.$data.$scrollWrapper.scrollTo(0, this.maxScrollHeight);
        case 'A':         // Ctrl + A 组合键全选所有单元格
          return event.ctrlKey ? this.selectAll() : null;
      }
    },

    /** 选择所有单元格 */
    selectAll() {
      if (this.data.length && this.isMultipleSelect) {
        this.onSelectChange(this.isSelectAll = true);
      }
    },

    /** 清除所有选择 */
    clearSelection() {
      this.onSelectChange(this.isSelectAll = false);
    }
  }
}
</script>
