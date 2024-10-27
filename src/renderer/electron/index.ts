import { ref, readonly, reactive, toRaw } from 'vue';
import { toFileSize } from '@/utils';
import { db } from '@/database';

import type { IElectronAPI } from '@/electron/type';
import type { DownloadItem } from '@/types';

type GlobalWindow = Window & {
  electron?: IElectronAPI;
};

const electron = (<GlobalWindow>window).electron as IElectronAPI;

/** 标记当前主窗口是否最大化 */
const maximized = ref(false);
/** 标记当前主窗口是否全屏化 */
const fullScreen = ref(false);

// TODO electron中使用窗口上的状态相关api在遇到了渲染进程使用某个元素使其全屏时,这些api的结果并不正确
//      目前对策:在渲染进程窗口resize事件中粗略判定
const resizeCallback = () => {
  // 注意理论上在未开发者工具时,外部和内部的宽度相同,在某些情况下瞬间触发窗口大小变化时,得到的外部尺寸比内部尺寸小
  // 于是对于窗口尺寸采用外部和内部尺寸最大的那一个
  const width = Math.max(outerWidth, innerWidth);
  const height = Math.max(outerHeight, innerHeight);
  const monitor = screen;

  // 最大化检测(注意:若是手动拖动窗口和整个屏幕可用大小一样时,也会导致出现不正确的最大化结果,但这里忽略)
  maximized.value = width === monitor.availWidth && height === monitor.availHeight;

  // 全屏检测(***若是直接由F11触发的全屏,检测结果将不正确, 所以禁用默认F11,但是在开发者工具出按下的仍然无法正确处理***)
  fullScreen.value = !!document.fullscreenElement || (width === monitor.width && height === monitor.height);
};

export default electron;
export const isMaximized = readonly(maximized);
export const isFullScreen = readonly(fullScreen);

/**
 * 设置窗口全屏
 *
 * @param force true:强制全屏; false:取消全屏
 */
export const toggleFullScreen = (force?: boolean | Event) => {
  // true:已经全屏; false:未全屏
  const value = fullScreen.value;
  // 是否循环切换状态
  const toggle = typeof force !== 'boolean';

  // 未全屏 && (循环切换:true || 强制全屏:true) => 请求全屏
  if (!value && (toggle || force === true)) {
    document.documentElement.requestFullscreen().finally(resizeCallback);
  }

  // 已全屏 && (循环切换:true || 强制全屏:false) => 退出全屏
  if (value && (toggle || force === false)) {
    document.exitFullscreen().finally(resizeCallback);
  }
};

/** 下载任务列表 */
export const downloads: DownloadItem[] = reactive([]);
// 下载任务相关记录存储表名称
const DOWNLOAD_TABLE = import.meta.env.VITE_TABLE_DOWNLOAD;

(() => {
  // 监听窗口大小改变事件,通过检测窗口大小判断是否最大化和全屏
  // 注意:electron在未触发全屏时,通过主进程回调最大化状态是正常的,但触发了全屏,会导致结果不正确
  addEventListener('resize', resizeCallback);
  // 监听键盘按键按下事件,阻止F11全屏(注意:若是在浏览器开发者工具处按下并不会会触发该事件)
  addEventListener('keydown', e => e.code === 'F11' && e.preventDefault());

  // 手动调用一次,以初始化窗口状态
  resizeCallback();

  // 当下载任务进度更新时
  electron.onDownloadUpdated(item => {
    // 任务更新
    if (item.id) {
      const origin = downloads.find(_ => _.path === item.path);

      if (origin) {
        // 格式化下载速率
        item.speed = item.speed ? `${toFileSize(item.speed as number)}/s` : '';
        // @ts-ignore 格式化已传输大小
        item.received = toFileSize(item.offset);
        void db.put(DOWNLOAD_TABLE, toRaw(Object.assign(origin, item)));
      }
    }

    // 任务新建
    else {
      // 用path作为id
      item.id = item.path;
      item.size = toFileSize(item.length);
      downloads.unshift(item);

      void db.put(DOWNLOAD_TABLE, item, true);
    }
  });

  // 获取下载任务列表项
  db.query<DownloadItem>(DOWNLOAD_TABLE).then(records => {
    for (const item of records) {
      // 若之前存储的状态不是已完成,则重置未已中断
      item.state !== 'completed' && (item.state = 'interrupted');
      delete item.speed;

      if (item.name?.includes('赛博朋客2077 - 2077四星通缉.mp4')) {
        // @ts-ignore
        item.name = item.name?.replace('赛博朋客2077 - 2077四星通缉.mp4', '赛博朋客2077 - 四星通缉.mp4');
        // @ts-ignore
        item.id = item.id.replace('赛博朋客2077 - 2077四星通缉.mp4', '赛博朋客2077 - 四星通缉.mp4');
        // @ts-ignore
        item.path = item.path.replace('赛博朋客2077 - 2077四星通缉.mp4', '赛博朋客2077 - 四星通缉.mp4');
      }
    }

    downloads.push(...records);
  });
})();
