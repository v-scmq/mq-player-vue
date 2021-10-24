<template>
  <div>
    <pagination v-model:current="page.current" :data-count="page.total" :size="page.size"/>
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