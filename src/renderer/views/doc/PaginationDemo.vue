<template>
  <div class="v-column">
    <pagination v-model:currentPage="page.current" :total="page.total" :pageSize="page.size" style="margin: 20px 0;"/>
  </div>
</template>

<script>
import {reactive} from "vue";

export default {
  name: "PaginationDemo",

  setup() {
    const page = reactive({current: 1, total: 270, size: 30})

    return {page};
  }
}
</script>

<style scoped>

</style>