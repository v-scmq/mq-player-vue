/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** app id */
  readonly VITE_APP_ID: string;
  /** app name */
  readonly VITE_APP_NAME: string;
  /** 自定义的标准协议名称 */
  readonly VITE_SERVER_PROTOCOL: string;
  /** 自定义服务域名 */
  readonly VITE_SERVER_DOMAIN: string;
  /** 静态资源代理访问接口 */
  readonly VITE_SERVER_STATIC: string;
  /** 本地资源代理访问接口 */
  readonly VITE_SERVER_FILE: string;
  /** 第三方代理访问接口 */
  readonly VITE_SERVER_PROXY: string;
  /** 服务提供API接口 */
  readonly VITE_SERVER_API: string;

  /** 音乐数据API实现(1:有效的数据接口实现; 0:模拟的数据接口实现) */
  readonly VITE_MUSIC_API: '1' | '0';

  /** IndexedDB名称 */
  readonly VITE_DB_NAME: string;
  /** 存储用户信息的表名称 */
  readonly VITE_TABLE_USER: string;
  /** 存储本地文件的表名称 */
  readonly VITE_TABLE_FILE: string;
  /** 存储播放队列的表名称 */
  readonly VITE_TABLE_PLAY_QUEUE: string;
  /** 存储歌词信息的表名称 */
  readonly VITE_TABLE_LYRIC: string;
  /** 存储下载信息的表名称 */
  readonly VITE_TABLE_DOWNLOAD: string;

  /** IPC通道名:设置窗口状态 */
  readonly VITE_IPC_CHANNEL_SET_WINDOW_STATE: string;
  /** IPC通道名:打开文件所在位置 */
  readonly VITE_IPC_CHANNEL_OPEN_EXPLORER: string;
  /** IPC通道名:打开登录页面(electron模态窗口) */
  readonly VITE_IPC_CHANNEL_OPEN_LOGIN_VIEW: string;
  /** IPC通道名:清除cookie */
  readonly VITE_IPC_CHANNEL_CLEAR_COOKIE: string;
  /** IPC通道名:关闭计算机 */
  readonly VITE_IPC_CHANNEL_SHUTDOWN: string;
  /** IPC通道名:下载任务项更新(包含创建) */
  readonly VITE_IPC_CHANNEL_DOWNLOAD_UPDATED: string;
  /** IPC通道名:设置下载任务项状态*/
  readonly VITE_IPC_CHANNEL_SET_DOWNLOAD_ITEM: string;
  /** IPC通道名:从本地文件解析音频元数据 */
  readonly VITE_IPC_CHANNEL_PARSE_FILE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module NodeJS {
  interface Process {
    env: {
      VITE_DEV_SERVER_URL: string;
      [key: string]: string;
    };
  }
}

declare const __INDEXED_TABLES__: string;
