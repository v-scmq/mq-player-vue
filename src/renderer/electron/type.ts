import type { LoginOptionRes } from '@/types/api';
import type { DownloadItem, SetDownloadItem, Song } from '@/types';

export type LoginOption = LoginOptionRes;

/** 窗口状态 */
export type WindowState =
  /*隐藏窗口*/
  | 'hide'
  /*最小化窗口*/
  | 'minimize'
  /** 从最大化和非最大化之间循环切换 */
  | 'toggle';

export type IElectronAPI = {
  /**
   * 清除指定站点的cookie信息
   *
   * @param site 需要移除cookie的站点URL
   */
  clearCookie(site: string): Promise<boolean>;

  /**
   * 设置窗口状态
   *
   * <pre>
   * 1.当主进程中开启窗口沙盒模式,
   *   那么在渲染进程调用window.close()方法将会直接将触发主进程中窗口的closed事件,
   *   而不会回调close事件, 从而会直接导致退出应用程序
   *
   * 2.对策(以下其中之一皆可)
   *   2.1在渲染进程中执行 delete window.close
   *   2.2在渲染进程中执行 window.addEventListener('beforeunload', e => e.preventDefault())
   *      当执行阻止操作时,不会像普通浏览器那样弹出alert确认框
   *
   * 3.因为应用程序已经调整了关闭图标功能为隐藏,那么正常情况下不会执行退出(即不对No2中的方案进行实施)
   * </pre>
   *
   * @param state 窗口状态(非有效值视为hide)
   */
  setWindowState(state?: WindowState): void;

  /**
   * 关闭计算机
   *
   * @param force 是否强制关机
   */
  shutdown(force: boolean): void;

  /**
   * 打开指定路径(是操作系统设置而定,默认:文件资源管理器)
   *
   * @param path 如果未指定,则默认打开下载目录,否则打开指定位置
   */
  openExplorer(path?: string): Promise<boolean>;

  /**
   * 打开一个模态框,并获取所加载页面的cookie信息
   *
   * @option option 打开模态框的配置选项
   */
  openLoginView(option: LoginOption): Promise<Electron.Cookie[]>;

  /**
   * 监听下载项进度更新事件
   *
   * @param callback 事件回调(提供下载项最新的进度信息用以存储,便于中断后在某个时机恢复下载)
   */
  onDownloadUpdated(callback: (item: DownloadItem) => void): void;

  /**
   * 通过配置选项设置下载项
   *
   * @param options 配置选项
   */
  setDownloadItem(options: SetDownloadItem | SetDownloadItem[]): Promise<void>;

  /**
   * 解析媒体文件,并获取媒体元数据信息
   *
   * @param files 媒体资源文件列表
   */
  parseFile(files: File[]): Promise<Song[]>;
};
