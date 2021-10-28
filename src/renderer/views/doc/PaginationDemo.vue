<template>
  <div class="v-column">
      <pagination style="margin: 20px 0;" v-model:currentPage="page.current"
                  v-model:total="page.total" v-model:pageSize="page.size"
                  v-model:page-button-count="page.pageButtonCount"/>

      <div class="v-row" style="flex-wrap:wrap;">
        current:
        <text-field v-model:model-value="page.current"  @change="handleChanged"/>
        total:
        <text-field v-model:model-value="page.total" />
        size:
        <text-field v-model:model-value="page.size" />
        buttonCount:
        <text-field v-model:model-value="page.pageButtonCount"/>
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