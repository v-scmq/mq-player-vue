<template>
  <transition name="message-fade" @after-leave="onAnimateEnd">
    <div class="message"
         v-show="visible"
         :class="[type, center?'center':null, showClose?'closeable':null, customClass]"
         :style="{'top': `${this.verticalOffset}px`}">

      <svg width="1em" height="1em" viewBox="0 0 16 16" class="message-icon">
        <path :d="icon"></path>
      </svg>

      <slot>
        <div class="content">{{ message }}</div>
      </slot>

      <svg width="1em" height="1em" viewBox="0 0 16 16" v-if="showClose" class='close-icon' @click="close">
        <path
            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>
    </div>
  </transition>
</template>

<script>
// Message 图标类型
const TYPE_MAP = {
  info: 'M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412l-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  success: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z',
  warning: 'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z',
  error: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z'
};

export default {
  data: () => ({
    visible: null,
    message: null,
    type: 'info',
    icon: null,
    onClose: null,
    showClose: null,
    customClass: null,
    closed: false,
    center: null,
    timer: null,
    duration: 3000,
    verticalOffset: 20,
  }),

  methods: {
    /**动画结束后,移除并销毁dom*/
    onAnimateEnd() {
      this.$destroy();
      this.$el.onmouseenter = null;
      this.$el.onmouseleave = null;
      this.$el.parentNode.removeChild(this.$el);
    },

    close() {
      this.closed = true;
      this.visible = false;
      (typeof this.onClose === 'function') ? this.onClose(this) : null;
    }
  },

  mounted() {
    // 确保message类型是一个支持的类型
    this.type = this.type && TYPE_MAP[this.type] ? this.type : 'info';
    // 获取对应类型的图标
    this.icon = TYPE_MAP[this.type];

    let startTimer = () => this.duration > 0 && !this.closed ?
        this.timer = setTimeout(this.close, this.duration) : null;

    this.$el.onmouseenter = () => clearTimeout(this.timer);
    this.$el.onmouseleave = startTimer;
    startTimer(startTimer = null);
  }
};
</script>
