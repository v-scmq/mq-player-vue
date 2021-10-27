import * as VueRouter from "vue-router";

export default VueRouter.createRouter(/** @type {VueRouter.RouterOptions} */{
    // 自定义路由连接被激活的class
    linkActiveClass: 'active',
    history: VueRouter.createWebHashHistory('/'),
    routes: [
        {
            path: '/', // 主页自动重定向到本地音乐页面
            redirect: '/local-music'
        },
        {
            path: '/local-music',
            component: () => import('../views/LocalMusic'),
            meta: {
                title: '本地音乐',
                icon: 'local-music'
            }
        },
        {
            path: '/net-music',
            component: () => import('../views/NetMusic'),
            redirect: '/net-music/singer-list',
            meta: {
                title: '网络乐库',
                icon: 'net-music'
            },
            children: [
                {path: '/net-music/singer-list', meta: {title: '歌手'}, component: () => import('../views/SingerList')},
                {path: '/net-music/special-list', meta: {title: '歌单'}, component: () => import('../views/SpecialList')},
                {path: '/net-music/mv-list', meta: {title: 'MV'}, component: () => import('../views/MVList')},
                {path: '/net-music/rank-list', meta: {title: '排行榜'}, component: () => import('../views/RankList')}
            ]
        },
        {
            path: '/singer-view',
            component: () => import('../views/SingerView'),
            props: route => ({query: route.query})
        },
        {
            path: '/album-view',
            component: () => import('../views/AlbumView'),
            props: route => ({query: route.query})
        },
        {
            path: '/net-search-view',
            component: () => import('../views/NetSearchView'),
            props: route => ({query: route.query})
        },
        {
            path: '/favorite',
            component: () => import('../views/Favorite'),
            meta: {
                title: '我的收藏',
                icon: 'my-favorites'
            }
        },
        {
            path: '/special',
            component: () => import('../views/Special'),
            meta: {
                title: '我的歌单',
                icon: 'my-special'
            }
        },
        {
            path: '/download',
            component: () => import('../views/Download'),
            meta: {
                title: '下载管理',
                icon: 'my-download'
            }
        },
        {
            path: '/component-list',
            component: () => import('../views/doc/ComponentList'),
            redirect: '/component-list/Pagination',
            meta: {
                title: '组件示例',
                icon: 'box'
            },
            children: [
                {
                    path: '/component-list/Pagination', meta: {title: '分页'},
                    component: () => import('../views/doc/PaginationDemo')
                },
                {
                    path: '/component-list/modal', meta: {title: '模态框'},
                    component: () => import('../views/doc/ModalDemo')
                },
                {
                    path: '/component-list/table-view', meta: {title: '表格'},
                    component: () => import('../views/doc/TableViewDemo')
                },
                {
                    path: '/component-list/icon', meta: {title: '图标'},
                    component: () => import('../views/doc/SVGIcon')
                }
            ]
        }
    ]
});
