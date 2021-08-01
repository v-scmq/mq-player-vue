import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

// // 0. 如果使用模块化机制编程，导入Vue和VueRouter，要调用 Vue.use(VueRouter)

// // 1. 定义 (路由) 组件。
// // 可以从其他文件 import 进来
// const Foo = {template: '<div>foo</div>'}
// const Bar = {template: '<div>bar</div>'}

// // 2. 定义路由
// // 每个路由应该映射一个组件。 其中"component" 可以是
// // 通过 Vue.extend() 创建的组件构造器，
// // 或者，只是一个组件配置对象。
// // 我们晚点再讨论嵌套路由。
// const routes = [
//     {path: '/foo', component: Foo},
//     {path: '/bar', component: Bar}
// ]

// // 3. 创建 router 实例，然后传 `router` 配置
// // 你还可以传别的配置参数, 不过先这么简单着吧。
// const router = new VueRouter({
//     routes // (缩写) 相当于 router: router
// })

// export default router;


export default new VueRouter({
    // 自定义路由连接被激活的class
    linkActiveClass: 'active',
    routes: [
        {
            path: '/local-music',
            component: () => import('../views/LocalMusic'),
            meta: {
                title: '本地音乐',
                icon: 'M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4c0 .667.083 1.167.25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75c.167-.333.25-.833.25-1.5H2s-2 0-2-2V4zm1.398-.855a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145z'
            }
        },
        {
            path: '/net-music',
            component: () => import('../views/NetMusic'),
            meta: {
                title: '网络乐库',
                icon: 'M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z M14 11V2h1v9h-1zM6 3v10H5V3h1z M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z'
            },
            children: [
                {path: 'singer-list', meta: {title: '歌手'}, component: () => import('../views/SingerList')},
                {path: 'special-list', meta: {title: '歌单'}, component: () => import('../views/SpecialList')},
                {path: 'mv-list', meta: {title: 'MV'}, component: () => import('../views/MVList')},
                {path: 'rank-list', meta: {title: '排行榜'}, component: () => import('../views/RankList')},
                {path: '', redirect: 'singer-list'}
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
                icon: 'M8 6.236l-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595L8 6.236zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.55 7.55 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z'
            }
        },
        {
            path: '/special',
            component: () => import('../views/Special'),
            meta: {
                title: '我的歌单',
                icon: 'M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z  M12 3v10h-1V3h1z  M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z'
            }
        },
        {
            path: '/download',
            component: () => import('../views/Download'),
            meta: {
                title: '下载管理',
                icon: 'M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z'
            }
        },
        // 主页自动重定向到本地音乐页面
        {
            path: '/',
            redirect: '/local-music'
        }
    ]
});
