<template>
  <div class="v-column">
    <div class="v-row option-flex">
      <Button text='播放全部'/>
      <Button @click="handleClicked" text='批量操作'/>
      <text-field class="align-end" v-model="inputKey" placeholder="搜索本地歌曲"></text-field>
      <Button class="align-end" @click="$refs.file_import.click()" text='导入歌曲'/>
      <Button class="align-end" text='排序方式'/>
      <input type="file" style="display: none" ref="file_import" multiple accept="audio/*"/>
    </div>

    <table-view :columns="columns" :data="dataList" style="flex:1;overflow: hidden"/>
  </div>
</template>

<script>
export default {
  name: "Favorite",
  data: () => ({
    inputKey: "",
    multiple: false,
    visible: true,
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ],
    dataList: [],
  }),

  methods: {
    handleClicked() {
    },

    toIndex(index) {
      return ++index < 10 ? '0' + index : index;
    },

    /**
     * 表格行单元格双击时的回调方法
     */
    onCellClick(row) {
      if (!row.path) {
        return;
      }
      this.$player.playList.splice(0, this.$player.playList.length);
      this.$player.playList.push(...this.dataList)
      let player = this.$player;
      if (player.prepare(row)) {
        player.play();
      }
    }
  }
}
</script>