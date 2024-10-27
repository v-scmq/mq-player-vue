<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { PropType } from 'vue';

const TYPE_MAP = {
  info: 'M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412l-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  success:
    'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z',
  warning:
    'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z',
  error:
    'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z'
} as const;

const props = defineProps({
  message: String,
  type: { type: String as PropType<'success' | 'warning' | 'error' | 'info'>, required: true },
  showClose: { type: Boolean, default: false },
  topOffset: { type: Number, default: 0 },
  duration: { type: Number, default: 5000 },
  onClose: { type: Function, required: true }
});

const emit = defineEmits(['destroy']);

// 初始不可见
const visible = ref(false);

// 获取对应类型的图标
const icon = ref(TYPE_MAP[props.type] || TYPE_MAP['info']);

// 数值计时器
let timer: number | null;

// 关闭,并调用传递过来的onClose方法
const close = () => {
  visible.value = false;
  props.onClose();
};

// 清除计时器
const clearTimer = () => {
  if (timer != null) {
    window.clearTimeout(timer);
    timer = null;
  }
};

// 启动计时器
const startTimer = () => {
  // 清除之前的计时器
  clearTimer();
  // 重新开始计时
  if (props.duration > 0) {
    timer = window.setTimeout(close, props.duration);
  }
};

onMounted(() => {
  visible.value = true;
  // 开始计时
  startTimer();
});
</script>

<template>
  <transition name="c-message-fade" :duration="duration" @before-leave="close" @after-leave="emit('destroy')">
    <div
      class="c-message"
      v-show="visible"
      :style="{ top: `${topOffset}px` }"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
      :class="[type, showClose ? 'closeable' : null]"
    >
      <svg width="1em" height="1em" viewBox="0 0 16 16" class="message-icon">
        <path :d="icon" />
      </svg>

      <div class="content">{{ message }}</div>

      <svg width="1em" height="1em" viewBox="0 0 16 16" v-if="showClose" class="close-icon" @click="close">
        <path
          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </div>
  </transition>
</template>
