<template>
  <div class="v-column">
    <pagination v-model:currentPage="page.current" :total="page.total" :pageSize="page.size" style="margin: 20px 0;"/>

    <el-pagination layout="prev, pager, next" :total="100" :pagerCount="7"></el-pagination>
  </div>
</template>

<script>
import {reactive} from "vue";

export default {
  name: "PaginationDemo",

  setup() {
    const page = reactive({current: 1, total: 1000, size: 30})

    return {page};
  }
}
</script>

<style scoped>

</style>