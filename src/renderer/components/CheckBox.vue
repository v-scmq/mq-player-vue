<template>
  <div class='check-box' @click="onClick">
    <div class='indeterminate-icon ' v-if='indeterminate'>
      <span class='indeterminate'/>
    </div>
    <svg class='check-icon' viewBox='0 0 20 20' v-else>
      <path v-show='modelValue'
            d='M-0.25,6.083c0.843-0.758,4.583,4.833,5.75,4.833S14.5-1.5,15.917-0.917c1.292,0.532-8.75,17.083-10.5,17.083C3,16.167-1.083,6.833-0.25,6.083z'/>
    </svg>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'CheckBox',

  props: {
    /** 双向绑定值 */
    modelValue: {type: Boolean, default: false},

    /** 复选框勾选状态不确定是传入此参数 */
    indeterminate: {type: Boolean, default: false}
  },

  setup(props, {emit}) {
    return {
      onClick(event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();

        const element = (event.target as HTMLElement).closest('.check-box');
        const disabled = (element as HTMLElement).getAttribute('data-disabled');

        disabled !== 'true' && emit('update:modelValue', !props.modelValue);
      }
    }
  }

});
</script>
