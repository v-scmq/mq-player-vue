<template>
  <Header></Header>

  <div class="tab-pane">
    <div class="v-column tab-container fixed-left-bar" style="padding:20px 0 0 0">
      <!-- 使用 router-link 组件来导航. -->
      <!-- 通过传入 `to` 属性指定链接. -->
      <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
      <template v-for="(route, index) in routes" :key="index">
        <router-link custom v-slot="{navigate,isActive}" :to="route.path" v-if="route.meta">
          <div @click="navigate" :class="isActive ? 'tab active' : 'tab'">
            <icon width="1.2em" height="1.2em" :name="route.meta.icon"/>
            {{ route.meta.title }}
          </div>
        </router-link>
      </template>

    </div>

    <!-- 路由匹配到的组件将渲染在这里 -->
    <div class="v-column tab-content" style="padding:20px 0 0 16px;">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
      </router-view>
    </div>
  </div>

  <!--  底部播放器控制视图  -->
  <Footer></Footer>
</template>

<script>
import {getCurrentInstance, onBeforeUnmount} from "vue";
import {useRouter} from 'vue-router';
import Header from "./views/Header";
import Footer from "./views/Footer";

export default {
  name: "App",
  components: {Header, Footer},

  setup() {
    const {$message} = getCurrentInstance().appContext.config.globalProperties;
    const netStateChanged = () => $message(navigator.onLine ? "网络已连接" : "已断开网络连接");
    window.addEventListener("online", netStateChanged);
    window.addEventListener("offline", netStateChanged);

    onBeforeUnmount(() => {
      window.removeEventListener('online', netStateChanged);
      window.removeEventListener('offline', netStateChanged);
    });

    /** @type {RouteRecordRaw[{}]} */
    const routes = useRouter().options.routes;//.filter(item => item.meta);
    return {routes};
  }
}
</script>
