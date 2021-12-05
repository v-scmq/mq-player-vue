<template>
  下载管理
</template>

<script lang='ts'>
import axios from 'axios';

export default {
  name: "Download",

  mounted() {
    axios.request({
      url: '/api/singers',
      method: 'post',
      data: {
        name: '张三',
        age: 18
      }
    }).then(res => {
      console.info(res);
    })
  }
}
</script>

<style scoped>
</style>
