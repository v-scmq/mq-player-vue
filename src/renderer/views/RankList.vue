<template>
  <div class='v-row' style='flex:1;align-items:stretch;height:100%;'>
    <!--  在这里,这个按行排列的元素,必须设置在竖直方向上子元素填充整个父元素高度,且这个元素高度必须设定100%  -->
    <table-view :columns="columns" :data='songList' style="flex:auto;" @row-dblclick="onCellClick"/>
    <accordion :list="rankList" @change='onRankChanged' style='flex:none'/>
  </div>
</template>

<script>
import {reactive, getCurrentInstance} from "vue";

export default {
  name: 'RankList',

  setup() {
    const rankList = reactive([]);
    const songList = reactive([]);
    const page = reactive({current: 1, size: 30});
    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', valueGetter: item => item.singer ? item.singer.name : null},
      {title: '专辑', valueGetter: item => item.album ? item.album.name : null},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ]);

    const {$player, $spinner, $source, $message} = getCurrentInstance().appContext.config.globalProperties;

    $spinner.open();
    $source.impl.rankSongList(null, page).then(res => {
      if (res instanceof Array) {
        songList.splice(0, songList.length, ...res);
      } else {
        rankList.splice(0, rankList.length, ...res.rankList);
        songList.splice(0, songList.length, ...res.list);
      }
    }).finally($spinner.close);

    return {
      rankList, songList, page, columns,

      /**
       * 所选榜单发生改变时,获取最新的歌曲列表数据
       * @param rankItem {Object} 榜单项信息
       * @param rankType {Object} 榜单项所属分类
       */
      onRankChanged(rankItem, rankType) {
        $message(`榜单分类：${rankType.name} 对应的榜单项：${rankItem.name}`);
        $spinner.open();
        $source.impl.rankSongList(rankItem, page)
            .then(res => songList.splice(0, songList.length, ...res))
            .finally($spinner.close);
      },

      /**
       * 表格行单元格双击时的回调方法
       * @param row {number} 行单元格索引
       */
      onCellClick: row => $player.playMediaList(songList, row)
    };
  }
}
</script>
