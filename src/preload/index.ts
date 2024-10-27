import { contextBridge, ipcRenderer as ipc, webUtils } from 'electron';
import type { IElectronAPI } from '@/electron/type';

const invoke = ipc.invoke;

// 将api注入到window对象上
contextBridge.exposeInMainWorld('electron', {
  clearCookie: site => {
    return invoke(import.meta.env.VITE_IPC_CHANNEL_CLEAR_COOKIE, site);
  },

  setWindowState(state) {
    void invoke(import.meta.env.VITE_IPC_CHANNEL_SET_WINDOW_STATE, typeof state !== 'string' ? void 0 : state);
  },

  shutdown: force => {
    void invoke(import.meta.env.VITE_IPC_CHANNEL_SHUTDOWN, force);
  },

  openExplorer: path => {
    return invoke(import.meta.env.VITE_IPC_CHANNEL_OPEN_EXPLORER, typeof path !== 'string' ? '' : path);
  },

  openLoginView: option => {
    return invoke(import.meta.env.VITE_IPC_CHANNEL_OPEN_LOGIN_VIEW, option);
  },

  onDownloadUpdated: callback => {
    ipc.on(import.meta.env.VITE_IPC_CHANNEL_DOWNLOAD_UPDATED, (_, item) => callback(item));
  },

  setDownloadItem: options => {
    return invoke(import.meta.env.VITE_IPC_CHANNEL_SET_DOWNLOAD_ITEM, options);
  },

  async parseFile(files) {
    const paths = files.map(file => webUtils.getPathForFile(file));
    return invoke(import.meta.env.VITE_IPC_CHANNEL_PARSE_FILE, paths);
  }
} as IElectronAPI);
