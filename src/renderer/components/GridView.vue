<template>
  <div class="grid-view">
    <div class="item-cell" v-for="(item, index) in data" :key="index">
      <slot :item="item">{{ item }}</slot>
    </div>
  </div>
</template>

<script>
import {} from "vue";

export default {
  name: "grid-view",

  props: {
    // 单元格宽度(作为grid布局的grid-template-columns样式属性使用)
    cellWidths: String,
    // 作为循环渲染的数据内容
    data: { default: [] }
  },

  setup() {
    //
  }
};
</script>

<style scoped>
.grid-view {
  display: grid;
  overflow: hidden auto;
}
</style>
