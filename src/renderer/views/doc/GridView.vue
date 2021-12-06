<template>
  <grid-view :data="data" style="flex:1;" @infinite-scroll="addData" />
</template>

<script lang='ts'>
import { reactive } from "vue";

export default {
  name: "TableViewDemo",

  setup() {
    const data = reactive<string[]>([]);

    const addData = () => {
      for (let index = 0; index < 100; ++index) {
        data.push(String(index).padStart(3,'0'));
      }
    }

    return {data, addData};
  }
};
</script>

<style scoped></style>
