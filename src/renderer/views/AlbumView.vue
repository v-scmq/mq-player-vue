<script lang="ts" setup>
import { reactive, watch } from 'vue';

import CImage from '@/components/CImage.vue';
import CButton from '@/components/CButton.vue';
import CTable from '@/components/CTable.vue';
import CIcon from '@/components/CIcon.vue';

import player from '@/player';
import { Spinner } from '@/components/spinner';

import { usePlayMedias, useDownload, unhandledFn } from '@/hooks';
import { getAlbumSongs } from '@/api';

import type { PropType } from 'vue';
import type { Album, ComputedPage } from '@/types';
import type { TableColumn } from '@/components/types';

const props = defineProps({ album: Object as PropType<Album> });

const [songs, selectSongs, multiple, playSongs] = usePlayMedias();
const album = reactive<Album>({ mid: '', name: '', cover: '', company: '' });
const page = { current: 1, size: 30, total: 1 } as ComputedPage;

const columns: TableColumn[] = [
  { type: 'index', width: '100px' },
  { title: '歌曲', property: 'title', flex: true },
  { title: '歌手', property: 'singer' },
  { title: '时长', property: 'duration', width: '100px' },
  { title: '大小', property: 'size', width: '100px' }
];

const downloadFn = useDownload(songs, selectSongs);

watch(
  () => props.album,
  newAlbum => {
    if (!newAlbum || album.mid === newAlbum.mid) {
      return;
    }

    Spinner.open();
    Object.assign(album, newAlbum);
    const { id, mid } = newAlbum as { mid: string; id?: string };

    getAlbumSongs({ page, mid, id }).then(({ data }) => {
      Spinner.close();
      // 重设分页信息
      data && Object.assign(page, data.page);
      // // 更新专辑信息
      // data && Object.assign(album, data.album);
      // 添加歌曲数据
      data && songs.splice(0, songs.length, ...data.list);
    });
  },
  { immediate: true }
);

/** 加载歌曲数据到表格视图中 */
const loadDataList = () => {
  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  const { id, mid } = album as { mid: string; id?: string };

  getAlbumSongs({ page, mid, id }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    // 重设置分页信息
    data && Object.assign(page, data.page);
    // 添加歌曲
    data && songs.push(...data.list);
  });
};
</script>

<template>
  <div class="row data-container">
    <c-image v-model="album.cover" error="image/album.png" />

    <div class="col">
      <div>{{ album.name || '-' }}</div>

      <div class="row data-statistic">
        <span class="statistic-item">流派：{{ album.genre || '-' }}</span>
        <span class="statistic-item">语种：{{ album.language || '-' }}</span>
        <span class="statistic-item">唱片公司：{{ album.company || '-' }}</span>
        <span class="statistic-item">发行时间：{{ album.year || '-' }}</span>
      </div>

      <div class="row" style="--button-icon-size: 1.5em">
        <c-button icon="play-select" @click="playSongs">播放全部</c-button>
        <c-button icon="plus" @click="unhandledFn">添加到</c-button>
        <c-button icon="my-download" @click="downloadFn">下载</c-button>
        <c-button icon="multiple" @click="multiple = !multiple">{{ multiple ? '退出批量操作' : '批量操作' }}</c-button>
      </div>
    </div>
  </div>

  <div class="row" style="margin: 1em 0 0 0; flex: auto; overflow: hidden; align-items: stretch">
    <c-table
      style="flex: auto"
      :columns="columns"
      :data="songs"
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

    <div class="label" style="margin: 0 0 0 1em; padding: 0 1em 0 0; width: 15em">简介：{{ album.introduce }}</div>
  </div>
</template>
