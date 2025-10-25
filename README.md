# mq-player-vue [![](https://img.shields.io/badge/Github-green.svg)](https://github.com/v-scmq/mq-player-vue) [![](https://img.shields.io/badge/Gitee-blue.svg)](https://gitee.com/scmq/mq-player-vue)

MQ音乐是一款基于Electron+Vue构建的桌面音乐播放器

### 项目技术栈

![](https://img.shields.io/badge/Electron-38-success.svg)
![](https://img.shields.io/badge/Vue-3-success.svg)
![](https://img.shields.io/badge/NodeJS-22-blue.svg)
![](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![](https://img.shields.io/badge/MusicMetadata-11.8-blue.svg)

### 1.特别声明
目前所公开的接口(位于:src/main/server/api/lib0, 作为demo用，请勿作为商业用途！)
1. 其中第三方音乐资源均来源于【赛博朋客2077】游戏
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

+ 歌曲榜单

![MV分类](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/6.png "歌曲榜单")

+ 下载管理

![MV分类](https://scmq-ms-dev-ed.develop.my.salesforce-sites.com/resource/demo/7.png "下载管理")

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
        ├─types      (相关类型定义)
        │  └─api
        ├─utils      (渲染进程部分相关使用的工具代码)
        └─views      (渲染进程部分相关页面)
```


## 文件上传专题

为了更好的了解文件上传知识, 在不使用第三方库的情况下进行如下总结(这里以NodeJS为例)

### 1.当网络请求是Electron自定义协议时

在渲染进程中fetch等api发送了自定义协议的相关接口时,在接口中使用Request(与Web中结构一样的)对象并配合NodeJS网络模块;
请求体及其类型完全由渲染进程发出的请求决定.

方法1:直接通过NodeJS的stream模块将Web的ReadableStream转化为NodeJS的ReadableStream然后发送到目标服务器

```ts
import { protocol } from 'electron';
import { Readable } from 'stream';
import { request as httpRequest } from 'http';
import type { ReadableStream as NodeWebReadableStream } from 'stream/web';

/**
 * 获取一个请求标头
 *
 * @param req http(s)请求对象
 */
const toHeaders = (req: Request) => {
  const newHeaders: Record<string, string> = {};
  req.headers.forEach((v, k) => (newHeaders[k] = v));
  return newHeaders;
};

// electron自定义协议处理
protocol.handle('app', (req: Request) => {
  if (!req.url.includes('upload')) {
    return new Response(null, { status: 404 });
  }

  if (!req.body) {
    return new Response(null, { status: 400 });
  }

  const headers = toHeaders(req);
  const options = { method: req.method, headers };

  return new Promise<Response>(resolve => {
    const newReq = httpRequest('http://localhost:8080/file/upload', options, httpResponse => {
      // NodeJS的IncomingMessage类实现了(NodeJS.ReadableStream),
      // 虽然Response构造方法要求传入Web的ReadableStream,但electron内部已经做了转换
      // 或者显式转换也可(例如: Readable.toWeb(httpResponse))
      resolve(new Response(httpResponse as any as ReadableStream, {
        status: httpResponse.statusCode,
        statusText: httpResponse.statusMessage
      }));
    });

    // 使用pipe方法直接通过管道将数据发送到目标服务器
    Readable.fromWeb(req.body as NodeWebReadableStream).pipe(newReq);
  });
});
```

方法2:从Web的ReadableStream中读取数据, 然后逐个发送到目标服务器

```ts
import { protocol } from 'electron';
import { request as httpRequest } from 'http';

/**
 * 获取一个请求标头
 *
 * @param req http(s)请求对象
 */
const toHeaders = (req: Request) => {
  const newHeaders: Record<string, string> = {};
  req.headers.forEach((v, k) => (newHeaders[k] = v));
  return newHeaders;
};

// electron自定义协议处理
protocol.handle('app', (req: Request) => {
  if (!req.url.includes('upload')) {
    return new Response(null, { status: 404 });
  }

  if (!req.body) {
    return new Response(null, { status: 400 });
  }

  const headers = toHeaders(req);
  const options = { method: req.method, headers };

  return new Promise<Response>(resolve => {
    const newReq = httpRequest('http://localhost:8080/file/upload', options, httpResponse => {
      // NodeJS的IncomingMessage类实现了(NodeJS.ReadableStream),
      // 虽然Response构造方法要求传入Web的ReadableStream,但electron内部已经做了转换
      // 或者显式转换也可(例如: Readable.toWeb(httpResponse))
      resolve(new Response(httpResponse as any as ReadableStream, {
        status: httpResponse.statusCode,
        statusText: httpResponse.statusMessage
      }));
    });

    newReq.once('error', e => resolve(new Response(null, { status: 400, statusText: e.message })));

    // 从流式读取器
    const reader = req.body.getReader();

    // 以递归方式读取
    const read = () => {
      reader.read().then(({ done, value }) => {
        value && newReq.write(Buffer.from(value));
        done ? newReq.end() : read();
      });
    };

    read();
  });
});
```

### 2.不依赖于Electron, 直接使用NodeJS发送请求时

方法1:直接将文件以流式方式作为请求体传输(只支持单文件,body中不能有该文件内容以外的任何数据),可配合URL参数完成其他非文件内容传输
但是如果将多个文件写入到了一个文件中,并且它们已经想方法2中那样使用边界分隔符等,
那么此时只需要header调整为form-data格式也能够间接完成多个文件上传

```ts
import { createReadStream } from 'fs';
import { request as httpRequest } from 'http';

export const upload = () => {
  const headers = { 'content-type': 'image/png' /* , 'content-length': '1024' */ };
  const options = { method: 'POST', headers };

  const newReq = httpRequest('http://localhost:8080/file/upload?name=test.png', options, httpResponse => {
    // NodeJS的IncomingMessage类实现了(NodeJS.ReadableStream),
    // 虽然Response构造方法要求传入Web的ReadableStream,但electron内部已经做了转换
    // 或者显式转换也可(例如: Readable.toWeb(httpResponse))
    const res = new Response(httpResponse as any as ReadableStream, {
      status: httpResponse.statusCode,
      statusText: httpResponse.statusMessage
    });

    res.text().then(data => {
      console.log('data:', data);
    }).catch(console.error);
  });

  createReadStream('D:\\temp\\test.png').pipe(newReq);
};
```

方法2:
模拟FormData的数据传输格式,更多内容具体可参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Type#在_html_表单中使用_content-type)

```ts
import { createReadStream } from 'fs';
import { request as httpRequest } from 'http';

export const upload = async () => {
  type FormItem = { field: string } & (
    { type: 'base', value: string | boolean | number } |
    { type: 'file'; path: string, mime: string }
    );

  const formItems: FormItem[] = [
    { field: 'id', type: 'base', value: 1 },
    { field: 'files', type: 'file', path: 'D:\\temp\\test.png', mime: 'image/png' },
    { field: 'files', type: 'file', path: 'D:\\temp\\upload-1.txt', mime: 'text/plain' }
  ];

  // 每一个表单项数据边界分割符(这里以浏览器一个实际发送请求时为样本)
  const boundary = '----WebKitFormBoundarydV9LA9aGEDv8ndul';
  const headers = { 'content-type': `multipart/form-data; boundary=${boundary}` /* , 'content-length': '1024' */ };
  const options = { method: 'POST', headers };

  const newReq = httpRequest('http://localhost:8080/file/upload', options, httpResponse => {
    // NodeJS的IncomingMessage类实现了(NodeJS.ReadableStream),
    // 虽然Response构造方法要求传入Web的ReadableStream,但electron内部已经做了转换
    // 或者显式转换也可(例如: Readable.toWeb(httpResponse))
    const res = new Response(httpResponse as any as ReadableStream, {
      status: httpResponse.statusCode,
      statusText: httpResponse.statusMessage
    });

    res.text().then(data => {
      console.log('data:', data);
    }).catch(console.error);
  });

  let state: true;

  for (const item of formItems) {
    if (item.type === 'base') {
      newReq.write(
        Buffer.from([
          `--${boundary}`,
          `Content-Disposition: form-data; name="${item.field}"\r\n`,
          `${item.value}`, // 写入实际数据前, 必须保留一个空行
          '' // 写入实际数据后, 必须换行
        ].join('\r\n'))
      );

      continue;
    }

    const path = item.path.replace(/\//g, '\\');
    const fileName = path.slice(Math.max(path.lastIndexOf('\\') + 1, 0));

    newReq.write(
      Buffer.from([
        `--${boundary}`,
        `Content-Disposition: form-data; name="${item.field}"; filename="${fileName}"`,
        `Content-Type: ${item.mime}\r\n`,
        '' // 写入实际数据前, 必须保留一个空行
      ].join('\r\n'))
    );

    state = await new Promise<boolean>(resolve => {
      const input = createReadStream(path);
      input.on('data', chunk => newReq.write(chunk));
      input.once('end', () => {
        input.close();
        resolve(true);
      });
      input.once('error', () => resolve(false));
    });

    if (!state) {
      newReq.destroy(new Error('status:400, reason: write already failed.'));
      break;
    }

    console.info('write-file-state:', state);
    // 写入文件数据行尾同样必须写入CRLF
    newReq.write(Buffer.from('\r\n'));
  }

  state && newReq.end(Buffer.from(`--${boundary}--\r\n`));
};
```