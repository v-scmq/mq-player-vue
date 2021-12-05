<template>
  <div class='button'>
    <icon :name='prefixIcon' v-if='prefixIcon' :width="prefixIconSize || '1em' "
          :height="prefixIconSize || '1em' "/>
    {{ text }}
    <icon :name='suffixIcon' v-if='suffixIcon' :width="suffixIconSize || '1em' "
          :height="suffixIconSize || '1em' "/>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'Button',

  props: {
    /** 按钮文本 */
    text: String,
    /** 前缀图标 */
    prefixIcon: String,
    /** 前缀图标大小 */
    prefixIconSize: String,
    /** 后缀图标 */
    suffixIcon: String,
    /** 后缀图标大小 */
    suffixIconSize: String,
  }
});
</script>
