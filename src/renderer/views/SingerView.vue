<template>
  <div class='v-row singer-info-container'>
    <img alt class='cover' :src='singer.cover'/>
    <div class='v-column'>
      <div>{{ singer.name || '-' }}</div>

      <div class='v-row base-info'>
        <span class='count-info'>单曲：{{ singer.songCount || '-' }}</span>
        <span class='count-info'>专辑：{{ singer.albumCount || '-' }}</span>
        <span class='count-info'>MV：{{ singer.mvCount || '-' }}</span>
        <span class='count-info'>粉丝：{{ singer.fansCount || '-' }}</span>
      </div>

      <div class='v-row'>
        <Button text='播放全部'/>
        <Button text='下载'/>
        <Button text='批量操作'/>
        <Button text='打印预览' @click='print'/>
      </div>
    </div>
  </div>

  <div class='tab-pane v-column'>
    <div class='v-row tab-container' style='justify-content:center;'>

      <div class='tab' v-for='(item,index) in tabMap.tabList' :key='index'
           :class='{active: tabMap.value === item}' @click='tabMap.value = item'>
        {{ item.title }}
      </div>
    </div>

    <div class='tab-content v-column'>

      <table-view :columns='columns' :data='songList' style='flex:auto;' @row-dblclick='onCellClick'
                  v-show='tabMap.value===tabMap.SONG_TAB' @infinite-scroll='loadDataList'>
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

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show='tabMap.value===tabMap.ALBUM_TAB' @click='onAlbumItemClicked'>
        <div class='v-column content-box' v-for='(item,index) in albumList' :key='index' :data-index='index'>
          <img class=cover :src='item.cover' loading='lazy' alt/>
          <div class='name'>{{ item.name }}</div>
        </div>
      </div>

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show='tabMap.value===tabMap.MV_TAB'>
        <div class='v-column content-box' v-for='(item,index) in mvList' :key='index'>
          <img class=cover :src='item.cover' loading='lazy' alt/>
          <div class='name'>{{ item.singer ? item.singer.name : null }} - {{ item.title }}</div>
        </div>
      </div>

      <div v-show='tabMap.value===tabMap.DETAIL_TAB' class='label'>{{ singer.introduce }}</div>
    </div>
  </div>
</template>

<script>
import player from '../player';
import Spinner from '../components/Spinner';

import {reactive, watch} from 'vue';
import {useRouter} from 'vue-router';

export default {
  name: 'SingerView',

  props: {query: Object},

  setup(props) {
    const songList = reactive([]);
    const /** @type [{name, cover}] */ albumList = reactive([]);
    const /** @type {[{title, cover, singer}]} */ mvList = reactive([]);

    const SONG_TAB = {title: '歌曲', update: true, error: null};
    const ALBUM_TAB = {title: '专辑', update: true, error: null};
    const MV_TAB = {title: 'MV', update: true, error: null};
    const DETAIL_TAB = {title: '详情', update: true, error: null};
    const tabList = [SONG_TAB, ALBUM_TAB, MV_TAB, DETAIL_TAB];
    const tabMap = reactive({value: SONG_TAB, tabList, SONG_TAB, ALBUM_TAB, MV_TAB, DETAIL_TAB});

    const page = reactive({current: 1, size: 30, total: 1});

    const singer = reactive({
      mid: '', name: '', cover: '', introduce: '',
      songCount: '-', albumCount: '-', mvCount: '-', fansCount: '-'
    });

    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer',},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100}
    ]);

    // TODO 数据源API待修改
    const $source = {};

    const router = useRouter();

    /**
     *  处理选项卡改变事件
     *  @param newTab { UnwrapRef<{update: boolean, title: string, error: null}>} 新选定的选项卡
     *  @return {any} 任意值
     */
    const handleTabChanged = newTab => {
      if (!newTab || !newTab.update) return;

      newTab.update = false;

      if (newTab === tabMap.SONG_TAB) {
        Spinner.open();
        return $source.impl.handleSingerInfo(singer).then(success =>
            success ? $source.impl.singerSongList(singer, page) : null)
            .then(res => songList.splice(0, songList.length, ...res))
            .finally(Spinner.close);
      }

      if (newTab === tabMap.ALBUM_TAB) {
        Spinner.open();
        return $source.impl.singerAlbumList(singer, page)
            .then(res => albumList.splice(0, albumList.length, ...res))
            .finally(Spinner.close);
      }

      if (newTab === tabMap.MV_TAB) {
        Spinner.open();
        return $source.impl.singerMvList(singer, page)
            .then(res => mvList.splice(0, mvList.length, ...res))
            .finally(Spinner.close);
      }
    };

    // 监听查询参数改变
    watch(() => props.query, value => {
      if (singer.mid !== value.mid && value.mid) {
        singer.mid = value.mid;
        singer.name = value.name;
        singer.cover = value.cover;
        singer.songCount = value.songCount;
        singer.albumCount = value.albumCount;
        singer.mvCount = value.mvCount;
        singer.fansCount = value.fansCount;

        tabMap.tabList.forEach(tab => tab.error = !(tab.update = true))
        // 若当前是歌曲选项卡,则手动调用handleChange方法处理
        if (tabMap.value === tabMap.SONG_TAB) {
          handleTabChanged(tabMap.SONG_TAB);
        } else {
          // 否则通过改变选项卡 触发handleChange方法
          tabMap.value = tabMap.SONG_TAB;
        }
      }
    }, {immediate: true});

    // 监听选项卡选择改变
    watch(() => tabMap.value, handleTabChanged);

    return {
      tabMap, singer, columns, songList, albumList, mvList, page,

      /**
       * 表格行单元格双击时的回调方法
       * @param index {Number} 行单元格索引
       */
      onCellClick(index) {
        player.playMediaList(songList, index);
      },

      print: () => print(),

      /**
       * 专辑列表项点击
       * @param event {MouseEvent} 鼠标点击事件
       */
      onAlbumItemClicked(event) {
        let node = event.target, classList = node.classList;
        if (classList.contains('cover') || classList.contains('name')) {
          let attr = node.parentNode.attributes.getNamedItem('data-index');
          let index = attr.value - 0, album = index >= 0 ? albumList[index] : null;
          return album ? router.push({path: '/album-view', query: {...album}}) : null;
        }
      },

      loadDataList() {
        if (page.total < 2 || page.current >= page.total) {
          return;
        }

        ++page.current;
        Spinner.open();

        $source.impl.singerSongList(singer, page)
            .then(res => songList.push(...res))
            .finally(Spinner.close);
      },
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