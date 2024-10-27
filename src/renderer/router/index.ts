import { Tab } from '@/components/types';
import { createRouter, createWebHashHistory } from 'vue-router';

export default createRouter({
  // 自定义路由连接被激活的class
  linkActiveClass: 'active',
  history: createWebHashHistory('/'),
  routes: [
    {
      path: '/',
      name: 'local-music',
      // redirect: '/local-music' // 主页自动重定向到本地音乐页面
      component: () => import('../views/LocalMusic.vue'),
      meta: { title: '本地音乐', icon: 'local-music' }
    },

    {
      path: '/net-music',
      redirect: '/net-music/singer-list',
      meta: { title: '网络乐库', icon: 'net-music' },
      component: () => import('../components/CTabPane.vue'),
      props: route => ({
        mode: 'router',
        tabs: (
          route.matched[0].children as unknown as Array<{
            name: string;
            path: string;
            meta: { title: string };
          }>
        ).map(({ name, path, meta: { title } }) => ({ name, path, title }) as Tab)
      }),
      children: [
        {
          path: '/net-music/singer-list',
          name: 'singer-list',
          meta: { title: '歌手' },
          component: () => import('../views/SingerList.vue')
        },
        {
          path: '/net-music/special-list',
          name: 'special-list',
          meta: { title: '歌单' },
          component: () => import('../views/SpecialList.vue')
        },
        {
          path: '/net-music/mv-list',
          name: 'mv-list',
          meta: { title: 'MV' },
          component: () => import('../views/MVList.vue')
        },
        {
          path: '/net-music/rank-list',
          name: 'rank-list',
          meta: { title: '排行榜' },
          component: () => import('../views/RankList.vue')
        }
      ]
    },

    {
      path: '/singer-view',
      name: 'singer-view',
      component: () => import('../views/SingerView.vue'),
      props: route => ({ singer: route.query })
    },

    {
      path: '/album-view',
      name: 'album-view',
      component: () => import('../views/AlbumView.vue'),
      props: route => ({ album: route.query })
    },

    {
      path: '/net-search-view',
      name: 'net-search-view',
      component: () => import('../views/NetSearchView.vue'),
      props: route => ({ query: route.query.value })
    },

    {
      path: '/favorite-view',
      name: 'favorite-view',
      component: () => import('../views/FavoriteView.vue'),
      meta: { title: '我的收藏', icon: 'heart' }
    },

    {
      path: '/special-view',
      name: 'special-view',
      component: () => import('../views/SpecialView.vue'),
      meta: { title: '我的歌单', icon: 'my-special' }
    },

    {
      path: '/download-view',
      name: 'download-view',
      component: () => import('../views/DownloadView.vue'),
      meta: { title: '下载管理', icon: 'my-download' }
    },

    {
      path: '/system-setting',
      name: 'system-setting',
      component: () => import('../views/SystemSetting.vue')
    }
  ]
});
