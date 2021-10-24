<template>
  <div>
    <table-view :data="data" :columns="columns"/>
  </div>
</template>

<script>
import {reactive} from "vue";

export default {
  name: "TableViewDemo",

  setup() {
    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ]);

    /** @type {[{path, title, singer, album, duration, size , [property:string]}]} */
    const data = reactive([]);

    return {columns, data};
  }
}
</script>

<style scoped>

</style>