<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onBeforeUnmount } from 'vue';

import TitleBar from '@/views/TitleBar.vue';
import MediaControl from '@/views/MediaControl.vue';
import CTabPane from '@/components/CTabPane.vue';
import { Message } from '@/components/message';

import type { Tab } from '@/components/types';

const netStateChanged = () => Message(navigator.onLine ? '网络已连接' : '已断开网络连接');

const tabs = useRouter()
  .options.routes.filter(route => !!route.meta)
  // @ts-ignore
  .map(({ name, path, meta: { icon, title } }) => ({ name, path, title, icon }) as Tab);

addEventListener('online', netStateChanged);
addEventListener('offline', netStateChanged);

onBeforeUnmount(() => {
  removeEventListener('online', netStateChanged);
  removeEventListener('offline', netStateChanged);
});
</script>

<template>
  <title-bar />
  <c-tab-pane tab-position="left" mode="router" :tabs="tabs" />
  <!-- 底部播放器控制视图 -->
  <media-control />
</template>
