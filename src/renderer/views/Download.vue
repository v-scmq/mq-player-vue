<template>
  <div class="v-row">
    <text-field v-model="usedTime" style="margin: 0 16px;"/>
    <pagination :dataCount="1000" v-model:current="current"/>
  </div>
</template>

<script>
import Pagination from '../components/Pagination.vue';
export default {
  components: { Pagination },
  name: "Download",
  data: () => ({usedTime: null, current:1}),
  created() {

  },
  watch:{
    current(newValue){
      console.info(newValue);
    }
  }
}
</script>

<style scoped>

</style>
