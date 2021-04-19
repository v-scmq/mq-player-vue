<template>
  <div class='accordion v-column' v-if='list' :style="{'--accordion-scroll-wrapper-height':`${scrollWrapperHeight}px`}">
    <div class='list-view v-column' v-for='(data,index) in list' :key='index' @click='onClick($event,data,index)'>
      <div class='v-row titled-pane'>
        <svg viewBox='-0.5 -2 8 8' width='1em' height='1em' class='icon'>
          <path d='M 0 0 h 7 l -3.5 4 z'></path>
        </svg>
        {{ data.name }}
      </div>
      <div class='v-column scroll-wrapper'>
        <div class='item' v-for='item in data.items' :key='item.id'>{{ item.name }}</div>
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
      let node = this.$el.querySelector('.list-view');
      node.classList.toggle('expand', true);
    }

    // let node = this.$el.querySelector('.scroll-wrapper')
    // node.addEventListener('webkitTransitionEnd', this.onAnimateEnd)
  },

  beforeDestroy() {
    if (this._resizeObserver != null) {
      this._resizeObserver.unobserve(this.$el);
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  },

  methods: {
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
     * @param event {MouseEvent} 鼠标事件
     * @param data {Object} 鼠标所击对应的数据项
     * @param index {Number} 鼠标所击对应的数据项索引
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
        this.$emit('change', data, index);
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
