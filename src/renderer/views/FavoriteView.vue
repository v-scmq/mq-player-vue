<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import CButton from '@/components/CButton.vue';
import CPopover from '@/components/CPopover.vue';
import CTable from '@/components/CTable.vue';
import CIcon from '@/components/CIcon.vue';
import CGrid from '@/components/CGrid.vue';
import CImage from '@/components/CImage.vue';
import CTabPane from '@/components/CTabPane.vue';

import player from '@/player';
import { Spinner } from '@/components/spinner';

import { usePlayMedias, unhandledFn } from '@/hooks';

// import { getLikeSongs, getLikeAlbums, getLikeMvs, getLikeSpecials, getMySpecials } from '@/api';

import type { TableColumn, Tab as BaseTab } from '../components/types';
import type { Album, Mv, ComputedPage, Special } from '@/types';

type TabName = 'song' | 'album' | 'mv' | 'special';

/**
 * 选项卡信息
 */
type Tab = BaseTab & {
  /** 选项卡标题 */
  title: string;
  name: TabName;
  /** 数据是否需要更新 */
  update: boolean;
  /** 选项卡对应的视图是分页信息 */
  page: ComputedPage;
};

const [songList, selectSongs, multiple, playSongs] = usePlayMedias();
const mvList = reactive<Mv[]>([]);
const albumList = reactive<Album[]>([]);
const specialList = reactive<Special[]>([]);

const MV_TAB = { title: 'MV', name: 'mv', update: true, page: { current: 1, size: 30 } } as Tab;
const SONG_TAB = { title: '歌曲', name: 'song', update: true, page: { current: 1, size: 30 } } as Tab;
const ALBUM_TAB = { title: '专辑', name: 'album', update: true, page: { current: 1, size: 30 } } as Tab;
const SPECIAL_TAB = { title: '歌单', name: 'special', update: true, page: { current: 1, size: 30 } } as Tab;

const tabs = [SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB];
const activeTabName = ref<TabName>('song');

const columns: TableColumn[] = [
  { type: 'index', width: '100px' },
  { title: '歌曲', property: 'title', flex: true },
  { title: '歌手', property: 'singer' },
  { title: '专辑', property: 'album' },
  { title: '时长', property: 'duration', width: '100px' }
];

// 当前登录的用户歌单
const userSpecials = reactive<Special[]>([]);
const router = useRouter();

/**
 * 处理选项卡改变事件
 *
 * @param newTab 新选定的选项卡
 */
const handleTabChanged = (newTab: Tab) => {
  activeTabName.value = newTab.name;

  // 若未选定任何一个选项卡 或 当前选项卡无需更新数据, 则什么也不做
  if (!newTab.update) {
    return;
  }

  // 立刻重置为无需更新状态
  newTab.update = false;

  // 打开进度指示器
  Spinner.open();

  // 分页信息
  // const page = newTab.page as ComputedPage;

  // 若选定歌曲选项卡
  if (newTab.name === SONG_TAB.name) {
    // 获取收藏的歌曲列表
    // getLikeSongs(page).then(({ data, error }) => {
    //   Index.close();
    //   error && (newTab.update = true);
    //   // 修改分页信息
    //   data && Object.assign(page, data.page);
    //   // 添加歌曲
    //   data && songList.splice(0, songList.length, ...data.list);
    // });
  }

  if (newTab.name === ALBUM_TAB.name) {
    // 获取收藏的专辑列表
    // getLikeAlbums(page).then(({ data, error }) => {
    //   Index.close();
    //   error && (newTab.update = true);
    //   // 修改分页信息
    //   data && Object.assign(page, data.page);
    //   // 添加专辑
    //   data && albumList.splice(0, albumList.length, ...data.list);
    // });
  }

  if (newTab.name === MV_TAB.name) {
    // 获取收藏的mv列表
    // getLikeMvs(page).then(({ data, error }) => {
    //   Index.close();
    //   error && (newTab.update = true);
    //   // 修改分页信息
    //   data && Object.assign(page, data.page);
    //   // 添加Mv
    //   data && mvList.splice(0, mvList.length, ...data.list);
    // });
  }

  if (newTab.name === 'special') {
    // 获取收藏的歌单
    // getLikeSpecials(page).then(({ data, error }) => {
    //   Index.close();
    //   error && (newTab.update = true);
    //   // 修改分页信息
    //   data && Object.assign(page, data.page);
    //   // 添加歌单
    //   data && specialList.splice(0, specialList.length, ...data.list);
    // });
  }
};

/**
 * 当专辑列表项点击时,跳转到专辑视图
 *
 * @param event 点击事件
 */
const onAlbumItemClicked = (event: PointerEvent) => {
  const node = event.target as HTMLElement;
  const classList = node.classList;

  if (classList.contains('cover') || classList.contains('name')) {
    // 获取数据索引
    const value = (node.parentNode as HTMLElement).getAttribute('data-index');
    const index = value ? Number(value) : -1;
    // 提取专辑信息
    const album = albumList[index] && { ...albumList[index], singer: null };
    // 若存在专辑信息, 则跳转到专辑视图
    album && router.push({ path: '/album-view', query: album });
  }
};

const loadDataList = () => {
  const page = SONG_TAB.page;

  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  // 若还有数据, 则发起网络请求加载歌曲数据列表

  // TODO 获取收藏的歌曲列表
  // getLikeSongs(page).then(({ data, error }) => {
  //   Index.close();
  //   error && --page.current;
  //   // 重设置分页信息
  //   data && Object.assign(page, data.page);
  //   // 添加歌曲
  //   data && songList.push(...data.list);
  // });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadAlbumData = () => {
  const page = MV_TAB.page;

  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  // 获取收藏的专辑列表
  // getLikeAlbums(page).then(({ data, error }) => {
  //   Index.close();
  //   error && --page.current;
  //   // 修改分页信息
  //   data && Object.assign(page, data.page);
  //   // 添加专辑
  //   data && albumList.push(...data.list);
  // });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadMvData = () => {
  const page = MV_TAB.page;

  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  // getLikeMvs(page).then(({ data, error }) => {
  //   Index.close();
  //   error && --page.current;
  //   // 修改分页信息
  //   data && Object.assign(page, data.page);
  //
  //   // 添加Mv
  //   data && mvList.push(...data.list);
  // });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadSpecialData = () => {
  const page = SPECIAL_TAB.page;

  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  // getLikeSpecials(page).then(({ data, error }) => {
  //   Index.close();
  //   error && --page.current;
  //   // 修改分页信息
  //   data.page && Object.assign(page, data.page);
  //
  //   // 添加歌单
  //   specialList.push(...data.list);
  // });
};

const loadProfileSpecial = () => {
  const updatable = userSpecials as any;

  const millis = new Date().getTime();
  // 若时间差不到15秒, 则不获取更新
  if (millis - (updatable.$time || 0) < 15000) {
    return;
  }

  Spinner.open();
  updatable.$time = millis;

  // getMySpecials().then(({ data }) => {
  //   data && userSpecials.push(...data.list);
  // });
};

// // 主动调用tab改变处理器方法
// handleTabChanged(SONG_TAB);
</script>

<template>
  <c-tab-pane :tabs="tabs" :activeTabName="activeTabName" @tabChange="handleTabChanged">
    <template #song>
      <div class="row" style="padding-bottom: 1em; --button-icon-size: 1.5em">
        <c-button icon="play-select" @click="playSongs">播放全部</c-button>

        <c-popover content-class="dropdown">
          <c-button icon="plus" @click="loadProfileSpecial">添加到</c-button>
          <template #content>
            <div class="dropdown-item separator first">我的收藏</div>
            <div
              class="dropdown-item"
              :class="{ separator: index + 1 === userSpecials.length }"
              :data-index="index"
              v-for="(item, index) in userSpecials"
              :key="index"
            >
              {{ item.name }}
            </div>
            <div class="dropdown-item last">添加到新歌单</div>
          </template>
        </c-popover>

        <c-button icon="my-download" @click="unhandledFn">下载</c-button>
        <c-button icon="trash" @click="unhandledFn">删除</c-button>
        <c-button icon="multiple" @click="multiple = !multiple">{{ multiple ? '退出批量操作' : '批量操作' }}</c-button>
      </div>

      <c-table
        style="flex: auto"
        :data="songList"
        :columns="columns"
        v-model:multiple="multiple"
        v-model:selections="selectSongs"
        @row-dblclick="player.playMedias"
        @infinite-scroll="loadDataList"
      >
        <template #title="{ item }">
          <span class="cell-text">{{ item.title }}</span>
          <c-icon class="vip-icon" name="vip" v-if="item.vip" />
          <c-icon class="mv-icon" name="mv" v-if="item.vid" />
        </template>

        <template #singer="{ item: { singer: singers = [] } }">
          <span class="link cell-text" v-for="(singer, index) in singers" :key="index" :data-mid="singer.mid">{{
            singer.name
          }}</span>
        </template>

        <template #album="{ item: { album } }">
          <span class="link cell-text" :data-mid="album.mid" v-if="album">{{ album.name }}</span>
        </template>
      </c-table>
    </template>

    <template #album>
      <c-grid
        cell-widths="repeat(auto-fit, 13em)"
        :cell-height="234"
        :data="albumList"
        @infinite-scroll="loadAlbumData"
        @cell-click="onAlbumItemClicked"
      >
        <template v-slot="{ item }">
          <c-image v-model="item.cover" error="image/album.png" />
          <div class="name">{{ item.name }}</div>
        </template>
      </c-grid>
    </template>

    <template #mv>
      <c-grid
        class="arc-rect"
        cell-widths="repeat(auto-fit, 16em)"
        :data="mvList"
        :cell-height="206"
        @infinite-scroll="loadMvData"
      >
        <template v-slot="{ item }">
          <c-image v-model="item.cover" error="image/mv.png" />
          <div>
            <span class="link" v-for="(singer, index) in item.singer" :key="index" :data-mid="singer.mid">
              {{ singer.name }}
            </span>
            -<span>{{ item.title }}</span>
          </div>
        </template>
      </c-grid>
    </template>

    <template #special>
      <c-grid
        style="margin-top: 1em"
        cell-widths="repeat(auto-fit, 13em)"
        :cell-height="234"
        :data="specialList"
        @infinite-scroll="loadSpecialData"
      >
        <template v-slot="{ item }">
          <c-image v-model="item.cover" error="icon/special.png" />
          <div class="name">{{ item.name }}</div>
        </template>
      </c-grid>
    </template>
  </c-tab-pane>
</template>
