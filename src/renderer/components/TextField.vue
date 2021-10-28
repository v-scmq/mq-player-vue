<template>
  <div class="text-field" :class="{disabled}">

    <slot name='prefix-icon'>
      <icon :name="prefixIcon" v-if="prefixIcon"/>
    </slot>

    <input class="input" autocomplete="off" :placeholder="placeholder" :type="type"
           :maxlength="maxLength" :disabled="disabled"
           @input="handleInput" @change="handleChange" :value="modelValue"/>

    <slot name="suffix-icon">
      <icon :name="suffixIcon" v-if="suffixIcon"/>
    </slot>
  </div>
</template>

<script>

export default {
  name: "TextField",

  props: {
    /* 输入框双向绑定值 */
    modelValue: [String, Number],
    /* 输入框类型 */
    type: {type: String, default: 'text'},
    /* 输入框提示内容 */
    placeholder: String,
    /* 前缀图标 */
    prefixIcon: String,
    /* 后缀图标 */
    suffixIcon: String,
    /* 输入最大长度 */
    maxLength: Number,
    /* 是否禁用 */
    disabled: Boolean,
  },

  setup(props, {attrs, emit}) {

    /**
     * 获取输入框值 <br>
     *
     * 若输入框类型是数值,那么将输入框的字符串数值转换为数值类型;
     * 否则获取的是输入框未做任何处理的的值
     *
     * @param value {String} 输入框已键入的值
     * @return {Number | String} 转换后输入框的值
     */
    const getValue = value => props.type === 'number' ? Number(value) : value;

    return {

      /**
       * 处理输入框实时输入事件
       *
       * @param event {InputEvent} 输入框输入事件
       */
      handleInput: event => {
        const oldValue = props.modelValue;
        const newValue = getValue(event.target.value);
        if (oldValue !== newValue) {
          emit('update:modelValue', newValue);
        }
      },

      /**
       * 处理输入框值改变事件
       *
       * @param event {Event} 输入框值改变事件
       */
      handleChange: event => {
        // 若指定了onChange事件
        if (attrs.onChange) {
          // 那么提交值到这个回调方法
          emit('change', getValue(event.target.value));
        }
      }

    }
  }
}
</script>
