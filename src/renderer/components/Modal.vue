<template>
  <teleport to='body'>
    <div v-if='innerVisible' :id='id' class='modal' :class='{opened}' @click='close'
         @transitionend='opened ? null : $emit("update:visible", innerVisible = false)'>

      <div class='v-column modal-content' :style='{width, height}'>
        <div class='v-row titled-pane'>
          {{ title }}
          <svg class='close-icon'>
            <path d='M0 0 L16 16 M16 0 L0 16' style='pointer-events:none'></path>
          </svg>
        </div>

        <div class='v-column content'>
          <slot name='content'></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import {ref, watch} from 'vue';

export default {
  name: 'Modal',

  props: {
    id: String,         // 模态框id
    title: String,      // 对话框标题
    width: String,      // 模态框宽度
    height: String,     // 模态框高度
    modality: Boolean,  // 是否指定为模式对话框,默认false,即可通过点击遮罩层关闭
    visible: Boolean,   // 指定是否显示模态框
  },

  setup(props) {
    // 组件内部控制显示隐藏所用
    const innerVisible = ref(false);
    // 控制class,从而控制模态框内容部分动画开始
    const opened = ref(false);

    watch(() => props.visible, newValue => {
      if (newValue) {
        innerVisible.value = true;
        // 以帧动画开始显示模态框
        requestAnimationFrame(() => opened.value = true);
      } else {
        opened.value = false;
      }
    });

    return {
      innerVisible, opened,

      /**
       * 点击 遮罩层 或 关闭图标 时, 然后关闭对话框.
       *
       * @param {PointerEvent} event 点击事件
       */
      close(event) {
        const classList = event.target.classList;
        // 若点击关闭图标 或 (不是模式对话框 且 点击的是遮罩层), 那么关闭对话框
        if (classList.contains('close-icon') || (!props.modality && classList.contains('modal'))) {
          // 开始动画,模态框将从当前位置开始移动直至不在可视区域内
          opened.value = false;
        }
      }
    };
  }
}
</script>