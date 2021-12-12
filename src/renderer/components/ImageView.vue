<template>
  <img alt='' class='cover' loading='lazy' :src='path' @error='handleError'/>
</template>

<script lang='ts'>
import {computed, defineComponent} from 'vue';

export default defineComponent({
  name: 'ImageView',

  props: {
    /** 用于双向绑定的图片URL */
    modelValue: String,
    /** 用于指定加载失败时而展示的默认图片URL */
    defaultValue: String
  },

  emits: ['update:modelValue'],

  setup(props, {emit}) {
    return {
      path: computed(() => props.modelValue || props.defaultValue),

      handleError() {
        const value = props.defaultValue;

        if (value && value !== props.modelValue) {
          emit('update:modelValue', value);
        }
      }

    }

  }

});
</script>

<style scoped>

</style>