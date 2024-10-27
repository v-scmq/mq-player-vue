<script lang="ts" setup>
import CIcon from '@/components/CIcon.vue';
import type { PropType } from 'vue';

// const model = defineModel() => props.modelValue

const props = defineProps({
  /* 输入框双向绑定值 */
  modelValue: [String, Number],
  /* 输入框类型 */
  type: { type: String, default: 'text' },
  /* 输入框提示内容 */
  placeholder: String,
  /* 前缀图标 */
  prefixIcon: String as PropType<import('@/components/CIcon.vue').IconNamedType>,
  /* 后缀图标 */
  suffixIcon: String as PropType<import('@/components/CIcon.vue').IconNamedType>,
  /* 输入最大长度 */
  maxLength: Number,
  /* 是否禁用 */
  disabled: Boolean
});

const emit = defineEmits(['update:modelValue', 'change']);

/**
 * 获取输入框值 <br>
 *
 * 若输入框类型是数值,那么将输入框的字符串数值转换为数值类型;
 * 否则获取的是输入框未做任何处理的的值
 *
 * @param value 输入框已键入的值
 */
const getValue = (value: string) => (props.type === 'number' ? Number(value) : value);

/**
 * 处理输入框实时输入事件
 *
 * @param event 输入框输入事件
 */
const handleInput = (event: Event) => {
  const oldValue = props.modelValue;
  const newValue = getValue((<HTMLInputElement>event.target).value);
  oldValue !== newValue && emit('update:modelValue', newValue);
};

/**
 * 处理输入框值改变事件
 *
 * @param event 输入框值改变事件
 */
const handleChange = (event: Event) => {
  // 那么提交值到这个回调方法
  emit('change', getValue((<HTMLInputElement>event.target).value));
};
</script>

<template>
  <div class="c-input" :class="{ disabled }">
    <c-icon :name="prefixIcon" v-if="prefixIcon" />

    <input
      class="input"
      autocomplete="off"
      :placeholder="placeholder"
      :type="type"
      :maxlength="maxLength"
      :disabled="disabled"
      @input="handleInput"
      @change="handleChange"
      :value="modelValue"
    />

    <c-icon :name="suffixIcon" v-if="suffixIcon" />
  </div>
</template>
