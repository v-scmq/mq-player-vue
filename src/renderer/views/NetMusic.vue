<template>
  <div class='tab-pane v-column'>
    <div class='v-row tab-container' style='justify-content:center;'>
      <!-- 使用 router-link 组件来导航. -->
      <!-- 通过传入 `to` 属性指定链接. -->
      <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
      <template v-for='(route,index) in routes' :key='index'>
        <router-link custom v-slot='{navigate,isActive}' :to='route.path'>
          <div :class="isActive ? 'tab active' : 'tab'" @click='navigate'>{{ route.title }}</div>
        </router-link>
      </template>
    </div>

    <!-- 路由匹配到的组件将渲染在这里 -->
    <div class="v-column tab-content">
      <router-view v-slot="{Component}">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';
import {useRoute} from 'vue-router';

export default defineComponent({
  name: 'NetMusic',

  setup() {
    /** @type {RouteRecordRaw[{}]} */
    const routes = useRoute().matched[0].children;
    return {routes: routes.map(({path, meta}) => ({path, title: meta && meta.title}))};
  }

});
</script>
