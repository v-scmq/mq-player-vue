<template>
  <div class="v-column">
    <div class="v-row option-flex">
      <button-base type="primary">播放全部</button-base>
      <button-base @click="multiple=!multiple">批量操作</button-base>
      <text-field class="align-end" v-model="inputKey" placeholder="搜索本地歌曲"></text-field>
      <button-base class="align-end" @click="$refs.file_import.click()">导入歌曲</button-base>
      <button-base class="align-end">排序方式</button-base>
      <input type="file" style="display: none" ref="file_import" multiple accept="audio/*"/>
    </div>

    <table-view :columns="columns" :data="dataList" style="flex:1;overflow: hidden"/>
  </div>
</template>

<script>
export default {
  name: "Special",

  data: () => ({
    inputKey: "",
    visible: true,
    multiple: null,
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ],
    dataList: []
  }),

  created() {
  },

  methods: {
    /**
     * @param index {number} 元素索引
     * @return {string} 列表序号字符串
     */
    toIndex(index) {
      return ++index < 10 ? `0${index}` : index;
    },

    /**
     * 表格行单元格双击时的回调方法
     */
    onCellClick(row) {
      if (!row.path) {
        return;
      }
      let player = this.$player, playList = player.playList;
      playList.splice(0, playList.length, ...this.dataList);
      if (player.prepare(row)) {
        player.play();
      }
    }
  }
}
</script>