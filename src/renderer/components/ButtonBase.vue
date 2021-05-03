<template>
  <div tabindex="0" class="button" @click="$emit('click',$event)">
    <slot></slot>
    {{ text }}
  </div>
</template>

<script>
export default {
  name: "ButtonBase",
  props: {text: null}
}
</script>
