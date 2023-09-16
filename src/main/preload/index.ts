import { contextBridge, ipcRenderer } from 'electron';
import { parseBuffer } from 'music-metadata';

import fs from 'fs';

import type { IOptions } from 'music-metadata';
import type { ModalOpenOption, WindowStateListener } from '@/types';

// 将api注入到window对象上
contextBridge.exposeInMainWorld('electron', {
  /** 设置窗口最小化 */
  setWindowMinimize: () => ipcRenderer.invoke('window-minimize'),

  /** 设置最大化或还原窗口 */
  setWindowMaximizeOrRestore: () => ipcRenderer.invoke('window-maximize-restore'),

  /**
   * 获取窗口状态(这里特指是否非全屏的最大化)
   */
  getWindowState: () => ipcRenderer.invoke('get-window-state'),

  /**
   * 当窗口最小化时,执行特定的回调方法
   *
   * @param callback 待执行回调方法. 若为null将移除监听器
   */
  onWindowStateChange: (callback: WindowStateListener) => ipcRenderer.on('maximize', callback),

  /**
   * 打开一个模态框,并获取所加载页面的cookie信息
   *
   * @param param 打开模态框的配置选项
   * @returns {Promise<string>} 返回模态框(窗口)所加载的页面的cookie信息
   */
  openModal: (param: ModalOpenOption): Promise<string> => ipcRenderer.invoke('open-modal', JSON.stringify(param)),

  /**
   * 移除指定网页的cookie信息
   *
   * @param url 需要移除cookie的URL
   */
  removeAllCookie: (url: string) => ipcRenderer.invoke('remove-all-cookie', url),

  /** 清除浏览器历史记录 */
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  /**
   * 解析媒体文件,并获取媒体元数据信息
   *
   * @param file 媒体资源路径
   * @param options 解析配置选项
   */
  async parseFile(file: File, options?: IOptions) {
    try {
      const buffer = await file.arrayBuffer();
      return await parseBuffer(new Uint8Array(buffer), undefined, options);
    } catch (ignore) {
      return null;
    }
  },

  /**
   * 创建指定路径的目录(文件夹)
   *
   * @param path 文件夹路径
   */
  mkDirs: (path: string) => fs.mkdirSync(path, { recursive: true }),

  /**
   * 强制删除一个目录
   *
   * @param path 目录路径
   */
  rmDir: (path: string) => fs.rmSync(path, { recursive: true, force: true }),

  /**
   * 强制删除文件
   *
   * @param path 文件路径
   */
  rmFile: (path: string) => fs.rmSync(path, { force: true, recursive: true }),

  /**
   * 将数据(Buffer)写入到指定的文件中.
   *
   * @param path 文件路径
   * @param buffer 数据
   */
  writeFile: (path: string, buffer: string | NodeJS.ArrayBufferView) => fs.writeFileSync(path, buffer),

  /**
   * 读取指定路径的文件
   *
   * @param path 文件路径
   * @param options 配置选项
   */
  readFile: (path: string, options: { encoding?: null | undefined; flag?: string | undefined }) =>
    fs.readFileSync(path, options),

  /**
   * 通过检查文件系统，检查指定路径是否存在
   *
   * @param path 文件或目录 路径
   */
  exists: (path: string) => fs.existsSync(path),

  /**
   * 检查指定路径的是否是文件. 不能在此处直接返回路径状态信息, 因为 module:fs.Stats是一个类,
   * 它所包含的的方法是不能直接在隔离后的渲染进程中所用, 必须返回一个简单类型的数据
   *
   * @param path 目标路径
   */
  isFile: (path: string) => fs.statSync(path).isFile(),

  /**
   * 检查指定路径的是否是目录(文件夹). 不能在此处直接返回路径状态信息, 因为 module:fs.Stats是一个类,
   * 它所包含的的方法是不能直接在隔离后的渲染进程中所用, 必须返回一个简单类型的数据
   *
   * @param path 目标路径
   */
  isDirectory: (path: string) => fs.statSync(path).isDirectory(),

  /**
   * 获取应用程序运行时进程所在的根路径
   */
  getStorePath: () => ipcRenderer.invoke('get-store-path') as Promise<string>,

  /**
   * 关闭计算机
   *
   * @param {boolean} force 是否强制关机
   */
  shutdown: (force: boolean) => ipcRenderer.invoke('shutdown', force)
});
