<template>
  <div class='v-row' style='flex:1;align-items:stretch;height:100%;'>
    <!-- 在这里,这个按行排列的元素,必须设置在竖直方向上子元素填充整个父元素高度,且这个元素高度必须设定100%  -->
    <table-view :columns='columns' :data='songList' style='flex:auto;' @row-dblclick='onCellClick'>
      <template v-slot:title='{item}'>
        {{ item.title }}
        <icon class='mv-icon' name='mv' width='1em' height='1em' v-if='item.vid'/>
      </template>

      <template v-slot:singer='{item}'>
        <span class='link' v-for='(singer,index) in item.singer' :key='index' :data-mid='singer.mid'>
          {{ singer.name }}
        </span>
      </template>

      <template v-slot:album='{item}'>
        <span class='link' v-if='item.album' :data-mid='item.album.mid'>
          {{ item.album.name }}
        </span>
      </template>
    </table-view>
    <accordion style='flex:none' :list='rankList' @change='onRankChanged'/>
  </div>
</template>

<script>
import {reactive} from 'vue';
import player from '../player';
import Message from '../components/Message';
import Spinner from '../components/Spinner';
import {getRanksSongList} from '../api';

export default {
  name: 'RankList',

  setup() {
    const rankList = reactive(/** @type {Rank[]} */ []);
    const songList = reactive(/** @type {Song[]} */ []);
    const page = reactive(/** @type {Page} */ {current: 1, size: 30});
    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
    ]);

    Spinner.open();
    getRanksSongList(page, null).then(data => {
      // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
      Object.assign(page, data.page);

      rankList.splice(0, rankList.length, ...data.rankList);
      songList.splice(0, songList.length, ...data.list);

    }).finally(Spinner.close);

    return {
      rankList, songList, page, columns,

      /**
       * 所选榜单发生改变时,获取最新的歌曲列表数据
       * @param {RankItem} rankItem 榜单项信息
       * @param {Object} rankType 榜单项所属分类
       */
      onRankChanged(rankItem, rankType) {
        Message(`榜单分类：${rankType.name} 对应的榜单项：${rankItem.name}`);

        Spinner.open();
        page.current = 1;

        getRanksSongList(page, rankItem).then(data => {
          page.total = data.page.total;
          songList.splice(0, songList.length, ...data)

        }).finally(Spinner.close);
      },

      /**
       * 表格行单元格双击时的回调方法
       * @param {number} row 行单元格索引
       */
      onCellClick: row => player.playMediaList(songList, row)
    };
  }
}
</script>
