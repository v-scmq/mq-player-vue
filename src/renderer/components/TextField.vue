<template>
  <div class="text-field">
    <input class="input" autocomplete="off" ref="inputNode" :placeholder="placeholder"
           :type="type" @input="handleInput" @change="handleChange" :value="modelValue"/>

    <svg class="icon" viewBox="0 0 16 16" v-if="suffixIcon">
      <path :d="suffixIcon"/>
    </svg>
  </div>
</template>

<script>

export default {
  name: "TextField",

  props: {
    modelValue: [String, Number],
    type: {type: String, default: 'text'},
    placeholder: null,
    suffixIcon: {
      type: String,
      default: 'M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'
    },
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
