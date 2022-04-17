<template>
  <div class='v-row data-container'>
    <image-view v-model='album.cover' defaultValue='icon/album.png'/>

    <div class='v-column'>
      <div>{{ album.name || '-' }}</div>

      <div class='v-row data-statistic'>
        <span class='statistic-item'>流派：{{ album.genre || '-' }}</span>
        <span class='statistic-item'>语种：{{ album.language || '-' }}</span>
        <span class='statistic-item'>唱片公司：{{ album.company || '-' }}</span>
        <span class='statistic-item'>发行时间：{{ album.year || '-' }}</span>
      </div>

      <div class='v-row'>
        <Button text='播放全部' prefixIcon='play-select' prefixIconSize='1.5em'/>
        <Button text="添加到" prefixIcon='plus' prefixIconSize='1.5em'/>
        <Button text="下载" prefixIcon='my-download' prefixIconSize='1.5em'/>
        <Button text="删除" prefixIcon='trash' prefixIconSize='1.5em'/>
        <Button :text="multiple ? '退出批量操作':'批量操作'" prefixIcon='multiple' prefixIconSize='1.5em'/>
      </div>
    </div>
  </div>

  <div class='v-row' style='margin:1em 0 0 0;flex:auto;overflow:hidden;align-items:stretch;'>

    <table-view style='flex:auto;' :columns='columns' :data='songList' @row-dblclick='playMediaList'
                @infinite-scroll='loadDataList'>
      <template v-slot:title='{item}'>
        <span class='cell-text'>{{ item.title }}</span>
        <icon class='vip-icon' name='vip' width='1em' height='1em' v-if='item.vip'/>
        <icon class='mv-icon' name='mv' width='1em' height='1em' v-if='item.vid'/>
      </template>

      <template v-slot:singer='{item:{singer:singers = []}}'>
        <span class='link cell-text' v-for='(singer, index) in singers' :key='index'
              :data-mid='singer.mid'>{{ singer.name }}</span>
      </template>

      <template v-slot:album='{item:{album}}'>
        <span class='link cell-text' :data-mid='album.mid' v-if='album'>{{ album.name }}</span>
      </template>
    </table-view>

    <div class='label' style='margin:0 0 0 1em;padding:0 1em 0 0;width:15em;'>
      简介：{{ album.introduce }}
    </div>
  </div>
</template>

<script lang='ts'>
import Spinner from '../components/Spinner';
import {playMediaList} from '../player/hooks';
import {getAlbumSongList} from '../api';

import {Album, ComputedPage, Song} from '../../types';

import {reactive, watch, defineComponent, PropType, ref} from 'vue';
import {TableColumn} from '../components/types';

export default defineComponent({
  name: 'AlbumView',

  props: {query: Object as PropType<Album>},

  setup(props) {
    const songList = reactive<Song[]>([]);
    const album = reactive<Album>({mid: '', name: '', cover: '', company: ''});
    const page = {current: 1, size: 30, total: 1} as ComputedPage;

    const columns = reactive<TableColumn[]>([
      {type: 'index', width: '100px'},
      {title: '歌曲', property: 'title', flex: true},
      {title: '歌手', property: 'singer'},
      {title: '时长', property: 'duration', width: '100px'},
      {title: '大小', property: 'size', width: '100px'}
    ]);

    const multiple = ref(false);

    watch(() => props.query, newQuery => {
      if (newQuery && album.mid !== newQuery.mid) {
        Spinner.open();

        getAlbumSongList(page, newQuery).then(data => {
          // 重设分页信息
          Object.assign(page, data.page);
          // 更新专辑信息
          data.album && Object.assign(album, data.album);
          // 添加歌曲数据
          songList.splice(0, songList.length, ...data.list);

        }).finally(Spinner.close);
      }

    }, {immediate: true});

    return {
      songList, page, album, columns, multiple,

      playMediaList,

      /** 加载歌曲数据到表格视图中 */
      loadDataList() {
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          ++page.current;
          Spinner.open();

          getAlbumSongList(page, album).then(data => {
            // 重设置分页信息
            data.page && Object.assign(page, data.page);
            // 添加歌曲
            songList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      }
    };

  }

});
</script>