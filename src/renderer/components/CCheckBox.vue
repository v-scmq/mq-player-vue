<script lang="ts" setup>
const props = defineProps({
  /** 双向绑定值 */
  modelValue: { type: Boolean, default: false },

  /** 复选框勾选状态不确定是传入此参数 */
  indeterminate: { type: Boolean, default: false },

  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

/**
 * checkbox被点击时,更新选择状态
 *
 * @param event 点击事件
 */
const onClick = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  !props.disabled && emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <div class="c-check-box" :class="{ disabled }" @click="onClick">
    <div class="indeterminate-icon" v-if="indeterminate">
      <span class="indeterminate" />
    </div>
    <svg class="check-icon" viewBox="0 0 20 20" v-else>
      <path
        v-show="modelValue"
        d="M-0.25,6.083c0.843-0.758,4.583,4.833,5.75,4.833S14.5-1.5,15.917-0.917c1.292,0.532-8.75,17.083-10.5,17.083C3,16.167-1.083,6.833-0.25,6.083z"
      />
    </svg>
  </div>
</template>
