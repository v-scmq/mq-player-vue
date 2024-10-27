<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { reactive, watch, ref } from 'vue';

import CTabPane from '@/components/CTabPane.vue';
import CTable from '@/components/CTable.vue';
import CIcon from '@/components/CIcon.vue';
import CGridView from '@/components/CGrid.vue';
import CImage from '@/components/CImage.vue';
import CButton from '@/components/CButton.vue';

import player from '@/player';
import { Spinner } from '@/components/spinner';
import { usePlayMedias, useDownload, unhandledFn } from '@/hooks';
import { getSingerAlbums, getSingerMvs, getSingerSongs } from '@/api';

import type { Album, Mv, Singer, ComputedPage } from '@/types';
import type { TableColumn, Tab as BaseTab } from '../components/types';
import type { PropType } from 'vue';

type TabName = 'song' | 'album' | 'mv' | 'introduce';

/** 选项卡信息 */
type Tab = BaseTab & {
  /** 数据是否需要更新 */
  update: boolean;
  name: TabName;
  /** 选项卡对应的视图是分页信息 */
  page?: ComputedPage;
};

const props = defineProps({
  singer: { type: Object as PropType<Singer>, required: true }
});

const [songList, selectSongs, multiple, playSongs] = usePlayMedias();
const singer = reactive<Singer>({});
const albumList = reactive<Album[]>([]);
const mvList = reactive<Mv[]>([]);

const SONG_TAB = { title: '歌曲', name: 'song', update: true, page: { current: 1, size: 30 } } as Tab;
const ALBUM_TAB = { title: '专辑', name: 'album', update: true, page: { current: 1, size: 30 } } as Tab;
const MV_TAB = { title: 'MV', name: 'mv', update: true, page: { current: 1, size: 30 } } as Tab;
const DETAIL_TAB = { title: '详情', name: 'introduce', update: true } as Tab;

const tabs = [SONG_TAB, ALBUM_TAB, MV_TAB, DETAIL_TAB];
const activeTabName = ref<TabName>('song');

const columns: TableColumn[] = [
  { type: 'index', width: '100px' },
  { title: '歌曲', property: 'title', flex: true },
  { title: '歌手', property: 'singer' },
  { title: '专辑', property: 'album' },
  { title: '时长', property: 'duration', width: '100px' }
];

const router = useRouter();
const downloadFn = useDownload(songList, selectSongs);

/**
 * 处理选项卡改变事件
 *
 * @param newTab 新选定的选项卡
 */
const handleTabChanged = (newTab: Tab) => {
  activeTabName.value = newTab.name;

  // 若当前选项卡无需更新数据, 则什么也不做
  if (newTab.name === 'introduce' || !newTab.update) {
    return;
  }

  // 立刻重置为无需更新状态
  newTab.update = false;
  const tabName = newTab.name;

  // 打开进度指示器
  Spinner.open();

  // 分页信息
  const page = newTab.page as ComputedPage;
  const id = <string | number>singer.id;
  const mid = <string | number>singer.mid;

  if (tabName === 'song') {
    getSingerSongs({ page, id, mid }).then(({ data, error }) => {
      Spinner.close();

      error && (newTab.update = true);
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 修改歌手信息
      data && Object.assign(singer, data.singer);
      // 添加歌曲
      data && songList.splice(0, songList.length, ...data.list);
    });
  }

  if (tabName === 'album') {
    getSingerAlbums({ page, id, mid }).then(({ data, error }) => {
      Spinner.close();

      error && (newTab.update = true);
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加专辑
      data && albumList.splice(0, albumList.length, ...data.list);
    });
  }

  if (tabName === 'mv') {
    getSingerMvs({ page, id, mid }).then(({ data, error }) => {
      Spinner.close();

      error && (newTab.update = true);
      // 修改分页信息
      data && Object.assign(page, data.page);
      // 添加Mv
      data && mvList.splice(0, mvList.length, ...data.list);
    });
  }
};

// 监听查询参数改变
watch(
  () => props.singer,
  (value: Singer) => {
    if (!value?.mid || singer.mid === value.mid) {
      return;
    }

    // 重设歌手信息
    Object.assign(singer, value);

    tabs.forEach(tab => {
      tab.update = true;
      // 清除分页数据
      tab.page && Object.assign(tab.page, { total: 0, current: 1, pageCount: 0 });
    });

    handleTabChanged(SONG_TAB);
  },
  { immediate: true }
);

/**
 * 当专辑列表项点击时,跳转到专辑视图
 *
 * @param album 专辑信息
 */
const onAlbumItemClicked = (album: Album) => {
  // 若存在专辑信息, 则跳转到专辑视图
  album && router.push({ path: '/album-view', query: { ...album, singer: null } });
};

/** 加载歌曲数据到表格视图中 */
const loadDataList = () => {
  const page = SONG_TAB.page as ComputedPage;

  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  ++page.current;
  const id = <string | number>singer.id;
  const mid = <string | number>singer.mid;
  Spinner.open();

  getSingerSongs({ page, id, mid }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    // 重设置分页信息
    data && Object.assign(page, data.page);
    // 添加歌曲
    data && songList.push(...data.list);
  });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadAlbumData = () => {
  const page = MV_TAB.page as ComputedPage;

  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();

  ++page.current;
  const id = <string | number>singer.id;
  const mid = <string | number>singer.mid;

  getSingerAlbums({ page, id, mid }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    // 修改分页信息
    data && Object.assign(page, data.page);
    // 添加专辑
    data && albumList.push(...data.list);
  });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadMvData = () => {
  const page = MV_TAB.page as ComputedPage;

  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;
  const id = <string | number>singer.id;
  const mid = <string | number>singer.mid;

  getSingerMvs({ page, id, mid }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    // 修改分页信息
    data && Object.assign(page, data.page);
    // 添加Mv
    data && mvList.push(...data.list);
  });
};
</script>

<template>
  <div class="row data-container">
    <c-image v-model="singer.cover" error="image/singer.png" />

    <div class="col">
      <div>{{ singer.name || '-' }}</div>

      <div class="row data-statistic">
        <span class="statistic-item">单曲：{{ singer.songCount || '-' }}</span>
        <span class="statistic-item">专辑：{{ singer.albumCount || '-' }}</span>
        <span class="statistic-item">MV：{{ singer.mvCount || '-' }}</span>
        <span class="statistic-item">粉丝：{{ singer.fansCount || '-' }}</span>
      </div>

      <div class="row" style="--button-c-icon-size: 1.5em">
        <c-button c-icon="play-select" @click="playSongs">播放全部</c-button>
        <c-button c-icon="plus" @click="unhandledFn">添加到</c-button>
        <c-button c-icon="my-download" @click="downloadFn">下载</c-button>
        <c-button c-icon="multiple" @click="multiple = !multiple"
          >{{ multiple ? '退出批量操作' : '批量操作' }}
        </c-button>
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
      <c-grid-view
        cell-widths="repeat(auto-fit, 13em)"
        :data="albumList"
        @infinite-scroll="loadAlbumData"
        :cell-height="234"
        @cell-click="onAlbumItemClicked"
      >
        <template v-slot="{ item }">
          <c-image v-model="item.cover" error="image/album.png" />
          <div class="name">{{ item.name }}</div>
        </template>
      </c-grid-view>
    </template>

    <template #mv>
      <c-grid-view
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
      </c-grid-view>
    </template>

    <template #introduce>
      <div class="label">{{ singer.introduce }}</div>
    </template>
  </c-tab-pane>
</template>
