<template>
  <div class='v-column'>
    <!--  在这里,这个按行排列的元素,必须设置在竖直方向上子元素填充整个父元素高度,且这个元素高度必须设定100%  -->
    <div class='v-row' style='align-items:stretch;height:100%;'>
      <table-view :columns="columns" :data='list' style="flex:auto;" @row-dblclick="onCellClick"/>

      <accordion :list="rankList" @change='onRankChanged' style='flex:none'/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RankList',
  data: () => ({
    rankList: [],
    list: [],
    page: {current: 1, size: 30},
    area: 0,
    sex: null,
    en: null,
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', valueGetter: item => item.singer ? item.singer.name : null},
      {title: '专辑', valueGetter: item => item.album ? item.album.name : null},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ],
  }),

  mounted() {
    this.$spinner.open();
    this.$source.impl.rankSongList(null, this.page).then(res => {
      if (res instanceof Array) {
        this.list = res;
      } else {
        this.rankList = res.rankList;
        this.list = res.list;
      }
    }).finally(this.$spinner.close);
  },

  methods: {
    /**
     * 所选榜单发生改变时,获取最新的歌曲列表数据
     * @param rankItem {Object} 榜单项信息
     * @param rankType {Object} 榜单项所属分类
     */
    onRankChanged(rankItem, rankType) {
      this.$message(`榜单分类：${rankType.name} 对应的榜单项：${rankItem.name}`);
      this.$spinner.open(document.body);
      this.$source.impl.rankSongList(rankItem, this.page).then(list => {
        this.list = list;
        this.$spinner.close();
      });
    },
    /**
     * 表格行单元格双击时的回调方法
     * @param row {Number} 行单元格索引
     */
    onCellClick(row) {
      let item = this.list[row];
      if (!item.path) {
        return;
      }

      let player = this.$player, playList = player.playList;
      player.index = row;
      playList.splice(0, playList.length, ...this.list);
      if (player.prepare(item)) {
        player.play();
      }
    },
  }
}
</script>
