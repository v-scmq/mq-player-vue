<template>
  <div class='v-column'>
    <div class='tab-pane v-column'>
      <div class='v-row tab-container' style='justify-content:center;'>
        <!-- 使用 router-link 组件来导航. -->
        <!-- 通过传入 `to` 属性指定链接. -->
        <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
        <template v-for='(route,index) in routes'>
          <router-link tag='div' class='tab' :to='route.path' :key='index' v-if='route.meta'>
            {{ route.meta.title }}
          </router-link>
        </template>
      </div>

      <!-- 路由匹配到的组件将渲染在这里 -->
      <keep-alive>
        <router-view class='tab-content'/>
      </keep-alive>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NetMusic',

  data: () => ({
    value: 0.2,

    routes: [],
  }),

  created() {
    let matched = this.$route.matched.filter(route => route.parent);
    matched = matched[0].parent;

    let routes = this.$router.options.routes;
    routes = routes.filter(route => route.path === matched.path);
    this.routes = routes[0].children;
  },
}
</script>
