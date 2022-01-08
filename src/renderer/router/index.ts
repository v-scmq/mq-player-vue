import {createRouter, createWebHashHistory} from 'vue-router';

export default createRouter({
    // 自定义路由连接被激活的class
    linkActiveClass: 'active',
    history: createWebHashHistory('/'),
    routes: [
        {
            path: '/', // 主页自动重定向到本地音乐页面
            redirect: '/local-music'
        },
        {
            path: '/local-music',
            component: () => import('../views/LocalMusic.vue'),
            meta: {
                title: '本地音乐',
                icon: 'local-music'
            }
        },
        {
            path: '/net-music',
            component: () => import('../views/NetMusic.vue'),
            redirect: '/net-music/singer-list',
            meta: {
                title: '网络乐库',
                icon: 'net-music'
            },
            children: [
                {
                    path: '/net-music/singer-list',
                    meta: {title: '歌手'},
                    component: () => import('../views/SingerList.vue')
                },
                {
                    path: '/net-music/special-list',
                    meta: {title: '歌单'},
                    component: () => import('../views/SpecialList.vue')
                },
                {
                    path: '/net-music/mv-list',
                    meta: {title: 'MV'},
                    component: () => import('../views/MVList.vue')
                },
                {
                    path: '/net-music/rank-list',
                    meta: {title: '排行榜'},
                    component: () => import('../views/RankList.vue')
                }
            ]
        },
        {
            path: '/singer-view',
            component: () => import('../views/SingerView.vue'),
            props: route => ({query: route.query})
        },
        {
            path: '/album-view',
            component: () => import('../views/AlbumView.vue'),
            props: route => ({query: route.query})
        },
        {
            path: '/net-search-view',
            component: () => import('../views/NetSearchView.vue'),
            props: route => ({query: route.query})
        },
        {
            path: '/favorite',
            component: () => import('../views/Favorite.vue'),
            meta: {
                title: '我的收藏',
                icon: 'heart'
            }
        },
        {
            path: '/special',
            component: () => import('../views/Special.vue'),
            meta: {
                title: '我的歌单',
                icon: 'my-special'
            }
        },
        {
            path: '/download',
            component: () => import('../views/Download.vue'),
            meta: {
                title: '下载管理',
                icon: 'my-download'
            }
        },
        {
            path: '/system-setting',
            component: () => import('../views/SystemSetting.vue')
        },
        {
            path: '/component-list',
            component: () => import('../views/doc/ComponentList.vue'),
            redirect: '/component-list/Pagination',
            meta: {
                title: '组件示例',
                icon: 'box'
            },
            children: [
                {
                    path: '/component-list/Pagination',
                    meta: {title: '分页'},
                    component: () => import('../views/doc/PaginationDemo.vue')
                },
                {
                    path: '/component-list/modal',
                    meta: {title: '模态框'},
                    component: () => import('../views/doc/ModalDemo.vue')
                },
                {
                    path: '/component-list/table-view',
                    meta: {title: '表格'},
                    component: () => import('../views/doc/TableViewDemo.vue')
                },
                {
                    path: '/component-list/icon',
                    meta: {title: '图标'},
                    component: () => import('../views/doc/SVGIcon.vue')
                },
                {
                    path: '/component-list/grid-view',
                    meta: {title: '虚拟滚动网格组件'},
                    component: () => import('../views/doc/GridView.vue')
                }
            ]
        }
    ]
});
