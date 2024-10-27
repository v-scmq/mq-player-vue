<script lang="ts" setup>
import { reactive } from 'vue';

import CButton from '@/components/CButton.vue';
import CTable from '@/components/CTable.vue';
import CIcon from '@/components/CIcon.vue';
import CAccordion from '@/components/CAccordion.vue';

import player from '@/player';
import { Spinner } from '@/components/spinner';

import { unhandledFn, useDownload, usePlayMedias } from '@/hooks';

import { getRanks, getRankSongs } from '@/api';

import type { ComputedPage, Rank, RankItem } from '@/types';
import type { TableColumn } from '@/components/types';

const ranks = reactive<Rank[]>([]);
const [songs, selectSongs, multiple, playSongs] = usePlayMedias();
const page = { current: 1, size: 30 } as ComputedPage;
let rankItemId = '';

const columns: TableColumn[] = [
  { type: 'index', width: '100px' },
  { title: '歌曲', property: 'title', flex: true },
  { title: '歌手', property: 'singer' },
  { title: '专辑', property: 'album' },
  { title: '时长', property: 'duration', width: '100px' }
];

const downloadFn = useDownload(songs, selectSongs);

/**
 * 所选榜单发生改变时,获取最新的歌曲列表数据
 */
const onRankChanged = (rankItem: RankItem) => {
  if (rankItemId === rankItem.id) {
    return;
  }

  Spinner.open();
  page.current = 1;

  getRankSongs({ page, id: (rankItemId = rankItem.id) }).then(({ data }) => {
    Spinner.close();
    data && Object.assign(page, data.page);
    data && songs.splice(0, songs.length, ...data.list);
  });
};

/** 加载歌曲数据到表格视图中 */
const loadDataList = () => {
  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  getRankSongs({ page, id: rankItemId }).then(({ data, error }) => {
    Spinner.close();
    error && --page.current;
    // 重设置分页信息
    data && Object.assign(page, data.page);
    // 添加歌曲
    data && songs.push(...data.list);
  });
};

// =========== 调用API获取数据 ============
Spinner.open();
getRanks().then(({ data, error }) => {
  if (error || !data) {
    Spinner.close();
    return;
  }

  ranks.push(...data);
  rankItemId = ranks[0].items[0].id;

  getRankSongs({ page, id: rankItemId }).then(({ data }) => {
    Spinner.close();
    // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
    data && Object.assign(page, data.page);
    data && songs.push(...data.list);
  });
});
</script>

<template>
  <div class="row" style="padding-bottom: 1em; --button-icon-size: 1.5em">
    <c-button icon="play-select" @click="playSongs">播放全部</c-button>
    <c-button icon="plus" @click="unhandledFn">添加到</c-button>
    <c-button icon="my-download" @click="downloadFn">下载</c-button>
    <c-button icon="multiple" @click="multiple = !multiple">{{ multiple ? '退出批量操作' : '批量操作' }}</c-button>
  </div>

  <div class="row" style="flex: 1; align-items: stretch; overflow: hidden">
    <!-- 在这里,这个按行排列的元素,必须设置在竖直方向上子元素填充整个父元素高度,且这个元素高度必须设定100%  -->
    <c-table
      style="flex: auto"
      :data="songs"
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

    <!-- 音乐排行榜信息 -->
    <c-accordion style="flex: none" :list="ranks" @change="onRankChanged" />
  </div>
</template>
