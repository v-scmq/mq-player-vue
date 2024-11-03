import { app, BrowserWindow, ipcMain as ipc, protocol, shell, Menu, Tray } from 'electron';
import { exec } from 'child_process';
import { basename, join } from 'node:path';
import { existsSync, mkdirSync, rmSync, statSync, writeFile } from 'fs';
import { parseFile } from 'music-metadata';
import { createServer } from './server';

import type { WindowState, LoginOption } from '@/electron/type';
import type { SetDownloadItem, Song } from '@/types';
import type { IAudioMetadata } from 'music-metadata';

// 检查是否是生产模式
if (import.meta.env.PROD && !app.requestSingleInstanceLock()) {
  // 若未能获得单个应用实例的锁,那么退出应用程序
  app.quit();
  // 关闭进程
  process.exit(0);
}

// 强制锁定DPI缩放为1, 参见 https://github.com/electron/electron/issues/6571
// app.commandLine.appendSwitch('high-dpi-support', '1');
// app.commandLine.appendSwitch('force-device-scale-factor', '1');

// 空引用
const NULL_REF = null as any;
// 应用程序相关数据的根路径
const ROOT_PATH = join(app.getPath('documents'), import.meta.env.VITE_APP_ID);
// 应用程序名
const APP_NAME = import.meta.env.VITE_APP_NAME;
// windows平台判定
const isWindows = process.platform === 'win32';
// 当前入口执行文件的完整目录
const currentDir = import.meta.dirname;

// 临时变量
let tempVar;
/** 系统托盘 */
let tray: Tray;
// 主(浏览器)窗口
let mainWindow: BrowserWindow;
// 主窗口网页内容
let contents: Electron.WebContents;
/** 缓存任务下载列表 */
let downloads: Record<string, Electron.DownloadItem> = {};
// // 记录下载任务数量,虽然可以使用Object.keys(downloads)
// let taskCount = 0;

app.setPath((tempVar = 'logs'), join(ROOT_PATH, tempVar));
app.setPath((tempVar = 'temp'), join(ROOT_PATH, tempVar));
app.setPath((tempVar = 'cache'), join(ROOT_PATH, tempVar));
app.setPath((tempVar = 'appData'), join(ROOT_PATH, tempVar));
app.setPath((tempVar = 'userData'), join(ROOT_PATH, tempVar));
app.setPath((tempVar = 'crashDumps'), join(ROOT_PATH, tempVar));

// 重置临时变量
tempVar = NULL_REF;

// 注册一个自定义的标准协议
protocol.registerSchemesAsPrivileged([
  {
    // 自定义协议名称
    scheme: import.meta.env.VITE_SERVER_PROTOCOL,
    privileges: {
      // 设置标准协议
      standard: true,
      // 设置为安全协议
      secure: true,
      // 开发环境下直接通过内容安全策略
      bypassCSP: import.meta.env.DEV,
      // 生产环境下开启同源策略
      corsEnabled: import.meta.env.PROD,
      // 允许在service worker中访问
      allowServiceWorkers: true,
      // 开启fetch api支持
      supportFetchAPI: true,
      // 开启stream(流)支持
      stream: true
    }
  }
]);

// 监听第2个应用程序实例,当程序被再次打开,那么聚焦显示主窗口
app.on('second-instance', () => mainWindow.focus());

// 当所有窗口关闭后结束进程(windows & linux)
app.on('window-all-closed', () => {
  protocol.unhandle(import.meta.env.VITE_SERVER_PROTOCOL);
  app.releaseSingleInstanceLock();
  app.quit();
});

// 在macOS上，当单击dock图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口。
// app.on('activate', () => (BrowserWindow.getAllWindows().length < 1 && createWindow());

/** 创建系统托盘 */
const createTray = () => {
  // 系统托盘图标
  const icon = import.meta.env.DEV
    ? `${currentDir}/../../public/image/tray.ico`
    : `${currentDir}/../${import.meta.env.VITE_SERVER_STATIC}/image/tray.ico`;

  // 注意tray需要声明为全局变量,否则会被自动回收对象,导致自动销毁系统托盘
  tray = new Tray(icon);
  tray.setTitle(APP_NAME);
  tray.setToolTip(APP_NAME);

  const open = () => mainWindow.show();

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '打开', click: open },
      { label: '退出', click: () => mainWindow.destroy() }
    ])
  );

  tray.on('click', open);
};

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法 有些API只能在事件发生后使用
app.on('ready', () => {
  // 创建Electron内部服务
  createServer();
  // 创建系统托盘
  createTray();

  // 创建浏览器主窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    backgroundColor: 'rgb(236, 236, 236)',
    webPreferences: {
      // nodeIntegration: false,             // 关闭NodeJS集成
      // contextIsolation: true,             // 开启上下文隔离限制(从版本12.0开始默认为true)
      // webSecurity: true,                  // 默认为true,设置为false将关闭web安全策略(如同源策略)
      // enableRemoteModule: false,          // 关闭远程模块,(最佳方案:使用ipc通信)
      // zoomFactor: 0.8,                    // 设置浏览器窗口为80%的默认缩放比例(窗口显示后设置,否则很容易失效)
      // sandbox: true,                      // 开启沙盒模式(默认开启).

      // 注意:开启沙盒模式后, 预加载脚本只能使用是cjs, 且渲染进程调用window.close()
      //      将会不会回调BrowserWindow的close事件, 而是直接回调closed事件(具体参考@/electron/types.ts => setWindowState)
      preload: join(currentDir, '../preload/index.cjs')
    }
  });

  contents = mainWindow.webContents;

  // 替换用户代理标识
  contents.setUserAgent(
    contents
      .getUserAgent()
      .replace(/Electron\S+\s/, '')
      .replace(new RegExp(`${APP_NAME}\\S+\\s`), '')
  );

  // 若在开发环境模式下, 从开发服务加载页面
  if (import.meta.env.DEV) {
    // 加载开发模式服务器的URL
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL).then(() => mainWindow.show());
    contents.openDevTools();
  }

  // 若在生产环境模式下, 从自定义协议的虚拟服务器加载页面
  else {
    // 从自定义协议加载首页html文件, protocol://domain/static/index.html
    mainWindow
      .loadURL(
        `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${
          import.meta.env.VITE_SERVER_STATIC
        }/index.html`
      )
      .then(() => mainWindow.show());
  }

  // 当窗口尝试关闭的处理(注意:调用窗口对象上的destroy方法,除了closed之外,close,unload和beforeunload都不会被触发)
  mainWindow.on('close', e => {
    // 阻止关闭行为
    e.preventDefault();
    // 隐藏主窗口
    mainWindow.hide();
  });

  // 当浏览器窗口关闭时
  mainWindow.once('closed', () => {
    // 销毁系统托盘
    tray.destroy();
    // 解除全局变量引用
    downloads = mainWindow = tray = contents = NULL_REF;
  });

  // // 阻止主窗口内页面跳转,非一开始加载的页面都将被拒绝跳转
  // contents.on('will-navigate', e => {
  //   const url = e.url;
  //
  //   if (url !== contents.getURL()) {
  //     e.preventDefault();
  //     contents.downloadURL(e.url);
  //   }
  // });

  /****************************** IPC通信 START ******************************/
  const ipcHandle = ipc.handle;

  // 1.处理来自渲染进程请求(删除指定站点下的所有Cookie信息)
  ipcHandle(import.meta.env.VITE_IPC_CHANNEL_CLEAR_COOKIE, (e, url: string) => {
    return new Promise<void>(resolve => {
      const cookies = e.sender.session.cookies;
      cookies.get({ url }).then(list => list.forEach(cookie => cookies.remove(url, cookie.name)));
      resolve();
    });
  });

  // 2.处理来自渲染进程请求(设置窗口状态)
  ipcHandle(import.meta.env.VITE_IPC_CHANNEL_SET_WINDOW_STATE, (_, state: WindowState) => {
    // 若是请求隐藏窗口
    if (!state || state === 'hide') {
      mainWindow.hide();
    }

    // 若是请求最小化窗口
    else if (state === 'minimize') {
      mainWindow.minimize();
    }

    // 若是请求循环切换最大化和非最大化
    else if (state === 'toggle') {
      mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
    }
  });

  // 3.处理来自渲染进程请求(关闭计算机)
  ipcHandle(import.meta.env.VITE_IPC_CHANNEL_SHUTDOWN, (_, force: boolean) => {
    // shutdown 命令用法:
    // windows系统可在cmd  输入 "shutdown ?"      查看
    // linux  系统可在终端 输入 "shutdown --help" 查看

    // force: 指定是否强制执行关机(仅适用于windows)
    const command = isWindows ? `shutdown -p${force ? ' -f' : ''}` : 'shutdown -h now';
    exec(command, (error: Error | null) => app.exit(error ? -1 : 0));
  });

  // 4.处理来自渲染进程请求(打开文件所在位置)
  ipcHandle(import.meta.env.VITE_IPC_CHANNEL_OPEN_EXPLORER, (_, path: string) => {
    // 当指定路径无效时打开下载目录
    shell.showItemInFolder(path || join(ROOT_PATH, 'download'));
    return true;
  });

  // 5.处理来自渲染进程请求(以模态窗口打开一个登录页面,当登录成功跳转至首页时, 返回该站点的cookie信息)
  ipcHandle(import.meta.env.VITE_IPC_CHANNEL_OPEN_LOGIN_VIEW, (_, options: LoginOption) => {
    return new Promise<Electron.Cookie[] | null>(resolve => {
      const { preload, width, height, indexURL } = options;

      if (!options.url) {
        return resolve([]);
      }

      // 初始化模态窗口
      let modal = new BrowserWindow({
        width,
        height,
        parent: mainWindow,
        modal: true,
        show: false,
        resizable: false,
        frame: false,
        transparent: true,
        webPreferences: { preload }
      });

      // 加载指定的URL
      void modal.loadURL(options.url);
      modal.once('ready-to-show', () => modal.show());

      let contents = modal.webContents;

      // 当页面开始导航(页面跳转)
      contents.on('will-navigate', (_, url) => {
        if (indexURL === url) {
          let _resolve = resolve;
          // 将resolve方法对象设置为null, 以便在closed事件中检测是否resolve过(虽然重复resolve不会有影响)
          resolve = NULL_REF;

          const url = indexURL;
          const cookies = contents.session.cookies;

          cookies.get({ url }).then(list => {
            list.forEach(cookie => cookies.set({ ...cookie, url, sameSite: 'no_restriction', secure: true }));
            _resolve(list);
            _resolve = NULL_REF;
          });

          modal.close();
        }
      });

      // 当模态框已经关闭时
      modal.on('closed', () => {
        if (modal) {
          modal.destroy();
          modal = contents = NULL_REF;
        }

        resolve && resolve(NULL_REF);
      });

      // 设置窗口打开处理器
      contents.setWindowOpenHandler(({ url }) => {
        // 使用系统默认浏览器打开模态框内的连接
        void shell.openExternal(url);
        // 拒绝新窗口打开模态框内的所有连接
        return { action: 'deny' };
      });
    });
  });

  // 6.处理来自渲染进程请求(设置下载任务)
  ipcHandle(import.meta.env.VITE_IPC_CHANNEL_SET_DOWNLOAD_ITEM, (_, options: SetDownloadItem) => {
    const { path, type } = options;

    if (type === 'create' && path) {
      // @ts-ignore
      delete options.type;
      return contents.session.createInterruptedDownload(options as Electron.CreateInterruptedDownloadOptions);
    }

    const item = downloads[path];

    if (item) {
      // 若已经完成, 则从内存缓存中删除
      if (item.getState() === 'completed') {
        return void delete downloads[path];
      }

      // 取消
      if (type === 'cancel') {
        delete downloads[path];
        return item.cancel();
      }

      type === 'pause' && item.pause();
      type === 'resume' && item.canResume() && item.resume();
    }
  });

  // 7.处理来自渲染进程请求(解析媒体文件并获取媒体元数据信息)
  ipcHandle(import.meta.env.VITE_IPC_CHANNEL_PARSE_FILE, async (_, paths: string[]) => {
    const UNDEFINED = void 0;

    let index = -1;
    let medias = paths as any as Song[];

    let coverPath: string | undefined;
    let nameRegex: RegExp | undefined;

    for (let path of paths) {
      const meta = (await parseFile(path).catch()) || ({} as IAudioMetadata);

      let artist = meta.common?.artist;
      let title = meta.common?.title;
      let fileName = basename(path);
      let cover: string | undefined;

      if (!title || !artist) {
        const index = fileName.lastIndexOf('.');
        const name = index < 0 ? fileName : fileName.slice(0, index);
        // 歌手 - 标题
        const [v1, v2] = name.split((nameRegex = nameRegex || /-/), 2);

        // 存在2项时, 作为 歌手 - 标题
        if (v2) {
          artist = artist || v1.trim();
          title = title || v2.trim();
        }

        // 只有1项目, 作为标题
        else {
          title = title || v1.trim();
        }
      }

      let buffer: any = meta.common?.picture;

      if (buffer && (buffer = buffer[0]?.data)) {
        const codes = [...fileName].map(c => c.charCodeAt(0)).join('');
        let list = [];
        let index = 0;

        while (1) {
          const c = codes.slice(index, (index += 10));

          if (c) {
            list.push(Number(c).toString(36));
          } else {
            break;
          }
        }

        if (!coverPath) {
          coverPath = join(ROOT_PATH, 'picture-album');

          if (!existsSync(coverPath)) {
            mkdirSync(coverPath);
          } else if (statSync(coverPath).isFile()) {
            rmSync(coverPath);
            mkdirSync(coverPath);
          }
        }

        const _path = join(coverPath, list.join('-'));

        cover = import.meta.env.DEV
          ? `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${
              import.meta.env.VITE_SERVER_FILE
            }/${_path}`
          : `/${_path}`;

        writeFile(_path, buffer as Uint8Array, null, () => UNDEFINED);
      }

      const UNKNOWN = '未知';

      medias[++index] = {
        path: import.meta.env.DEV
          ? `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${
              import.meta.env.VITE_SERVER_FILE
            }/${path}`
          : `/${import.meta.env.VITE_SERVER_FILE}/${path}`,
        title: title || UNKNOWN,
        singer: artist ? [{ name: artist }] : UNDEFINED,
        singerName: artist || UNKNOWN,
        album: { name: meta.common?.album || UNKNOWN },
        duration: (meta.format.duration || 0) as any,
        cover,
        year: meta.common?.year || ''
      };
    }

    return medias;
  });

  /****************************** IPC通信   END ******************************/

  // 监听下载任务
  contents.session.on('will-download', (_, item) => {
    const send = (item: any) => {
      if (contents && !contents.isDestroyed()) {
        contents.send(import.meta.env.VITE_IPC_CHANNEL_DOWNLOAD_UPDATED, item);
      }
    };

    let path: string = item.getSavePath();

    // *** 存储路径已设定,说明是恢复下载项(无需做文件路径设定) ***
    // *** 存储路径未设定,说明是新建下载项(需要做文件路径设定) ***
    if (!path) {
      let ext: string;
      let name = item.getFilename() || String(new Date().getTime());
      const extIndex = name.lastIndexOf('.');
      const DEFAULT_EXT = 'bin';

      if (extIndex < 0) {
        ext = DEFAULT_EXT;
      } else {
        ext = name.slice(extIndex + 1) || DEFAULT_EXT;
        name = name.slice(0, extIndex);
      }

      // 注意:路径分割符必须与操作系统一致(例如在windows11上,使用'/'作为路径分割符,会导致下载异常中断)
      const parent = join(ROOT_PATH, 'download');

      let index = 0;
      let fileName;
      path = join(parent, (fileName = `${name}.${ext}`));

      // 已经处于下载的项目中没有相同的路径
      for (const key in downloads) {
        if (key === path) {
          path = join(parent, (fileName = `${name}(${++index}).${ext}`));
        }
      }

      // 检测路径是否存在,若存在,则继续重命名
      while (existsSync(path)) {
        path = join(parent, (fileName = `${name}(${++index}).${ext}`));
      }

      // 加入到下载项目缓存数组当中
      downloads[path] = item;

      // 将新建下载项信息发送到渲染进程,然后保存这些信息
      send({
        path, // 文件存储绝对路径
        urlChain: item.getURLChain(),
        mimeType: item.getMimeType(),
        offset: 0,
        length: item.getTotalBytes(),
        lastModified: item.getLastModifiedTime(),
        eTag: item.getETag(),
        startTime: item.getStartTime(),
        state: 'interrupted', // 状态:额外添加的属性
        name: fileName // 文件名:额外添加的属性
      } as Electron.CreateInterruptedDownloadOptions);
    }

    const id = path;
    item.setSavePath(path);
    // app.setBadgeCount(++taskCount);

    item.on('updated', (_, state) =>
      send({
        id,
        path,
        offset: item.getReceivedBytes(), // 已传输完成的字节
        state, // 状态 => 'progressing':下载中; 'interrupted':已中断
        speed: item.getCurrentBytesPerSecond(), // 单位:字节/秒
        percent: item.getPercentComplete() // 进度百分比(已扩大100倍)
      })
    );

    item.once('done', (_, state) => {
      // 从内存缓存中移除(可能在主窗口closed事件中,变量已被设定为null)
      downloads && delete downloads[path];

      // taskCount > 0 && app.setBadgeCount(--taskCount);

      send({
        id,
        path,
        offset: item.getReceivedBytes(),
        state,
        percent: item.getPercentComplete()
      });
    });
  });
});
