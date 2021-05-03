<template>
  <div>
    <text-field v-model="usedTime"/>

  </div>
</template>

<script>
export default {
  name: "Download",
  data: () => ({usedTime: null}),
  created() {

    this.$request.request({
      // headers: {
      // },
      method: 'get',
      url: "/api/api/test-get",
    }).then(res => {
      console.info(res);
      this.usedTime = res.data.usedTime;
    })
  }
}
</script>

<style scoped>

</style>
