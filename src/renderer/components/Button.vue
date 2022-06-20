<template>
  <button class='button'>
    <icon :name='icon' v-if='icon'/>
    <slot></slot>
  </button>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'HlButton',

  props: {
    /** 前缀图标 */
    icon: String,
  }
});
</script>
