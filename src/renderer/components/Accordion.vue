<template>
  <div class='accordion v-column' v-if='list' :style="{'--accordion-scroll-wrapper-height':`${scrollWrapperHeight}px`}">
    <div class='list-view v-column' v-for='(data,index) in list' :key='index' @click='onClick($event,data,index)'>
      <div class='v-row titled-pane'>
        <svg viewBox='-0.5 -2 8 8' width='1em' height='1em' class='icon'>
          <path d='M 0 0 h 7 l -3.5 4 z'></path>
        </svg>
        {{ data.title }}
      </div>
      <div class='v-column scroll-wrapper'>
        <div class='item' v-for='(item,index) in data.items' :key='index' :data="index">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Accordion",
  props: {list: {default: null}},

  data: () => ({scrollWrapperHeight: 0}),

  mounted() {
    this._resizeObserver = new ResizeObserver(this.onResize);
    this._resizeObserver.observe(this.$el);

    if (this.list && this.list.length) {
      let items = this.list[0].items;
      if (items && items.length) {
        this._selectedItem = items[0];
      }
      this.expandDefault();
    }
  },

  beforeDestroy() {
    if (this._resizeObserver != null) {
      this._resizeObserver.unobserve(this.$el);
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  },

  watch: {
    /** 当数据发生变化时 */
    list() {
      this.$nextTick(this.expandDefault);
    }
  },

  methods: {
    /**
     * 当没有任何展开的列表项时,展开一个默认的列表项
     */
    expandDefault() {
      let nodes = this.$el.querySelectorAll('.list-view');
      // 若没有任何列表项时,则重置已选定的记录
      if (nodes.length < 1) {
        this._selectedItem = null;
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
        this._selectedItem = this.list[0].items[0];
        // 强制选中第一个列表项的第一个子列表项
        node.classList.toggle('selected', true);
      }
    },

    /**
     * 当根元素宽高发生变化时,回调此方法以计算滚动盒子内部高度
     * @param entry {ResizeObserverEntry} 大小调整观察者Entry对象
     */
    onResize([entry]) {
      let node = entry.target, height = node.offsetHeight;
      let nodes = node.querySelectorAll('.list-view .titled-pane');
      nodes.forEach(node => height -= node.offsetHeight);
      this.scrollWrapperHeight = height;
    },

    /**
     * ListView被点击时触发
     * @param event {MouseEvent}               鼠标事件
     * @param data {{name:String,items:Array}} 鼠标所击对应的数据项
     * @param index {Number}                   鼠标所击对应的数据项索引
     */
    onClick(event, data, index) {
      event.stopPropagation();
      let nodes = this.$el.querySelectorAll('.list-view');
      let node = event.target, classList = node.classList;
      let parent = classList.contains('list-view') ? node : node.parentNode;

      if (classList.contains('item')) {
        // 获取所有选中的ListView的子项
        nodes = this.$el.querySelectorAll('.list-view .item.selected');
        // 移除选中class标记
        nodes.forEach(node => node.classList.remove('selected'));
        // 强制为当前所点击ListView子项添加选中class标记
        classList.toggle('selected', true);
        let current = data.items[node.getAttribute('data')];
        if (this._selectedItem !== current) {
          this.$emit('change', this._selectedItem = current, data, index);
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
  }
}
</script>
