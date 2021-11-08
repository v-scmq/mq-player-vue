<template>
  <div class='v-row' style='flex:1;align-items:stretch;height:100%;'>
    <!--  在这里,这个按行排列的元素,必须设置在竖直方向上子元素填充整个父元素高度,且这个元素高度必须设定100%  -->
    <table-view :columns="columns" :data='songList' style="flex:auto;" @row-dblclick="onCellClick">
      <template v-slot:title="{item}">
        {{ item.title }}
        <icon class="mv-icon" name="mv" width="1em" height="1em" v-if="item.vid"/>
      </template>

      <template v-slot:singer="{item}">
        <span class="link" v-for="(singer,index) in item.singer" :key="index" :data-mid="singer.mid">
          {{ singer.name }}
        </span>
      </template>

      <template v-slot:album="{item}">
        <span class="link" v-if="item.album" :data-mid="item.album.mid">
          {{ item.album.name }}
        </span>
      </template>
    </table-view>
    <accordion :list="rankList" @change='onRankChanged' style='flex:none'/>
  </div>
</template>

<script>
import player from '../player';
import Message from '../components/Message';
import Spinner from '../components/Spinner';

import {reactive} from "vue";

export default {
  name: 'RankList',

  setup() {
    const rankList = reactive([]);
    const songList = reactive([]);
    const page = reactive({current: 1, size: 30});
    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
    ]);

    // TODO 数据源API待修改
    const $source = {};

    Spinner.open();
    $source.impl.rankSongList(null, page).then(res => {
      if (res instanceof Array) {
        songList.splice(0, songList.length, ...res);
      } else {
        rankList.splice(0, rankList.length, ...res.rankList);
        songList.splice(0, songList.length, ...res.list);
      }
    }).finally(Spinner.close);

    return {
      rankList, songList, page, columns,

      /**
       * 所选榜单发生改变时,获取最新的歌曲列表数据
       * @param rankItem {Object} 榜单项信息
       * @param rankType {Object} 榜单项所属分类
       */
      onRankChanged(rankItem, rankType) {
        Message(`榜单分类：${rankType.name} 对应的榜单项：${rankItem.name}`);
        Spinner.open();
        $source.impl.rankSongList(rankItem, page)
            .then(res => songList.splice(0, songList.length, ...res))
            .finally(Spinner.close);
      },

      /**
       * 表格行单元格双击时的回调方法
       * @param row {number} 行单元格索引
       */
      onCellClick: row => player.playMediaList(songList, row)
    };
  }
}
</script>
