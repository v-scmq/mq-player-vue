<template>
  <teleport to="body">
    <div v-show="visible" :id="id" class="modal" :class="{opened}" @click="close"
        @transitionend="opened ? null : (visible = false)">

      <div class="v-column modal-content" :style="{width, height}">
        <div class="v-row titled-pane">
          {{ title }}
          <svg class="close-icon" @click="close">
            <path d="M0 0 L16 16 M16 0 L0 16" style="pointer-events:none"></path>
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
import {ref} from "vue";

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
    // 以帧动画开始显示模态框
    const $open = () => opened.value = true;

    return {
      visible, opened,

      /** 打开对话框 */
      open() {
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
          // 开始动画,模态框将从当前位置开始移动直至不在可视区域内
          opened.value = false;
          return;
        }

        const  classList = event.target.classList;
        // 若鼠标点击关闭图标 或 (不是模式对话框 且 鼠标点击的是遮罩层), 那么关闭对话框
        if (classList.contains('close-icon') || (!props.modality && classList.contains('modal'))) {
          // 开始动画,模态框将从当前位置开始移动直至不在可视区域内
          opened.value = false;
        }
      }
    };
  }
}
</script>