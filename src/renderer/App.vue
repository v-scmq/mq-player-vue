<template>
  <title-bar/>

  <div class='tab-pane'>
    <div class='v-column tab-container fixed-left-bar' style='padding:20px 0 0 0'>
      <!-- 使用 router-link 组件来导航. -->
      <!-- 通过传入 `to` 属性指定链接. -->
      <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
      <router-link custom v-slot='{navigate, isActive}' v-for='(tab, index) in tabs' :key='index' :to='tab.path'>
        <div @click='navigate' class='tab' :class='{active: isActive}'>
          <icon width='1.2em' height='1.2em' :name='tab.meta.icon'/>
          {{ tab.meta.title }}
        </div>
      </router-link>

    </div>

    <!-- 路由匹配到的组件将渲染在这里 -->
    <div class='v-column tab-content'>
      <router-view v-slot='{ Component }'>
        <keep-alive>
          <component :is='Component'/>
        </keep-alive>
      </router-view>
    </div>
  </div>

  <!--  底部播放器控制视图  -->
  <media-control/>
</template>

<script lang='ts'>
import TitleBar from './views/TitleBar.vue';
import MediaControl from './views/MediaControl.vue';
import Message from './components/Message';

import {useRouter} from 'vue-router';
import {defineComponent, onBeforeUnmount} from 'vue';

export default defineComponent({
  name: 'App',
  components: {TitleBar, MediaControl},

  setup() {
    const netStateChanged = () => Message(navigator.onLine ? '网络已连接' : '已断开网络连接');

    window.addEventListener('online', netStateChanged);
    window.addEventListener('offline', netStateChanged);

    onBeforeUnmount(() => {
      window.removeEventListener('online', netStateChanged);
      window.removeEventListener('offline', netStateChanged);
    });

    return {
      tabs: (useRouter().options.routes as unknown as
          Array<{ path: string, meta: { icon: string, title: string } }>)
          .filter(route => route.meta)
    };
  }

});
</script>
