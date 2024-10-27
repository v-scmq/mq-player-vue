<script lang="ts" setup>
import CPopover from '@/components/CPopover.vue';
import CIcon from '@/components/CIcon.vue';
import CButton from '@/components/CButton.vue';

import { Message } from '@/components/message';
import { Spinner } from '@/components/spinner';

import electron, { downloads } from '@/electron';
import { db } from '@/database';

import { unhandledFn } from '@/hooks';

import type { DownloadItem, SetDownloadItem } from '@/types';

// 下载任务相关记录存储表名称
const DOWNLOAD_TABLE = import.meta.env.VITE_TABLE_DOWNLOAD;

const states = {
  progressing: '传输中',
  interrupted: '已中断',
  completed: '已完成',
  cancelled: '已取消'
};

const openExplorer = electron.openExplorer;

const copyLink = (item: DownloadItem) => {
  navigator.clipboard.writeText(item.urlChain[0]);
  Message.success('链接已复制');
};

const clearAll = async () => {
  Spinner.open();

  const pending = downloads
    .filter(item => item.state === 'progressing')
    .map<SetDownloadItem>(item => ({
      path: item.path,
      urlChain: item.urlChain,
      mimeType: item.mimeType,
      offset: item.offset,
      length: item.length,
      lastModified: item.lastModified,
      eTag: item.eTag,
      startTime: item.startTime,

      type: 'cancel'
    }));

  pending.length > 0 && (await electron.setDownloadItem(pending));

  // 下载任务存储表较为特俗,id总是和path一致
  const ids = downloads.map(item => item.path);
  await db.delete(DOWNLOAD_TABLE, ids);
  downloads.splice(0, downloads.length);

  Spinner.close();
};

const setItem = async (index: number, option: SetDownloadItem['type']) => {
  Spinner.open();

  const item = downloads[index];

  // 若是取消,则从indexDB中删除记录
  if (option === 'cancel') {
    // 下载任务存储表较为特俗,id总是和path一致
    await db.delete(DOWNLOAD_TABLE, item.path);
    downloads.splice(index, 1);
  }

  await electron.setDownloadItem(
    option === 'create'
      ? {
          path: item.path,
          urlChain: item.urlChain,
          mimeType: item.mimeType,
          offset: item.offset,
          length: item.length,
          lastModified: item.lastModified,
          eTag: item.eTag,
          startTime: item.startTime,

          type: option
        }
      : {
          path: item.path,
          type: option
        }
  );

  Spinner.close();
};
</script>

<template>
  <div class="row view-head">
    <c-button @click="unhandledFn">新建下载</c-button>
    <c-button @click="clearAll">全部清除</c-button>
    <c-button @click="openExplorer">打开下载位置</c-button>
  </div>

  <div class="col view-body">
    <div class="col card" v-for="(item, index) in downloads" :key="index">
      <span class="title">{{ item.name }}</span>

      <div class="row controls">
        <span>{{ item.received }}/{{ item.size }}</span>

        <span v-if="item.state === 'progressing'">速率：{{ item.speed }}</span>

        <span v-if="item.state !== 'progressing'">{{ states[item.state] }}</span>

        <!-- 复制链接 -->
        <c-icon name="copy-link" style="margin-left: auto" @click="copyLink(item)" />

        <!-- 已完成 -->
        <template v-if="item.state === 'completed'">
          <!-- 打开文件所在位置 -->
          <c-icon name="dir" @click="openExplorer(item.path)" />
          <c-icon name="cancel" @click="setItem(index, 'cancel')" />
        </template>

        <!-- 未完成 -->
        <c-popover closeable v-else>
          <c-icon name="more-line" />

          <template #content>
            <div class="dropdown-item" v-if="item.state === 'progressing'" @click="setItem(index, 'pause')">暂停</div>
            <div class="dropdown-item" v-if="item.state === 'interrupted'" @click="setItem(index, 'resume')">继续</div>
            <div class="dropdown-item" v-if="item.state !== 'cancelled'" @click="setItem(index, 'cancel')">取消</div>
          </template>
        </c-popover>
      </div>

      <div class="track">
        <div class="filler" :style="{ width: `${item.percent || 0}%` }"></div>
      </div>
    </div>

    <div class="col" style="flex: 1; justify-content: center; align-items: center" v-if="downloads.length < 1">
      <svg class="empty-icon" width="237" height="289">
        <path
          d="M162.632 77.011c3.31-5.735 10.656-7.693 16.379-4.389l51.978 30.01c5.735 3.31 7.693 10.656 4.389 16.379l-30.01 51.978c-3.31 5.735-10.656 7.693-16.379 4.389l-51.978-30.01c-5.735-3.31-7.693-10.656-4.389-16.379l30.01-51.978zm3.723 44.885 3.08 17.998 24.669-10.06 4.186 34.748-56.58-32.667 24.645-10.02zm-103.23-7.316L5.44 145.252c-4.532 2.41-6.269 8.09-3.859 12.623l30.672 57.686c2.41 4.532 8.09 6.269 12.623 3.859l57.686-30.672c4.532-2.41 6.269-8.09 3.859-12.623L75.748 118.44c-2.41-4.532-8.09-6.269-12.623-3.859zm-15.52 86.4c-2.623 1.395-5.91.39-7.304-2.233l-10.14-19.071c-6.993-13.152-1.988-29.523 11.163-36.516 13.152-6.992 29.523-1.987 36.516 11.164l10.14 19.072c1.395 2.622.39 5.909-2.233 7.303l-11.125 5.915-8.45-15.893 7.946-4.225-4.225-7.946c-4.669-8.781-15.563-12.112-24.343-7.443-8.781 4.669-12.112 15.563-7.443 24.343l4.225 7.947 7.947-4.225 8.45 15.893-11.125 5.915zM69.311.145c-4.671-.824-9.108 2.232-9.91 6.782L47.69 73.1c-.803 4.55 2.32 8.939 6.992 9.762l51.007 8.994c4.671.824 9.15-2.225 9.952-6.775l8.752-49.634-21.106-29.31L69.311.145zm24.704 34.819 4.168-23.636 19.468 27.803-23.636-4.167zm74.63 175.393 11.988 16.163-11.817 2.084-11.99-16.164-8.862 1.563 11.988 16.164-11.817 2.084-11.99-16.164-8.862 1.563 11.989 16.164-11.818 2.083-11.99-16.163-2.954.52c-5.14.907-8.147 5.378-7.3 10.427l8.856 50.225c.889 5.04 5.286 8.207 10.426 7.3l64.998-11.46c5.14-.907 8.189-5.386 7.3-10.427l-10.419-59.088-17.726 3.126z"
          fill="#9AA0A6"
          fill-rule="evenodd"
        />
      </svg>

      <h3>没有任何下载任务；您下载的文件会显示在此处</h3>
    </div>
  </div>
</template>
