<template>
  <table-view :data="data" :columns="columns" style="flex:1;" @infinite-scroll='addData'/>
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

    const data = reactive([]);

    for (let index = 0; index < 100; ++index) {
      data.push({
        title: '九张机',
        singer: '叶炫清',
        album: '九张机',
        duration: '3:58',
        size: '8.40MB'
      });
    }

    const addData = () => {
      console.info('添加数据');
    };

    return {columns, data, addData};
  }
};
</script>

<style scoped></style>
