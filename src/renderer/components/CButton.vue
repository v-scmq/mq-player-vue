<template>
  <button class="c-button">
    <c-icon :name="icon" v-if="icon" />
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
import CIcon from '@/components/CIcon.vue';
import { PropType } from 'vue';

defineProps({
  /** 前缀图标 */
  icon: String as PropType<import('@/components/CIcon.vue').IconNamedType>
});
</script>
