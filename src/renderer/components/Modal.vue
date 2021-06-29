<template>
  <div v-show="visible" class="modal" :class="{'opened':opened}" @click="close">
    <div class="v-column modal-content" :style="{width,height}">
      <div class="v-row titled-pane">
        {{ title }}
        <svg @click="close" class="close-icon">
          <path d="M0 0 L16 16 M16 0 L0 16"></path>
        </svg>
      </div>

      <div class="v-column content">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",

  props: {
    // 对话框标题
    title: String,
    // 模态框宽度
    width: String,
    // 模态框高度
    height: String,
    // 是否指定为模式对话框,默认false,即可通过点击遮罩层关闭
    modality: {type: Boolean, default: false},
  },

  data: () => ({
    // 组件内部控制显示隐藏所用
    visible: false,
    // 控制class,从而控制模态框内容部分动画开始
    opened: false
  }),

  methods: {
    /** 打开对话框 */
    open() {
      // 取消原有计时器
      this._timer ? clearTimeout(this._timer) : null;

      // 设置模态框可见
      this.visible = true;
      // 以帧动画设置动画开始的方法
      this._open = this._open || (() => this.opened = true);
      // 开始动画
      requestAnimationFrame(this._open);
    },

    /**
     * 手动调用 或 鼠标点击遮罩层 或 关闭图标时,触发对话框关闭.
     *
     * @param event {MouseEvent} HTML元素,允许为null,当事件对象不能存在时,则认为手动调用.
     */
    close(event = null) {
      // 初始化关闭方法
      this._close = this._close || (() => this.visible = false);
      // 若是主动调用,而非鼠标点击,那么直接准备关闭
      if (!event) {
        // 开始动画,模态框将从当前位置移到顶部直至不可见
        this.opened = false;
        // 0.4秒后,整个模态框都不可见
        this._timer = setTimeout(this._close, 400);
        return;
      }

      // 获取关闭图标节点
      let node = this.$el.querySelector('.titled-pane > .close-icon');
      // 若鼠标点击关闭图标 或 (不是模式对话框 且 鼠标点击的是遮罩层), 那么关闭对话框
      if (node === event.target || (!this.modality && event.target === this.$el)) {
        // 开始动画,模态框将从当前位置移到顶部直至不可见
        this.opened = false;
        // 0.4秒后,整个模态框都不可见
        this._timer = setTimeout(this._close, 400);
      }
    }
  }
}
</script>