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
      component: () => import('../components/TabPane.vue'),
      props: route => ({
        mode: 'router',
        tabs: (route.matched[0].children as unknown as Array<{ path: string; meta: { title: string } }>).map(
          ({ path, meta: { title } }) => ({ path, title }) as Tab
        )
      }),
      children: [
        {
          path: '/net-music/singer-list',
          meta: { title: '歌手' },
          component: () => import('../views/SingerList.vue')
        },
        {
          path: '/net-music/special-list',
          meta: { title: '歌单' },
          component: () => import('../views/SpecialList.vue')
        },
        {
          path: '/net-music/mv-list',
          meta: { title: 'MV' },
          component: () => import('../views/MVList.vue')
        },
        {
          path: '/net-music/rank-list',
          meta: { title: '排行榜' },
          component: () => import('../views/RankList.vue')
        }
      ]
    },

    {
      path: '/singer-view',
      component: () => import('../views/SingerView.vue'),
      props: route => ({ query: route.query })
    },

    {
      path: '/album-view',
      component: () => import('../views/AlbumView.vue'),
      props: route => ({ query: route.query })
    },

    {
      path: '/net-search-view',
      component: () => import('../views/NetSearchView.vue'),
      props: route => ({ query: route.query })
    },

    {
      path: '/favorite',
      component: () => import('../views/Favorite.vue'),
      meta: { title: '我的收藏', icon: 'heart' }
    },

    {
      path: '/special',
      component: () => import('../views/Special.vue'),
      meta: { title: '我的歌单', icon: 'my-special' }
    },

    {
      path: '/download',
      component: () => import('../views/Download.vue'),
      meta: { title: '下载管理', icon: 'my-download' }
    },

    {
      path: '/system-setting',
      component: () => import('../views/SystemSetting.vue')
    }
  ]
});
