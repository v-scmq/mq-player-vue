<template>
  <div class='v-row singer-info-container' v-if='singer'>
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
        <Button text='播放全部'/>
        <Button text='播放全部'/>
        <Button text='打印预览' @click='print'/>
      </div>
    </div>
  </div>

  <div class='tab-pane v-column'>
    <div class='v-row tab-container' style='justify-content:center;'>

      <div class='tab' v-for='(tab,index) in tabMap.tabList' :key='index'
           :class='{active: tabMap.value === tab}' @click='tabMap.value = tab'>
        {{ tab.title }}
      </div>
    </div>

    <div class='tab-content v-column'>
      <table-view :columns='columns' :data='songList' style='flex:auto;' @row-dblclick='onCellClick'
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

      <div v-show='tabMap.value===tabMap.SPECIAL_TAB' class='label'>歌单list</div>
    </div>
  </div>
</template>

<script>
import player from '../player';
import Spinner from '../components/Spinner';
import {searchAlbum, searchMv, searchSinger, searchSong, searchSpecial} from '../api';
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
  name: 'NetSearchView',

  props: {query: Object},

  setup(props) {
    const singer = reactive(/** @type {Singer} */{});
    const songList = reactive(/** @type {Song[]} */[]);
    const mvList = reactive(/** @type {Mv[]} */[]);
    const albumList = reactive(/** @type {Album[]} */[]);
    const specialList = reactive(/** @type {Special[]} */[]);

    const MV_TAB =/** @type {Tab} */  {title: 'MV', update: true, page: {current: 1, size: 30}};
    const SONG_TAB =/** @type {Tab} */  {title: '歌曲', update: true, page: {current: 1, size: 30}};
    const ALBUM_TAB =/** @type {Tab} */  {title: '专辑', update: true, page: {current: 1, size: 30}};
    const SPECIAL_TAB =/** @type {Tab} */  {title: '歌单', update: true, page: {current: 1, size: 30}};
    const tabList = [SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB];
    const tabMap = reactive({value: SONG_TAB, tabList, SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB});

    const columns = reactive(/** @type {TableColumn[]} */[
      {type: 'index', width: '100px'},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: '100px'}
    ]);

    const router = useRouter();
    let $query = null;

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

      // 若选定歌曲选项卡
      if (newTab === tabMap.SONG_TAB) {
        // 打开进度指示器
        Spinner.open();

        // 搜索歌手 => 处理并展示歌手基本数据 => 歌曲搜索 => 显示歌曲数据 => 关闭进度指示器
        searchSinger($query).then(data => {
          const [singerInfo] = data.list || [];
          singerInfo && Object.assign(singer, singerInfo);

          return searchSong(newTab.page, $query);

        }).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);
          // 添加歌曲
          data.list.forEach(convertSinger);
          songList.splice(0, songList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);

      } else if (newTab === tabMap.ALBUM_TAB) {
        Spinner.open();

        searchAlbum(newTab.page, $query).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);
          // 添加专辑
          albumList.splice(0, albumList.length, ...data.list);

        }).finally(Spinner.close);

      } else if (newTab === tabMap.MV_TAB) {
        Spinner.open();
        searchMv(newTab.page, $query).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);

          // 添加Mv
          data.list.forEach(convertSinger);
          mvList.splice(0, mvList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);

      } else if (newTab === tabMap.SPECIAL_TAB) {
        // 打开进度指示器
        Spinner.open();
        searchSpecial(newTab.page, $query).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);

          // 添加歌单
          specialList.splice(0, specialList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);
      }
    };

    watch(() => tabMap.value, /** @type {WatchCallback<UnwrapRef<Tab>, UnwrapRef<Tab>>} */ handleTabChanged);

    watch(() => props.query, newQuery => {
      // 若不相等 且 新的查询参数是有效的(不能null或undefined)
      if ($query !== newQuery.value && newQuery.value) {
        $query = newQuery.value;
        tabMap.tabList.forEach(tab => {
          tab.update = true;
          // 清除分页数据
          tab.page.total = 0;
          tab.page.current = 1;
          tab.page.pageCount = 0;
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

    return {
      tabMap, singer, columns, songList, albumList, mvList, specialList,

      /**
       * 表格行单元格双击时的回调方法
       *
       * @param {number} row 行单元格索引
       */
      onCellClick: row => player.playMediaList(songList, row),

      print: () => print(),

      /**
       * 当专辑列表项点击时,跳转到专辑视图
       *
       * @param {MouseEvent} event 鼠标点击事件
       */
      onAlbumItemClicked(event) {
        const node = event.target, classList = node.classList;
        if (classList.contains('cover') || classList.contains('name')) {
          // 获取数据索引
          let {value} = node.parentNode.attributes.getNamedItem('data-index') || {};
          // 提取专辑信息
          const album = albumList[value = (value - 0)] && {...albumList[value], singer: null};
          // 若存在专辑信息, 则跳转到专辑视图
          album && router.push({path: '/album-view', query: album});
        }
      },

      loadDataList() {
        const page = tabMap.SONG_TAB.page;

        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          ++page.current;
          Spinner.open();

          searchSong(page, $query).then(data => {
            // 重设置分页信息
            data.page && Object.assign(page, data.page);
            // 转换歌手为Array类型
            data.list.forEach(convertSinger);
            // 添加歌曲
            songList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
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