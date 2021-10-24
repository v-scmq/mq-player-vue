<template>
  <teleport to="body">
    <div v-show="visible" :id="id" ref="el" class="modal" :class="{'opened': opened}" @click="close">
      <div class="v-column modal-content" :style="{width, height}">
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
  </teleport>
</template>

<script>
import {getCurrentInstance, ref} from "vue";

export default {
  name: "Modal",

  props: {
    id: String,         // 模态框id
    title: String,      // 对话框标题
    width: String,      // 模态框宽度
    height: String,     // 模态框高度
    modality: Boolean,  // 是否指定为模式对话框,默认false,即可通过点击遮罩层关闭
  },

  setup(props) {
    // 组件内部控制显示隐藏所用
    const visible = ref(false);
    // 控制class,从而控制模态框内容部分动画开始
    const opened = ref(false);

    const $open = () => opened.value = true;
    const $close = () => visible.value = false;

    let /** @type {number}*/ $timer;

    const vc = getCurrentInstance();

    return {
      visible, opened,

      /** 打开对话框 */
      open() {
        // 取消原有计时器
        $timer ? clearTimeout($timer) : null;

        // 设置模态框可见
        visible.value = true;
        // 以帧动画开始动画
        requestAnimationFrame($open);
      },

      /**
       * 手动调用 或 鼠标点击遮罩层 或 关闭图标时,触发对话框关闭.
       *
       * @param event {MouseEvent} HTML元素,允许为null,当事件对象不能存在时,则认为手动调用.
       */
      close(event = null) {
        // 若是主动调用,而非鼠标点击,那么直接准备关闭
        if (!event) {
          // 开始动画,模态框将从当前位置移到顶部直至不可见
          opened.value = false;
          // 0.4秒后,整个模态框都不可见
          $timer = setTimeout($close, 400);
          return;
        }

        // 获取关闭图标节点
        let node = vc.refs.el.querySelector('.titled-pane > .close-icon');
        // 若鼠标点击关闭图标 或 (不是模式对话框 且 鼠标点击的是遮罩层), 那么关闭对话框
        if (node === event.target || (!props.modality && event.target === vc.refs.el)) {
          // 开始动画,模态框将从当前位置移到顶部直至不可见
          opened.value = false;
          // 0.4秒后,整个模态框都不可见
          $timer = setTimeout($close, 400);
        }
      }
    };
  }
}
</script>