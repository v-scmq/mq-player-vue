<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  class: String, // 模态框自定义class
  title: String, // 对话框标题
  width: String, // 模态框宽度
  height: String, // 模态框高度
  modality: Boolean, // 是否指定为模式对话框,默认false,即可通过点击遮罩层关闭
  modelValue: Boolean // 指定是否显示模态框
});

const emit = defineEmits(['update:modelValue']);

// 组件内部控制显示隐藏所用
const innerVisible = ref(false);
// 控制class,从而控制模态框内容部分动画开始
const opened = ref(false);

const classList = computed(() => ['c-modal', props.class, { opened: opened.value }]);

watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      innerVisible.value = true;
      // 以帧动画开始显示模态框
      requestAnimationFrame(() => (opened.value = true));
    } else {
      opened.value = false;
    }
  }
);

/**
 * 点击 遮罩层 或 关闭图标 时, 然后关闭对话框.
 *
 * @param event 点击事件
 */
const close = (event: Event) => {
  const classList = (event.target as HTMLElement).classList;
  // 若点击关闭图标 或 (不是模式对话框 且 点击的是遮罩层), 那么关闭对话框
  if (classList.contains('close-icon') || (!props.modality && classList.contains('c-modal'))) {
    // 开始动画,模态框将从当前位置开始移动直至不在可视区域内
    opened.value = false;
  }
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="innerVisible"
      :class="classList"
      @click="close"
      @transitionend="opened ? null : emit('update:modelValue', (innerVisible = false))"
    >
      <div class="col modal-content" :style="{ width, height }">
        <div class="row titled-pane">
          {{ title }}
          <svg class="close-icon">
            <path d="M0 0 L16 16 M16 0 L0 16" />
          </svg>
        </div>

        <div class="col content">
          <slot></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>
