<template>
  <div class='v-row' style='flex:1;align-items:stretch;height:100%;'>
    <!-- 在这里,这个按行排列的元素,必须设置在竖直方向上子元素填充整个父元素高度,且这个元素高度必须设定100%  -->
    <table-view :columns='columns' :data='songList' style='flex:auto;' @row-dblclick='onCellClick'
                @infinite-scroll='loadDataList'>
      <template v-slot:title='{item}'>
        {{ item.title }}
        <icon class='mv-icon' name='mv' width='1em' height='1em' v-if='item.vid'/>
      </template>

      <template v-slot:singer='{item:{singer:singers = []}}'>
        <span class='link' v-for='(singer, index) in singers' :key='index' :data-mid='singer.mid'>
          {{ singer.name }}
        </span>
      </template>

      <template v-slot:album='{item:{album}}'>
        <span class='link' :data-mid='album && album.mid'>{{ album && album.name }}</span>
      </template>
    </table-view>

    <!-- 音乐排行榜信息 -->
    <accordion style='flex:none' :list='rankList' @change='onRankChanged'/>
  </div>
</template>

<script lang='ts'>
import {reactive} from 'vue';
import player from '../player';
import Message from '../components/Message';
import element from '../components/Spinner';

import {getRanksSongList} from '../api';
import {convertSinger} from '../../utils';

export default {
  name: 'RankList',

  setup() {
    /** @type {RankItem | null} */
    let currentRankItem = null;

    const rankList = reactive(/** @type {Rank[]} */ []);
    const songList = reactive(/** @type {Song[]} */ []);
    const page =  /** @type {Page} */ {current: 1, size: 30};

    const columns = reactive(/** @type {TableColumn[]} */[
      {type: 'index', width: '100px'},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: '100px'},
    ]);

    element.open();
    getRanksSongList(page, currentRankItem).then(data => {
      // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
      Object.assign(page, data.page);

      rankList.splice(0, rankList.length, ...data.rankList);

      // 转换歌手为Array类型
      data.list.forEach(convertSinger);
      songList.splice(0, songList.length, ...data.list);

    }).finally(element.close);

    return {
      rankList, songList, columns,

      /**
       * 所选榜单发生改变时,获取最新的歌曲列表数据
       * @param {RankItem} rankItem 榜单项信息
       * @param {Object} rankType 榜单项所属分类
       */
      onRankChanged(rankItem, rankType) {
        currentRankItem = rankItem;
        Message(`榜单分类：${rankType.name} 对应的榜单项：${rankItem.name}`);

        element.open();
        page.current = 1;

        getRanksSongList(page, rankItem).then(data => {
          data.page && Object.assign(page, data.page);
          // 转换歌手为Array类型
          data.list.forEach(convertSinger);
          songList.splice(0, songList.length, ...data)

        }).finally(element.close);
      },

      /**
       * 表格行单元格双击时的回调方法
       * @param {number} row 行单元格索引
       */
      onCellClick: row => player.playMediaList(songList, row),

      /** 加载歌曲数据到表格视图中 */
      loadDataList() {
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          ++page.current;
          element.open();

          getRanksSongList(page, currentRankItem).then(data => {
            // 重设置分页信息
            data.page && Object.assign(page, data.page);
            // 转换歌手为Array类型
            data.list.forEach(convertSinger);
            // 添加歌曲
            songList.push(...data.list);

          }).catch(() => --page.current).finally(element.close);
        }
      }
    };
  }
}
</script>
