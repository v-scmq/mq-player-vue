<template>
  <div class="text-field">
    <input class="input" autocomplete="off" ref="inputNode" :placeholder="placeholder"
           :type="type" @input="handleInput" @change="handleChange"/>

    <svg class="icon" viewBox="0 0 16 16" v-if="suffixIcon">
      <path :d="suffixIcon"/>
    </svg>
  </div>
</template>

<script>
import {watch, getCurrentInstance} from "vue";

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

  setup(props) {
    const vc = getCurrentInstance();

    watch(() => props.modelValue, value => vc.refs.inputNode.value = value);

    return {
      handleInput: event => vc.emit('update:modelValue', event.target.value),
      handleChange: event => vc.emit('change', event.target.value)
    }
  }
}
</script>
