<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import CImage from '@/components/CImage.vue';
import CButton from '@/components/CButton.vue';
import CTabPane from '@/components/CTabPane.vue';
import CTable from '@/components/CTable.vue';
import CIcon from '@/components/CIcon.vue';
import CGrid from '@/components/CGrid.vue';

import player from '@/player';
import { Spinner } from '@/components/spinner';

import { usePlayMedias, useDownload, unhandledFn } from '@/hooks';

import { getQueryAlbums, getQueryMvs, getQuerySingers, getQuerySongs, getQuerySpecials } from '@/api';

import type { TableColumn } from '@/components/types';
import type { Album, ComputedPage, Mv, Singer, Special } from '@/types';

type TabName = 'song' | 'album' | 'mv' | 'special';

/**
 * 选项卡信息
 */
type Tab = {
  /** 选项卡标题 */
  title: string;
  name: TabName;
  /** 数据是否需要更新 */
  update: boolean;
  /** 选项卡对应的视图是分页信息 */
  page: ComputedPage;
};

const props = defineProps({
  query: { type: String, required: true }
});

const [songList, selectSongs, multiple, playSongs] = usePlayMedias();

const singer = reactive<Singer>({});
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

let $query = '';
const router = useRouter();
const downloadFn = useDownload(songList, selectSongs);

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

  // 打开进度指示器
  Spinner.open();

  // 立刻重置为无需更新状态
  newTab.update = false;

  // 分页信息
  const page = newTab.page as ComputedPage;
  const tabName = newTab.name;
  const keyword = $query;

  // 若选定歌曲选项卡
  if (tabName === SONG_TAB.name) {
    // 搜索歌手 => 处理并展示歌手基本数据 => 歌曲搜索 => 显示歌曲数据 => 关闭进度指示器
    getQuerySingers({ keyword, page: { current: 1, size: 8 } })
      .then(({ data }) => {
        const [singerInfo] = data || [];
        singerInfo && Object.assign(singer, singerInfo);

        return getQuerySongs({ page, keyword });
      })
      .then(({ data }) => {
        // 修改分页信息
        data && Object.assign(page, data.page);
        // 添加歌曲
        data && songList.splice(0, songList.length, ...data.list);
      })
      .catch(() => (newTab.update = true))
      .finally(Spinner.close);
  }

  // 专辑选项卡
  else if (tabName === ALBUM_TAB.name) {
    Spinner.open();

    getQueryAlbums({ page, keyword }).then(({ data, error }) => {
      Spinner.close();
      error && (newTab.update = true);
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加专辑
      data && albumList.splice(0, albumList.length, ...data.list);
    });
  }

  // MV选项卡
  else if (tabName === MV_TAB.name) {
    getQueryMvs({ page, keyword }).then(({ data, error }) => {
      Spinner.close();
      error && (newTab.update = true);
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加Mv
      data && mvList.splice(0, mvList.length, ...data.list);
    });
  }

  // 歌单选项卡
  else if (tabName === SPECIAL_TAB.name) {
    getQuerySpecials({ page, keyword }).then(({ data, error }) => {
      Spinner.close();
      error && (newTab.update = true);
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加歌单
      data && specialList.splice(0, specialList.length, ...data.list);
    });
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

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  if (page.current >= 1 && page.current < page.pageCount) {
    ++page.current;
    Spinner.open();

    getQuerySongs({ page, keyword: $query }).then(({ data, error }) => {
      Spinner.close();
      error && --page.current;
      // 重设置分页信息
      data && Object.assign(page, data.page);
      // 添加歌曲
      data && songList.push(...data.list);
    });
  }
};

/** 加载数据到视图上(无限滚动触发点) */
const loadAlbumData = () => {
  const page = MV_TAB.page;
  // 若还有数据, 则发起网络请求加载歌曲数据列表
  if (page.current >= 1 && page.current < page.pageCount) {
    Spinner.open();
    ++page.current;

    getQueryAlbums({ page, keyword: $query }).then(({ data, error }) => {
      Spinner.close();
      error && --page.current;
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加专辑
      data && albumList.push(...data.list);
    });
  }
};

/** 加载数据到视图上(无限滚动触发点) */
const loadMvData = () => {
  const page = MV_TAB.page;

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  if (page.current >= 1 && page.current < page.pageCount) {
    Spinner.open();
    ++page.current;

    getQueryMvs({ page, keyword: $query }).then(({ data, error }) => {
      Spinner.close();
      error && --page.current;
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加Mv
      data && mvList.push(...data.list);
    });
  }
};

/** 加载数据到视图上(无限滚动触发点) */
const loadSpecialData = () => {
  const page = SPECIAL_TAB.page;

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  if (page.current >= 1 && page.current < page.pageCount) {
    Spinner.open();
    ++page.current;

    getQuerySpecials({ page, keyword: $query }).then(({ data, error }) => {
      Spinner.close();
      error && --page.current;
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加歌单
      data && specialList.push(...data.list);
    });
  }
};

const toSingerView = (singer: Singer) => {
  router.push({ path: '/singer-view', query: singer });
};

watch(
  () => props.query,
  newQuery => {
    // 若不相等 且 新的查询参数是有效的(不能null或undefined)
    if (newQuery && $query !== newQuery) {
      $query = newQuery;
      tabs.forEach(tab => Object.assign(tab, { update: true, total: 0, current: 1, pageCount: 0 }));
      handleTabChanged(SONG_TAB);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="row data-container" v-if="singer">
    <c-image v-model="singer.cover" error="image/singer.png" />

    <div class="col">
      <div>{{ singer.name || '-' }}</div>

      <div class="row data-statistic">
        <span class="statistic-item">单曲：{{ singer.songCount || '-' }}</span>
        <span class="statistic-item">专辑：{{ singer.albumCount || '-' }}</span>
        <span class="statistic-item">MV：{{ singer.mvCount || '-' }}</span>
        <span class="statistic-item">粉丝：{{ singer.fansCount || '-' }}</span>
      </div>

      <div class="row" style="--button-icon-size: 1.5em">
        <c-button icon="play-select" @click="playSongs">播放全部</c-button>
        <c-button icon="plus" @click="unhandledFn">添加到</c-button>
        <c-button icon="my-download" @click="downloadFn">下载</c-button>
        <c-button icon="multiple" @click="multiple = !multiple">{{ multiple ? '退出批量操作' : '批量操作' }}</c-button>
      </div>
    </div>
  </div>

  <c-tab-pane :tabs="tabs" :activeTabName="activeTabName" @tabChange="handleTabChanged">
    <template #song>
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
          <span
            class="link cell-text"
            v-for="(singer, index) in singers"
            :key="index"
            :data-mid="singer.mid"
            @click="toSingerView(singer)"
            >{{ singer.name }}</span
          >
        </template>

        <template #album="{ item: { album } }">
          <span class="link cell-text" :data-mid="album.mid" v-if="album">{{ album.name }}</span>
        </template>
      </c-table>
    </template>

    <template #album>
      <c-grid
        cell-widths="repeat(auto-fit, 13em)"
        :data="albumList"
        :cell-height="234"
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
