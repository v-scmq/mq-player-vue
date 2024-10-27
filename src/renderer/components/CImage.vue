<script lang="ts" setup>
const modelValue = defineModel<string>({ default: '' });

const props = defineProps({
  /** 用于指定加载失败时而展示的默认图片URL */
  error: String
});

const handleError = () => {
  const value = props.error;

  if (value && value !== modelValue.value) {
    modelValue.value = value;
  }
};
</script>

<template>
  <img alt="" class="c-image" loading="lazy" :src="modelValue" @error="handleError" />
</template>
