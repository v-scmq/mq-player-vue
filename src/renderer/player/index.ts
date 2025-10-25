import { reactive, ref } from 'vue';
import type { LyricLine, Song } from '@/types';

/**
 * 媒体播放器状态枚举
 */
export enum Status {
  /** 就绪 */
  READY,
  /** 播放中 */
  PLAYING,
  /** 已暂停 */
  PAUSED,
  /** 已停止 */
  STOPPED,
  /** 已阻塞(由于某些原因而发生阻塞,例如网络不佳) */
  STALLED
}

/**
 * 媒体播放器事件监听器
 */
type MediaEventListener = {
  /**
   * 媒体播放器状态已发生改变
   *
   * @param status 播放器新状态
   */
  statusChanged(status: Status): void;

  /**
   * 媒体资源发生改变
   *
   * @param media 媒体资源信息
   */
  mediaChanged<T extends { path?: string; [key: string]: any }>(media: T): void;

  /**
   * 播放时长发生变化
   *
   * @param duration 播放时长(单位: 秒)
   */
  durationChanged(duration: number): void;

  /**
   * 播放进度时间值发生变化
   *
   * @param time 当前播放时间(单位: 秒)
   */
  timeChanged(time: number): void;

  /**
   * 缓冲进度发生变化
   *
   * @param progress 缓冲进度(0 <= progress <= 1)
   */
  bufferChanged(progress: number): void;

  /**
   * 媒体资源播放完成
   */
  finished(): void;

  /**
   * 媒体播放器发生错误
   *
   * @param reason 错误异常信息
   */
  error(reason?: Error): void;
};

/**
 * 音频频谱监听器
 */
type AudioSpectrumListener = (dataArray: Uint8Array) => void;

/** 当前正在播放歌曲的歌词(不使用readonly限制导出,只需保持正常使用即可) */
export const lyrics = reactive({ list: [] as LyricLine[], playedTime: 0 });
/** 当前的播放队列(不使用readonly限制导出,只需保持正常使用即可) */
export const playList = reactive<Song[]>([]);
/** 当前播放歌曲索引(不使用readonly限制导出,只需保持正常使用即可) */
export const playIndex = ref(-1);

/** 本地播放器 */
const nativePlayer = new Audio();

/** 当前播放器状态 */
let status: Status = Status.READY;
/** 事件监听器 */
let eventListener: MediaEventListener;
/** 当前加载的媒体资源路径 */
let currentPath: string | null;
/** 播放速率 */
let speed = 1;

/** 音频分析器 */
let analyser: AnalyserNode;
/** 音频输入源 */
let audioSource: MediaElementAudioSourceNode;
/** 音频上下文 */
let audioContext: AudioContext;
/** 8位无符号音频频谱数据 */
let dataArray: Uint8Array<ArrayBuffer>;
/** 频谱计时器 */
let spectrumTimer: number;

/** 音频频谱监听器 */
let audioSpectrumListener: () => void;

const stopTimer = () => {
  if (audioSpectrumListener) {
    dataArray.fill(0);
    audioSpectrumListener && audioSpectrumListener();
  }

  spectrumTimer && cancelAnimationFrame(spectrumTimer);
  spectrumTimer = null as any;
};

/**
 * 播放器对象
 */
const player = {
  /** 开始播放媒体 */
  play() {
    void nativePlayer.play();
  },

  /** 暂停播放媒体 */
  pause() {
    nativePlayer.pause();
  },

  /**
   * 设置播放器到指定时间位置的
   *
   * @param value 时间值，单位秒
   */
  seek(value: number) {
    nativePlayer.currentTime = value;
  },

  /**
   * 设置播放器音量
   *
   * @param value 播放器音量,[0,1]
   */
  setVolume(value: number) {
    nativePlayer.volume = value;
  },

  /**
   * 设置播放速率
   *
   * @param value 播放速率值, [0.5, 2]
   */
  setSpeed(value: number) {
    nativePlayer.playbackRate = speed = Math.min(Math.max(value, 0.5), 2);
  },

  /**
   * 获取播放器时长，单位毫秒
   */
  getDuration() {
    return nativePlayer.duration;
  },

  /**
   * 检查播放器是否已播放
   */
  isPlaying() {
    return !!nativePlayer.src && status === Status.PLAYING;
  },

  /**
   * 检查播放器中是否有媒体资源可播放
   */
  isPlayable() {
    return !!nativePlayer.src && status < Status.STALLED;
  },

  /**
   * 准备媒体资源
   *
   * @param media 媒体资源信息
   */
  prepare(media: { path?: string; [key: string]: any }) {
    const path = media && media.path;

    // 路径至少包含2个字符
    if (!path || path.length < 2) {
      nativePlayer.src = currentPath = '';
      return false;
    }

    if (currentPath !== path) {
      // 已使用代理方式 代替本地文件资源和第三方网络资源,无需做任何转换
      nativePlayer.src = currentPath = path;
      eventListener?.mediaChanged(media);
    }

    // 必须重新设定播放速率, 否则之前的设定无效
    player.setSpeed(speed);

    return true;
  },

  /**
   * 从一个包含媒体信息的列表中指定位置的媒体资源播放
   *
   * @param list 媒体资源信息列表
   * @param index 指定开始播放的索引
   */
  playMedias(list: Song[], index?: number) {
    const length = list.length;
    playList.splice(0, playList.length, ...list);
    playIndex.value = index = Math.max(Math.min(index || 0, length), 0);

    if (!length || index >= length) {
      return eventListener?.error(new Error('当前播放列表无任何歌曲'));
    }

    const state = player.prepare(list[index]);
    state && player.play();
    !state && eventListener?.error(new Error('当前歌曲不能播放'));
  },

  /**
   * 注册播放器事件监听器.
   *
   * @param listener 事件监听器
   */
  setEventListener(listener: MediaEventListener) {
    // 若是第一次调用注册监听器, 先回调一次状态改变事件
    !eventListener && listener.statusChanged(Status.READY);
    eventListener = listener;
  },

  /**
   * 设置音频频谱数据变化监听器.<br>
   * 注意为了减少CPU负载,只有播放器在播放时才会回调监听器,
   * 同时应该在没有显示频谱视图的时候,取消监听器
   *
   * @param listener 音频频谱数据监听器处理方法
   */
  setAudioSpectrumListener(listener: AudioSpectrumListener | null) {
    stopTimer();
    audioSpectrumListener = null as any;

    // 若未提供监听器,则后续什么也不做
    if (!listener) {
      return;
    }

    // 若未初始化音频上下文,则先初始化
    if (!audioContext) {
      // 创建音频上下文
      audioContext = new AudioContext();
      // 创建音频输入源
      audioSource = audioContext.createMediaElementSource(nativePlayer);
      // 创建音频分析器
      analyser = audioContext.createAnalyser();
      // 音频输入源连接到分析器
      audioSource.connect(analyser);
      // 音频分析器连接到音频输出目标(如麦克风、耳机...)
      analyser.connect(audioContext.destination);

      // 8位无符号音频频谱数据
      dataArray = new Uint8Array(1024);
    }

    // 代理传入的监听方法
    audioSpectrumListener = () => {
      // 复制频谱数据到8位无符号数组中
      analyser.getByteFrequencyData(dataArray);
      // 主动调用传入的监听方法,以便渲染频谱数据
      listener(dataArray);
      // 以每秒60次的调用继续调用代理监听方法
      spectrumTimer = requestAnimationFrame(audioSpectrumListener || (() => null));
    };

    // 主动执行一次代理监听方法
    requestAnimationFrame(audioSpectrumListener);

    // 若播放器并未播放,则取消监听
    !player.isPlaying() && stopTimer();
  }
};

// 注册播放器时长改变时的回调
nativePlayer.ondurationchange = () => {
  eventListener?.durationChanged(nativePlayer.duration);
};

// 注册播放器播放时间改变的回调
nativePlayer.ontimeupdate = () => {
  eventListener?.timeChanged(nativePlayer.currentTime);
};

// 注册播放器正在缓冲时的回调
nativePlayer.onprogress = () => {
  if (eventListener) {
    let value: TimeRanges | number = nativePlayer.buffered;
    value = value.length > 0 ? value.end(value.length - 1) : 0;

    const duration = nativePlayer.duration || 1;

    eventListener.bufferChanged(value / duration);
  }
};

// 注册播放器播放时的回调
nativePlayer.onplaying = () => {
  status = Status.PLAYING;

  // 回调播放器状态变化事件
  eventListener?.statusChanged(Status.PLAYING);

  // 若已注册音频监听器, 则开启音频频谱监听
  audioSpectrumListener && audioSpectrumListener();
};

// 注册播放器正在播放时的回调
nativePlayer.onended = () => {
  // 设置为停止状态
  status = Status.STOPPED;

  // 回调播放完成事件
  eventListener?.finished();

  // 取消音频频谱数据监听
  stopTimer();
};

// 注册播放器暂停时的回调
nativePlayer.onpause = () => {
  status = Status.PAUSED;

  // 回调播放器状态变化事件
  eventListener?.statusChanged(Status.PAUSED);
  // 取消音频频谱数据监听
  stopTimer();
};

// 注册播放器阻塞时的回调
nativePlayer.onstalled = () => {
  status = Status.STALLED;

  // 回调播放器状态变化事件
  eventListener?.statusChanged(Status.STALLED);
  // 取消音频频谱数据监听
  stopTimer();
};

// 注册播放器发生错误时的回调
nativePlayer.onerror = (_event, _source, _lineno, _colno, error) => {
  nativePlayer.src = '';
  status = Status.STOPPED;
  // 回调播放器发生错误事件
  eventListener?.error(error);
  // 取消音频频谱数据监听
  stopTimer();
};

export default player;
