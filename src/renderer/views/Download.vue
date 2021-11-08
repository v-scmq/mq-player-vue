<template>
  下载管理
</template>

<script>
export default {
  name: "Download",

  mounted(){
    this.$request.request({
      url: '/api/singers',
      method: 'post',
      data: JSON.stringify({name:'张三', age:18})
    }).then(res=>{
      console.info(res);
    })
  }
}
</script>

<style scoped>
</style>
