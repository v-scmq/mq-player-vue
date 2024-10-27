<script lang="ts" setup>
import { ref } from 'vue';

import CButton from '@/components/CButton.vue';
import CPopover from '@/components/CPopover.vue';
import CInput from '@/components/CInput.vue';
import CTable from '@/components/CTable.vue';

import { db } from '@/database';
import { Spinner } from '@/components/spinner';
import { Message } from '@/components/message';

import electron from '@/electron';
import player from '@/player';

import { toList, toFileSize, formatTime, debounce } from '@/utils';
import { usePlayMedias, unhandledFn } from '@/hooks';

import type { TableColumn } from '@/components/types';
import type { Song } from '@/types';

// 本地文件相关记录存储表名称
const FILE_TABLE = import.meta.env.VITE_TABLE_FILE;

const keyword = ref('');
const [list, selectSongs, multiple, playSongs] = usePlayMedias();

const columns: TableColumn[] = [
  { type: 'index', width: '100px' },
  { title: '歌曲', property: 'title' },
  { title: '歌手', property: 'singerName' },
  { title: '专辑', valueGetter: item => item.album?.name },
  { title: '时长', property: 'duration', width: '100px' },
  { title: '大小', property: 'size', width: '100px' }
];

// 文件选择元素响应式引用
const fileInputRef = ref(null as any as HTMLInputElement);

// 用于在indexDB中存储本地音乐信息的数据量(无需响应式)
let maxSize = 0;

/** 批量删除本地歌曲 */
const deleteSongs = async () => {
  if (list.length < 1) {
    return Message.error('当前无任何歌曲！');
  }

  // 若处于非批量选择模式
  if (!multiple.value) {
    Spinner.open();

    // ===执行全部删除===
    const ids = list.map(item => item.id as string);
    await db.delete(FILE_TABLE, ids);
    list.splice(0, list.length);

    return Spinner.close();
  }

  // 处于批量选择模式
  const { value } = selectSongs;

  if (value.length < 1) {
    return Message.error('请至少选择一首歌曲！');
  }

  Spinner.open();

  // 本地歌曲以路径作为id
  const ids = value.map(i => list[i].id as string);
  // 批量删除歌曲
  const state = await db.delete(FILE_TABLE, ids);
  console.info(state);
  // 清空选择
  selectSongs.value = [];

  // 若全选, 则直接清空列表
  if (ids.length === list.length) {
    list.splice(0, list.length);
  } else {
    const length = list.length - ids.length;
    const map: { [key: string]: 1 } = {};

    ids.forEach(id => (map[id] = 1));
    // @ts-ignore
    list.splice(0, length, ...list.filter(item => !map[item.id]));
  }

  Spinner.close();
};

const handleSongFilter = debounce(() => {
  const limited = maxSize > 1024;
  limited && Spinner.open();

  // 若输入了搜索关键词,则调用过滤, 否则查询所有
  const filter = keyword.value
    ? (item: Song) => {
        const value = keyword.value;
        const { title = '', album, singerName = '' } = item;
        return title.includes(value) || album?.name?.includes(value) || singerName.includes(value);
      }
    : void 0;

  db.query(FILE_TABLE, filter).then(data => {
    keyword.value && (maxSize = data.length);
    list.splice(0, list.length, ...data);

    limited && Spinner.close();
  });
});

/** 导入歌曲按钮被点击时,弹出文件选择框 */
const openFileChoosePicker = () => {
  if (keyword.value) {
    return Message.error('当前存在筛选条件，必须清空才能进行！');
  }

  // 清除文件选择器(input元素)的值,解决重新选择不能回调change事件的问题
  fileInputRef.value.value = null as any;
  fileInputRef.value.click();
};

/** 导入音乐信息 */
const addSongs = async (event: Event) => {
  const files = (<HTMLInputElement>event.target).files;

  if (!files?.length) {
    return;
  }

  Spinner.open();
  const medias: Song[] = await electron.parseFile(toList(files));
  const exists: { [key: string]: 1 } = {};

  list.forEach(item => {
    exists[item.path as string] = 1;
  });

  medias.forEach((media, index) => {
    if (!exists[media.path as string]) {
      // 格式化文件大小
      media.size = toFileSize(files[index].size);
      // 格式化播放时长(已在preload中初始化为数值)
      media.duration = formatTime(media.duration as any as number);
    }
  });

  const newMedias = medias.filter(item => item.size);

  if (newMedias.length) {
    list.push(...newMedias);
    await db.put(FILE_TABLE, newMedias);
    maxSize += newMedias.length;
  }

  Spinner.close();
};

/************ 加载表格视图数据 START ************/
Spinner.open();
db.query<Song>(FILE_TABLE)
  .then(data => (maxSize = list.push(...data)))
  .finally(Spinner.close);
/************ 加载表格视图数据   END ************/
</script>

<template>
  <div class="row" style="margin: 0 8px 12px 0; flex-wrap: wrap; --button-icon-size: 1.5em">
    <c-button icon="play-select" @click="playSongs">播放全部</c-button>

    <c-popover closeable>
      <c-button icon="plus">添加到</c-button>

      <template #content>
        <div class="dropdown-item separator first" @click="unhandledFn">我的收藏</div>
        <div class="dropdown-item last" @click="unhandledFn">添加到新歌单</div>
      </template>
    </c-popover>

    <c-button icon="trash" @click="deleteSongs">{{ multiple ? '删除' : '清空' }}</c-button>
    <c-button icon="multiple" @click="multiple = !multiple">{{ multiple ? '退出批量操作' : '批量操作' }}</c-button>

    <c-input v-model="keyword" placeholder="搜索本地歌曲" @input="handleSongFilter" style="margin: 0 0 0 auto" />

    <c-button icon="import" @click="openFileChoosePicker">导入歌曲</c-button>
    <input hidden type="file" multiple accept="audio/*" ref="fileInputRef" @change="addSongs" />
    <c-button icon="sort" style="--button-icon-size: 1.2em" @click="unhandledFn">排序方式</c-button>
  </div>

  <c-table
    style="flex: auto"
    :columns="columns"
    :data="list"
    v-model:multiple="multiple"
    v-model:selections="selectSongs"
    @row-dblclick="player.playMedias"
  />
</template>
