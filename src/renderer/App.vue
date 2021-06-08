<template>
  <div id="app" class="v-column">
    <Header></Header>

    <div class="tab-pane">
      <div class="v-column tab-container fixed-left-bar" style="padding:20px 0 0 0">
        <!-- 使用 router-link 组件来导航. -->
        <!-- 通过传入 `to` 属性指定链接. -->
        <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
        <template v-for="(route,index) in routes">
          <router-link custom v-slot="{navigate,isActive}" :to="route.path" :key="index" v-if="route.meta">
            <div @click="navigate" :class="isActive ? 'tab active' : 'tab'">
              <svg class="icon" width="1.2em" height="1.2em" viewBox="0 0 16 16">
                <path :d="route.meta.icon"/>
              </svg>
              {{ route.meta.title }}
            </div>
          </router-link>
        </template>

      </div>

      <!-- 路由匹配到的组件将渲染在这里 -->
      <keep-alive>
        <router-view class="tab-content" style="padding:20px 0 0 16px;"/>
      </keep-alive>
    </div>

    <!--  底部播放器控制视图  -->
    <Footer></Footer>
  </div>
</template>

<script>
import Header from "./views/Header";
import Footer from "./views/Footer";

export default {
  name: "App",
  components: {Header, Footer},

  data: () => ({routes: null}),

  created() {
    this.routes = this.$router.options.routes;
    let netStateChanged = () => this.$message(navigator.onLine ? "网络已连接" : "已断开网络连接");
    window.addEventListener("online", netStateChanged);
    window.addEventListener("offline", netStateChanged);
  }
}
</script>
