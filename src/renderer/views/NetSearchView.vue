<template>
  <div class='v-row data-container' v-if='singer'>
    <image-view v-model='singer.cover' defaultValue='/icon/singer.png'/>

    <div class='v-column'>
      <div>{{ singer.name || '-' }}</div>

      <div class='v-row data-statistic'>
        <span class='statistic-item'>单曲：{{ singer.songCount || '-' }}</span>
        <span class='statistic-item'>专辑：{{ singer.albumCount || '-' }}</span>
        <span class='statistic-item'>MV：{{ singer.mvCount || '-' }}</span>
        <span class='statistic-item'>粉丝：{{ singer.fansCount || '-' }}</span>
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
          <span class='cell-text'>{{ item.title }}</span>
          <icon class='mv-icon' name='mv' width='1em' height='1em' v-if='item.vid'/>
        </template>

        <template v-slot:singer='{item:{singer:singers = []}}'>
        <span class='link cell-text' v-for='(singer, index) in singers' :key='index'
              :data-mid='singer.mid'>{{ singer.name }}</span>
        </template>

        <template v-slot:album='{item: {album = {} }}'>
          <span class='link cell-text' :data-mid='album.mid'>{{ album.name }}</span>
        </template>
      </table-view>

      <grid-view cell-widths='repeat(auto-fit, 13em)' v-show='tabMap.value===tabMap.ALBUM_TAB' :data='albumList'
                 @infinite-scroll='loadAlbumData' :cell-height='234' @cell-click='onAlbumItemClicked'>
        <template v-slot='{item}'>
          <image-view v-model='item.cover' defaultValue='/icon/album.png'/>
          <div class='name'>{{ item.name }}</div>
        </template>
      </grid-view>

      <grid-view class='arc-rect' cell-widths='repeat(auto-fit, 16em)' :data='mvList'
                 :cell-height='206' @infinite-scroll='loadMvData' v-show='tabMap.value===tabMap.MV_TAB'>
        <template v-slot='{item}'>
          <image-view v-model='item.cover' defaultValue='/icon/mv.png'/>
          <div>
            <span class='link' v-for='(singer, index) in item.singer' :key='index' :data-mid='singer.mid'>
              {{ singer.name }}
            </span>
            -<span>{{ item.title }}</span>
          </div>
        </template>
      </grid-view>

      <div v-show='tabMap.value===tabMap.SPECIAL_TAB'>
        <grid-view style='margin-top:1em' :data='specialList' cell-widths='repeat(auto-fit, 13em)'
                   :cell-height='234' @infinite-scroll='loadSpecialData'>
          <template v-slot='{item}'>
            <image-view v-model='item.cover' defaultValue='/icon/special.png'/>
            <div class='name'>{{ item.name }}</div>
          </template>
        </grid-view>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import player from '../player';
import Spinner from '../components/Spinner';

import {TableColumn} from '../components/types';
import {Album, Mv, Singer, Song, ComputedPage, Special} from '../../types';
import {searchAlbum, searchMv, searchSinger, searchSong, searchSpecial} from '../api';

import {PropType, reactive, watch, defineComponent} from 'vue';
import {useRouter} from 'vue-router';

/**
 * 选项卡信息
 */
type Tab = {
  /** 选项卡标题 */
  title: string;
  /** 数据是否需要更新 */
  update: boolean;
  /** 选项卡对应的视图是分页信息 */
  page: ComputedPage;
};

export default defineComponent({
  name: 'NetSearchView',

  props: {
    query: {type: Object as PropType<{ value: string }>, required: true}
  },

  setup(props) {
    const singer = reactive<Singer>({});
    const songList = reactive<Song[]>([]);
    const mvList = reactive<Mv[]>([]);
    const albumList = reactive<Album[]>([]);
    const specialList = reactive<Special[]>([]);

    const MV_TAB: Tab = {title: 'MV', update: true, page: {current: 1, size: 30} as ComputedPage};
    const SONG_TAB: Tab = {title: '歌曲', update: true, page: {current: 1, size: 30} as ComputedPage};
    const ALBUM_TAB: Tab = {title: '专辑', update: true, page: {current: 1, size: 30} as ComputedPage};
    const SPECIAL_TAB: Tab = {title: '歌单', update: true, page: {current: 1, size: 30} as ComputedPage};
    const tabList = [SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB];
    const tabMap = reactive({value: SONG_TAB, tabList, SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB});

    const columns = reactive<TableColumn[]>([
      {type: 'index', width: '100px'},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: '100px'}
    ]);

    const router = useRouter();

    let $query: string = '';

    /**
     * 处理选项卡改变事件
     *
     * @param newTab 新选定的选项卡
     */
    const handleTabChanged = (newTab: Tab) => {
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

    watch(() => tabMap.value, handleTabChanged);

    watch(() => props.query, newQuery => {
      // 若不相等 且 新的查询参数是有效的(不能null或undefined)
      if (newQuery.value && $query !== newQuery.value) {
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
       * @param {number} rowIndex 行单元格索引
       */
      onCellClick: (rowIndex: number) => player.playMediaList(songList, rowIndex),

      print: () => print(),

      /**
       * 当专辑列表项点击时,跳转到专辑视图
       *
       * @param event 点击事件
       */
      onAlbumItemClicked(event: PointerEvent) {
        const node = event.target as HTMLElement, classList = node.classList;
        if (classList.contains('cover') || classList.contains('name')) {
          // 获取数据索引
          const value = (node.parentNode as HTMLElement).getAttribute('data-index');
          const index = value ? Number(value) : -1;
          // 提取专辑信息
          const album = albumList[index] && {...albumList[index], singer: null};
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

          searchAlbum(page, $query).then(data => {
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

          searchMv(page, $query).then(data => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);

            // 添加Mv
            mvList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadSpecialData() {
        const page = tabMap.SPECIAL_TAB.page;

        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          searchSpecial(page, $query).then(data => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);

            // 添加歌单
            specialList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      }

    };
  }

});
</script>