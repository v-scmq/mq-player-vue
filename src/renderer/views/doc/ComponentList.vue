<template>
  <div class='tab-pane v-row' style='align-items:stretch'>

    <!-- 路由匹配到的组件将渲染在这里 -->
    <div class="v-column tab-content">
      <router-view v-slot="{Component}">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
      </router-view>
    </div>

    <div class='v-column tab-container'>
      <template v-for='(route,index) in routes' :key='index'>
        <router-link custom v-slot='{navigate,isActive}' :to='route.path'>
          <div class="tab" :class="{active:isActive}" @click='navigate'>{{ route.title }}</div>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script>
import {useRoute} from "vue-router";

export default {
  name: "ComponentList",

  setup() {
    /** @type {RouteRecordRaw[{}]} */
    const routes = useRoute().matched[0].children;
    return {routes: routes.map(route => ({path: route.path, title: route.meta.title}))};
  }
}
</script>

<style scoped>
.tab-pane :deep(.tab-container) {
  min-width: 200px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  overflow: auto;
  margin: 0 0 0 8px;
}

.tab-pane :deep(.tab) {
  font-size: 14px;
  padding: 8px 16px;
  transition: color 0.5s ease;
  color: #458bcb;
  background: #caebfb;
}

.tab-pane :deep(.tab:hover) {
  color: #1890ff;
}

.tab-pane :deep(.tab.active) {
  color: #1890ff;
  background: #bbe1f3;
  position: relative;
  pointer-events: none;
}

.tab-pane :deep(.tab.active:before) {
  content: '';
  border-left: 2px solid #1890ff;
  position: absolute;
  top: 2px;
  bottom: 0;
  left: 2px;

}
</style>