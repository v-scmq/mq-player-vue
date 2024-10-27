# mq-player-vue [![](https://img.shields.io/badge/Github-green.svg)](https://github.com/v-scmq/mq-player-vue) [![](https://img.shields.io/badge/Gitee-blue.svg)](https://gitee.com/scmq/mq-player-vue)

MQ音乐是一款基于Electron+Vue构建的桌面音乐播放器

### 项目技术栈

![](https://img.shields.io/badge/Electron-32-success.svg)
![](https://img.shields.io/badge/Vue-3-success.svg)
![](https://img.shields.io/badge/NodeJS-20-blue.svg)
![](https://img.shields.io/badge/TypeScript-5.6-blue.svg)
![](https://img.shields.io/badge/MusicMetadata-10.5-blue.svg)

### 1.特别声明
目前所公开的接口(位于:src/main/server/api/lib0, 作为demo用，请勿作为商业用途！)
1. 其中第三方音乐资源均来源于【赛博朋客2077】游戏中体温电台
2. 歌曲的歌词来源于互联网
3. 作为MV页面的视频资源录制于【赛博朋客2077】游戏
4. 它们存放于Salesforce平台，若有侵权，联系删除！

### 2.特性

1. 支持音乐频谱
2. 界面友好，支持皮肤切换(暂未实现)
3. 跨平台，可打包Windows、Mac、Linux(当前仅测试了windows)
4. 尽量使用良好的架构模式和代码风格
5. 提供支持主流的第三方音乐平台(未公开)
6. 进程沙盒化(从现在开始所有接口调用都由electron中自定义协议代理调用，解析媒体元数据已经调整到主进程部分)
7. 从现在开始,不再支持纯浏览器端(如本地音乐页面), 且已经将语法降级相关配置调整,使其尽量避免语法降级

### 3.效果预览

+ 本地音乐

![本地音乐](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/1.png "本地音乐")

+ 播放详情

![播放详情](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/2.png "背景虚化")

+ 歌手分类

![歌手分类](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/3.png "歌手分类")

+ 歌手歌曲

![歌手歌曲](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/4.png "歌手歌曲")

+ MV分类

![MV分类](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/5.png "MV分类")

+ 下载管理

![MV分类](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/6.png "下载管理")

更多效果，可自行体验

### 4.待实现功能
1. 本地音乐页面排序
2. 播放队列UI相关
3. MV播放问题(现在仅仅在MV分类页面支持简单播放)
4. 歌单页面歌曲列表
5. 收藏、添加歌曲到歌单等
6. 歌曲播放UI相关(播放过程中出现已缓冲部分完成,但需要继续加载资源问题而没有任何标识)
7. 全体UI相关(皮肤切换……)
8. ……


### 5.项目结构
```text
├─build              (打包根目录)
│  ├─main            (主进程部分)
│  ├─preload         (预加载部分)
│  └─static          (渲染进程部分)
├─public             (开发环境下静态资源)
│  └─image           (开发环境下静态图片资源)
└─src
    ├─main           (***开发环境下,主进程部分***)
    │  ├─icon        (仅在打包时提供给electron-build使用)
    │  ├─server      (electron自定义协议作为代理服务器)
    │  │  ├─api      (提供音乐资源接口)
    │  │  │  ├─lib0  (作为demo使用的音乐接口)
    │  │  │  └─lib1  (提供支持调用第三方音乐接口)
    │  │  ├─request  (网络请求工具相关代码)
    │  │  └─types    (相关类型定义)
    │  └─util        (主进程部分相关使用的工具代码)
    ├─preload        (***预加载脚本***)
    └─renderer       (***渲染进程部分)
        ├─api        (渲染进程部分所调用的api)
        ├─components (自定义组件)
        │  ├─message (ElementPlus Message的模拟实现)
        │  ├─spinner (进度指示器)
        │  └─types   (组件相关类型定义)
        ├─database   (IndexedDB简单封装)
        ├─electron   (对预加载脚本提供的方法进一步封装)
        ├─hooks      (渲染进程全局使用的hook)
        ├─player     (播放器相关封装)
        ├─router     (VueRouter相关)
        ├─styles     (全局样式,目前未使用作用域样式)
        ├─types      (类型定义)
        │  └─api
        ├─utils      (渲染进程部分相关使用的工具代码)
        └─views      (渲染进程部分相关页面)
```


