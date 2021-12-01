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

      <table-view style='flex:auto;' :columns='columns' :data='songList' @row-dblclick='onCellClick'
                  v-show='tabMap.value===tabMap.SONG_TAB' @infinite-scroll='loadDataList'>
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

      <grid-view cell-widths='repeat(auto-fit, 13em)' v-show='tabMap.value===tabMap.ALBUM_TAB' :data='albumList'
                 @infinite-scroll='loadAlbumData' :cell-height='234' @cell-click='onAlbumItemClicked'>
        <template v-slot='{item}'>
          <img alt class=cover :src='item.cover' loading='lazy'/>
          <div class='name'>{{ item.name }}</div>
        </template>
      </grid-view>

      <grid-view class='arc-rect' cell-widths='repeat(auto-fit, 16em)' :data='mvList'
                 :cell-height='206' @infinite-scroll='loadMvData' v-show='tabMap.value===tabMap.MV_TAB'>
        <template v-slot='{item}'>
          <img alt class=cover :src='item.cover' loading='lazy'/>
          <div>
            <span class='link' v-for='(singer, index) in item.singer' :key='index' :data-mid='singer.mid'>
              {{ singer.name }}
            </span>
            -<span>{{ item.title }}</span>
          </div>
        </template>
      </grid-view>

      <div v-show='tabMap.value===tabMap.DETAIL_TAB' class='label'>{{ singer.introduce }}</div>
    </div>
  </div>
</template>

<script>
import player from '../player';
import Spinner from '../components/Spinner';
import {getSingerAlbumList, getSingerMvList, getSingerSongList} from '../api';
import {convertSinger} from '../../utils';

import {reactive, watch} from 'vue';
import {useRouter} from 'vue-router';

/**
 *
 * @typedef {Object} Tab              选项卡
 *
 * @property {string} title           选项卡标题
 * @property {boolean} update         数据是否需要更新
 * @property {Page | undefined} page  选项卡对应的视图是分页信息
 */

export default {
  name: 'SingerView',
  props: {query: Object},

  setup(props) {
    const singer = reactive(/** @type {Singer} */{});
    const songList = reactive(/** @type {Song[]} */[]);
    const albumList = reactive(/** @type {Album[]} */[]);
    const mvList = reactive(/** @type {Mv[]} */[]);

    const SONG_TAB = /** @type {Tab} */ {title: '歌曲', update: true, page: {current: 1, size: 30}};
    const ALBUM_TAB = /** @type {Tab} */ {title: '专辑', update: true, page: {current: 1, size: 30}};
    const MV_TAB = /** @type {Tab} */ {title: 'MV', update: true, page: {current: 1, size: 30}};
    const DETAIL_TAB = /** @type {Tab} */ {title: '详情', update: true};
    const tabList = [SONG_TAB, ALBUM_TAB, MV_TAB, DETAIL_TAB];
    const tabMap = reactive({value: SONG_TAB, tabList, SONG_TAB, ALBUM_TAB, MV_TAB, DETAIL_TAB});

    const columns = reactive(/** @type {TableColumn[]} */[
      {type: 'index', width: '100px'},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: '100px'}
    ]);

    const router = useRouter();

    /**
     * 处理选项卡改变事件
     *
     * @param {Tab} newTab 新选定的选项卡
     */
    const handleTabChanged = newTab => {
      // 若未选定任何一个选项卡 或 当前选项卡无需更新数据, 则什么也不做
      if (!newTab || !newTab.update) return;
      // 立刻重置为无需更新状态
      newTab.update = false;

      if (newTab === tabMap.SONG_TAB) {
        Spinner.open();
        return getSingerSongList(newTab.page, singer).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);
          // 修改歌手信息
          data.singer && Object.assign(singer, data.singer);
          // 添加歌曲
          data.list.forEach(convertSinger);
          songList.splice(0, songList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);
      }

      if (newTab === tabMap.ALBUM_TAB) {
        Spinner.open();
        return getSingerAlbumList(newTab.page, singer).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);
          // 添加专辑
          albumList.splice(0, albumList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);
      }

      if (newTab === tabMap.MV_TAB) {
        Spinner.open();
        getSingerMvList(newTab.page, singer).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);
          // 添加Mv
          data.list.forEach(convertSinger);
          mvList.splice(0, mvList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);
      }
    };

    // 监听查询参数改变
    watch(() => props.query, value => {
      if (singer.mid !== value.mid && value.mid) {
        // 重设歌手信息
        Object.assign(singer, value);

        tabMap.tabList.forEach(tab => {
          tab.update = true;
          if (tab.page) {
            // 清除分页数据
            tab.page.total = 0;
            tab.page.current = 1;
            tab.page.pageCount = 0;
          }
        });

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
    watch(() => tabMap.value,/** @type {WatchCallback<UnwrapRef<Tab>, UnwrapRef<Tab>>} */ handleTabChanged);

    return {
      tabMap, singer, columns, songList, albumList, mvList,

      /**
       * 表格行单元格双击时的回调方法
       * @param {number} index 行单元格索引
       */
      onCellClick(index) {
        player.playMediaList(songList, index);
      },

      print: () => print(),

      /**
       * 当专辑列表项点击时,跳转到专辑视图
       *
       * @param {Album} album 鼠标点击事件
       */
      onAlbumItemClicked(album) {
        // 若存在专辑信息, 则跳转到专辑视图
        album && router.push({path: '/album-view', query: {...album, singer: null}});
      },

      /** 加载歌曲数据到表格视图中 */
      loadDataList() {
        const page = tabMap.SONG_TAB.page;

        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          ++page.current;
          Spinner.open();

          getSingerSongList(page, singer).then(data => {
            // 重设置分页信息
            data.page && Object.assign(page, data.page);
            // 转换歌手为Array类型
            data.list.forEach(convertSinger);
            // 添加歌曲
            songList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadAlbumData() {
        const page = tabMap.MV_TAB.page;
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          getSingerAlbumList(page, singer).then(data => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);
            // 添加专辑
            albumList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadMvData() {
        const page = tabMap.MV_TAB.page;
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          getSingerMvList(page, singer).then(data => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);
            // 添加Mv
            data.list.forEach(convertSinger);
            mvList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      }

    };
  }
}
</script>