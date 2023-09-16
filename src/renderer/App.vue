<template>
  <title-bar />

  <tab-pane tab-position="left" mode="router" :tabs="tabs" />

  <!--  底部播放器控制视图  -->
  <media-control />
</template>

<script lang="ts">
import { Tab } from './components/types';

import TitleBar from './views/TitleBar.vue';
import MediaControl from './views/MediaControl.vue';
import { Message } from './components/Message';

import { useRouter } from 'vue-router';
import { defineComponent, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'App',
  components: { TitleBar, MediaControl },

  setup() {
    const netStateChanged = () => Message(navigator.onLine ? '网络已连接' : '已断开网络连接');

    window.addEventListener('online', netStateChanged);
    window.addEventListener('offline', netStateChanged);

    onBeforeUnmount(() => {
      window.removeEventListener('online', netStateChanged);
      window.removeEventListener('offline', netStateChanged);
    });

    return {
      tabs: useRouter()
        .options.routes.filter(route => !!route.meta)
        // @ts-ignore
        .map(({ name, path, meta: { icon, title } }) => ({ name, path, title, icon }) as Tab)
    };
  }
});
</script>
