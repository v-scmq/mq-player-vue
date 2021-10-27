<template>
  <div class="v-column">
    <pagination style="margin: 20px 0;" v-model:currentPage="page.current"
                v-model:total="page.total" v-model:pageSize="page.size"
                v-model:page-button-count="page.pageButtonCount"/>
    <div class="v-row">
      current:
      <text-field v-model:model-value="page.current" :suffix-icon="null" type="number" @change="handleChanged"/>
      total:
      <text-field v-model:model-value="page.total" :suffix-icon="null" type="number"/>
      size:
      <text-field v-model:model-value="page.size" :suffix-icon="null" type="number"/>
      buttonCount:
      <text-field v-model:model-value="page.pageButtonCount" :suffix-icon="null" type="number"/>
    </div>
  </div>
</template>

<script>
import {reactive} from "vue";

export default {
  name: "PaginationDemo",

  setup() {
    const page = reactive({current: 1, total: 1000, size: 30, pageButtonCount: 7})

    return {page, handleChanged: () => null};
  }
}
</script>

<style scoped>

</style>