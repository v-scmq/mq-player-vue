<template>
  <div class='v-row singer-info-container'>
    <img alt class='cover' :src='album.cover '/>
    <div class='v-column'>
      <div>{{ album.name || '-' }}</div>

      <div class='v-row base-info'>
        <span class='count-info'>流派：{{ album.genre || '-' }}</span>
        <span class='count-info'>语种：{{ album.language || '-' }}</span>
        <span class='count-info'>唱片公司：{{ album.company || '-' }}</span>
        <span class='count-info'>发行时间：{{ album.year || '-' }}</span>
      </div>

      <div class='v-row'>
        <Button text='播放全部'/>
        <Button text='播放全部'/>
        <Button text='打印预览'/>
      </div>
    </div>
  </div>

  <div class='v-row' style='margin:1em 0 0 0;flex:auto;overflow:hidden;align-items:stretch;'>

    <table-view style='flex:auto;' :columns='columns' :data='songList' @row-dblclick='onCellClick'
                @infinite-scroll='loadDataList'>
      <template v-slot:title='{item}'>
        {{ item.title }}
        <icon class='mv-icon' name='mv' width='1em' height='1em' v-if='item.vid'/>
      </template>

      <template v-slot:singer='{item:{singers = []}}'>
            <span class='link' v-for='(singer, index) in singers' :key='index' :data-mid='singer.mid'>
              {{ singer.name }}
            </span>
      </template>

      <template v-slot:album='{item:{album}}'>
        <span class='link' :data-mid='album && album.mid'>{{ album && album.name }}</span>
      </template>
    </table-view>

    <div class='label' style='margin:0 0 0 1em;padding:0 1em 0 0;width:15em;'>
      简介：{{ album.introduce }}
    </div>
  </div>
</template>

<script>
import {reactive, watch} from 'vue';

import player from '../player';
import Spinner from '../components/Spinner';
import {getAlbumSongList} from '../api';
import {convertSinger} from '../../utils';

export default {
  name: 'AlbumView',

  props: {query: Object},

  setup(props) {
    const songList = reactive(/** @type {Song[]} */[]);
    const album = reactive(/** @type {Album} */ {mid: '', name: '', cover: '', company: ''});
    const page = /** @type {Page} */ {current: 1, size: 30, total: 1};

    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', valueGetter: item => item.singer ? item.singer.name : null},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ]);

    watch(() => props.query, /** @param {Album} newQuery */newQuery => {
      if (album.mid !== newQuery.mid) {
        Spinner.open();

        getAlbumSongList(page, newQuery).then(data => {
          // 重设分页信息
          Object.assign(page, data.page);
          // 更新专辑信息
          data.album && Object.assign(album, data.album);
          // 添加歌曲数据
          data.list.forEach(convertSinger);
          songList.splice(0, songList.length, ...data.list);

        }).finally(Spinner.close);
      }

    }, {immediate: true});

    return {
      songList, page, album, columns,

      /**
       * 表格行单元格双击时的回调方法
       *
       * @param {number} row 行单元格索引
       */
      onCellClick: row => player.playMediaList(songList, row),

      /** 加载歌曲数据到表格视图中 */
      loadDataList() {
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          ++page.current;
          Spinner.open();

          getAlbumSongList(page, album).then(data => {
            // 重设置分页信息
            data.page && Object.assign(page, data.page);
            // 转换歌手为Array类型
            data.list.forEach(convertSinger);
            // 添加歌曲
            songList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      }
    };

  }
}
</script>

<style scoped>
.image-container {
  padding: 1em 0 0 0;
  margin: 0.5em 0 0 0;
}

.image-container > .content-box {
  align-items: center;
  margin: 0 3em 3em 0;
}

.cover, .content-box .cover {
  width: 13em;
  height: 13em;
  cursor: pointer;
  border-radius: 8em;
  transition: transform .75s cubic-bezier(0, 1, .75, 1);
}

.content-box .name {
  max-width: 13em;
  /*默认换行white-space: normal;*/
}

.content-box:hover .cover {
  transform: scale(1.07);
}
</style>