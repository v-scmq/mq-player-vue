<template>
  <div class='tab-pane v-column'>
    <div class='v-row tab-container' style='justify-content:center;'>

      <div class='tab' v-for='(tab,index) in tabMap.tabList' :key='index'
           :class='{active: tabMap.value === tab}' @click='tabMap.value = tab'>
        {{ tab.title }}
      </div>
    </div>

    <div class='tab-content v-column'>
      <div class='v-row' style='gap:8px;margin:0 0 1em 0' v-show='tabMap.value===tabMap.SONG_TAB'>
        <Button text='播放全部' prefixIcon='play-select' prefixIconSize='1.5em'/>

        <popover content-class='dropdown'>
          <Button text="添加到" prefixIcon='plus' prefixIconSize='1.5em' @click='loadProfileSpecial'/>
          <template v-slot:content>
            <div class='dropdown-item separator first'>我的收藏</div>
            <div class='dropdown-item' :class='{separator: index + 1 === userSpecials.length}'
                 :data-index='index' v-for='(item, index) in userSpecials' :key='index'>
              {{ item.name }}
            </div>
            <div class='dropdown-item last'>添加到新歌单</div>
          </template>
        </popover>

        <Button text="下载" prefixIcon='my-download' prefixIconSize='1.5em'/>
        <Button text="删除" prefixIcon='trash' prefixIconSize='1.5em'/>
        <Button :text="multiple ? '退出批量操作':'批量操作'" prefixIcon='multiple' prefixIconSize='1.5em' @click='onMultiple'/>
      </div>
      <table-view :columns='columns' :data='songList' style='flex:auto;' @row-dblclick='playMediaList'
                  v-show='tabMap.value===tabMap.SONG_TAB' @infinite-scroll='loadDataList'>
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

      <grid-view cell-widths='repeat(auto-fit, 13em)' v-show='tabMap.value===tabMap.ALBUM_TAB' :data='albumList'
                 @infinite-scroll='loadAlbumData' :cell-height='234' @cell-click='onAlbumItemClicked'>
        <template v-slot='{item}'>
          <image-view v-model='item.cover' defaultValue='icon/album.png'/>
          <div class='name'>{{ item.name }}</div>
        </template>
      </grid-view>

      <grid-view class='arc-rect' cell-widths='repeat(auto-fit, 16em)' :data='mvList'
                 :cell-height='206' @infinite-scroll='loadMvData' v-show='tabMap.value===tabMap.MV_TAB'>
        <template v-slot='{item}'>
          <image-view v-model='item.cover' defaultValue='icon/mv.png'/>
          <div>
            <span class='link' v-for='(singer, index) in item.singer' :key='index' :data-mid='singer.mid'>
              {{ singer.name }}
            </span>
            -<span>{{ item.title }}</span>
          </div>
        </template>
      </grid-view>

      <grid-view style='margin-top:1em' cell-widths='repeat(auto-fit, 13em)' :cell-height='234' :data='specialList'
                 v-show='tabMap.value===tabMap.SPECIAL_TAB' @infinite-scroll='loadSpecialData'>
        <template v-slot='{item}'>
          <image-view v-model='item.cover' defaultValue='icon/special.png'/>
          <div class='name'>{{ item.name }}</div>
        </template>
      </grid-view>
    </div>
  </div>
</template>

<script lang='ts'>
import {playMediaList} from '../player/hooks';
import Spinner from '../components/Spinner';

import {TableColumn} from '../components/types';
import {Album, Mv, Song, ComputedPage, Special} from '../../types';
import {getLikeSongs, getLikeAlbums, getLikeMvs, getLikeSpecials, getProfileSpecials} from '../api';

import {reactive, watch, defineComponent, ref} from 'vue';
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
  name: 'Favorite',

  setup() {
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
      {title: '歌曲', property: 'title', flex: true},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: '100px'}
    ]);

    const multiple = ref(false);

    // 当前登录的用户歌单
    const userSpecials = reactive<Special[]>([]);

    const router = useRouter();

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

        // 获取收藏的歌曲列表
        getLikeSongs(newTab.page).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);
          // 添加歌曲
          songList.splice(0, songList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);

      } else if (newTab === tabMap.ALBUM_TAB) {
        Spinner.open();

        // 获取收藏的专辑列表
        getLikeAlbums(newTab.page).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);
          // 添加专辑
          albumList.splice(0, albumList.length, ...data.list);

        }).finally(Spinner.close);

      } else if (newTab === tabMap.MV_TAB) {
        Spinner.open();

        // 获取收藏的mv列表
        getLikeMvs(newTab.page).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);

          // 添加Mv
          mvList.splice(0, mvList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);

      } else if (newTab === tabMap.SPECIAL_TAB) {
        // 打开进度指示器
        Spinner.open();

        // 获取收藏的歌单
        getLikeSpecials(newTab.page).then(data => {
          // 修改分页信息
          data.page && Object.assign(newTab.page, data.page);

          // 添加歌单
          specialList.splice(0, specialList.length, ...data.list);

        }).catch(() => newTab.update = true).finally(Spinner.close);
      }
    };

    watch(() => tabMap.value, handleTabChanged);
    // 主动调用tab改变处理器方法
    handleTabChanged(tabMap.SONG_TAB);

    return {
      tabMap, columns, songList, albumList, mvList, specialList, multiple, userSpecials,

      playMediaList,

      /** 开始或结束批量操作 */
      onMultiple: () => {
        let column = columns[0];
        column.type = column.type === 'index' ? 'checkbox' : 'index';
        multiple.value = !multiple.value
      },

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

          // 获取收藏的歌曲列表
          getLikeSongs(page).then(data => {
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

          // 获取收藏的专辑列表
          getLikeAlbums(page).then(data => {
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

          getLikeMvs(page).then(data => {
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

          getLikeSpecials(page).then(data => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);

            // 添加歌单
            specialList.push(...data.list);
          }).catch(() => --page.current).finally(Spinner.close);
        }
      },

      loadProfileSpecial() {
        const updatable = userSpecials as any;

        const millis = new Date().getTime();
        // 若时间差不到15秒, 则不获取更新
        if ((millis - (updatable.$time || 0)) < 15000) {
          return;
        }

        updatable.$time = millis;

        Spinner.open();

        getProfileSpecials()
            .then(data => void (data && userSpecials.push(...data.list)))
            .finally(Spinner.close);
      }

    };
  }

});
</script>