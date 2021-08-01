/** 播放器状态枚举 */
const STATUS = {
    /**未知*/
    UNKNOWN: 'UNKNOWN',
    /**准备就绪*/
    READY: 'READY',
    /**播放中*/
    PLAYING: 'PLAYING',
    /**已暂停*/
    PAUSED: 'PAUSED',
    /**已停止*/
    STOPPED: 'STOPPED',
    /**由于某些原因而发生阻塞(例如网络不佳)*/
    STALLED: 'STALLED',
    /**播放器已被释放*/
    RELEASED: 'RELEASED'
};

/** 播放器对象 */
const player = {
    /**播放器状态枚举*/
    $statusType: STATUS,
    /** 播放器当前状态 */
    status: STATUS.UNKNOWN,
    /** 本地播放器 */
    nativePlayer: new Audio(),
    /** 事件监听器 */
    eventListener: null,
    /** 播放列表 */
    playList: [],
    /** 播放索引 */
    index: 0,

    /** 音频分析器 */
    analyser: null,
    /** 音频输入源 */
    audioSource: null,
    /** 音频上下文 */
    audioContext: null,
    /** 频谱计时器 */
    spectrumTimer: null,
    /** 音频频谱监听器 */
    audioSpectrumListener: null,

    /**
     * 开始播放媒体
     */
    play() {
        this.nativePlayer.play().then(null);
    },

    /**
     * 暂停播放媒体
     */
    pause() {
        this.nativePlayer.pause();
    },

    /**
     * 设置播放器到指定时间位置的
     * @param value{Number} 时间值，单位秒
     */
    seek(value) {
        this.nativePlayer.currentTime = value;
    },

    /**
     * 释放播放器资源
     */
    release() {
        this.nativePlayer.src = null;
        let listener = this.eventListener;
        this.eventListener = null;
        if (listener && listener.statusChanged) {
            listener.statusChanged(STATUS.RELEASED);
        }
    },

    /**
     * 设置播放器是否自动播放
     * @param value{Boolean} 是否自动播放，[true,false]
     */
    setAutoPlay(value) {
        this.nativePlayer.autoplay = value;
    },

    /**
     * 设置停止时间
     * @param value{Number} 播放器停止时间，单位秒
     */
    setStopTime(value) {
        this.nativePlayer.end = value;
    },

    /**
     * 设置播放器开始播放时间
     * @param value{Number} 播放器开始播放时间，单位秒
     */
    setStartTime(value) {
        this.nativePlayer.start = value;
    },

    /**
     * 设置播放器是否重复播放(单曲循环)
     * @param value{Boolean} 是否重复播放，[true,false]
     */
    setLoop(value) {
        this.nativePlayer.loop = value;
    },

    /**
     * 设置播放器片段重复的开始时间
     * @param value{Number} 时间，单位秒
     */
    setLoopStartTime(value) {
        this.nativePlayer.loopstart = value;
    },

    /**
     * 设置播放器片段重复的停止时间
     * @param value{Number} 时间，单位秒
     */
    setLoopStopTime(value) {
        this.nativePlayer.loopend = value;
    },

    /**
     * 准备媒体资源
     * @param media{Object} 媒体资源路径
     */
    prepare(media) {
        let path = media && media.path ? media.path : '';
        // 路径至少包含2个字符
        if (path.length < 2) {
            this.nativePlayer.src = '';
            return false;
        }

        // let isWindows = navigator.platform.toLowerCase().includes('win');
        // windows => D:\music\... .mp3 ; linux | mac => /media/... .mp3
        // let isLocalFile = isWindows ? path.charAt(1) === ':' : path.charAt(0) === '/';

        // this.nativePlayer.src = isLocalFile ? `media:///${path}` : path;
        this.nativePlayer.src = path;

        let listener = this.eventListener;
        if (listener && listener.mediaChanged) {
            listener.mediaChanged(media);
        }
        return true;
    },

    /**
     * 设置播放器音量
     * @param value{Number} 播放器音量,[0,1]
     */
    setVolume(value) {
        this.nativePlayer.volume = value;
    },

    /**
     * 获取播放器音量
     * @return {Number} 播放器音量
     */
    getVolume() {
        return this.nativePlayer.volume;
    },

    /**
     * 设置播放速率
     * @param value{Number} 播放速率值, [0.5,2]
     */
    setSpeed(value) {
        this.nativePlayer.playbackRate = value < 0.5 ? 0.5 : value > 2 ? 2 : value;
    },

    /**
     * 获取播放器播放速率
     * @return {Number} 播放速率
     */
    getSpeed() {
        return this.nativePlayer.playbackRate;
    },

    /**
     * 获取播放器时长，单位毫秒
     * @returns {Number} 播放时长
     */
    getDuration() {
        return this.nativePlayer.duration;
    },

    /**
     * 获取当前播放器时间，单位毫秒
     * @returns {Number} 播放时间
     */
    getTime() {
        return this.nativePlayer.currentTime;
    },

    /**
     * 设置播放器是否静音
     * @param value{Boolean} 是否静音，[true,false]
     */
    setMute(value) {
        this.nativePlayer.mute = value;
    },

    /**
     * 检查播放器是否静音
     * @returns {Boolean} 播放器是否已静音
     */
    isMute() {
        return this.nativePlayer.muted;
    },

    /**
     * 检查播放器是否已暂停
     * @returns {Boolean} 播放器是否已暂停
     */
    isPaused() {
        return this.nativePlayer.paused;
    },

    /**
     * 检查播放器是否已播放
     * @returns {Boolean} 若正在播放则返回true.
     */
    isPlaying() {
        return this.status === STATUS.PLAYING;
    },

    /**
     * 检查播放器中是否有媒体资源可播放
     *
     * @return {Boolean} 若播放器可播放则返回true
     */
    isPlayable() {
        return this.nativePlayer.src !== "" && this.status !== STATUS.RELEASED;
    },

    /**
     * 设置播放器错误的回调方法
     * @param callback{Function} 回调方法
     */
    setOnError(callback) {
        this.nativePlayer.onemptied = callback;
    },

    /**
     * 注册播放器事件监听器.
     * @param listener{Object} 事件监听器
     */
    setEventListener(listener) {
        this.eventListener = listener;
    },

    /**
     * 设置音频频谱数据变化监听器.<br>
     * 注意为了减少CPU负载,只有播放器在播放时才会回调监听器,
     * 同时应该在没有显示频谱视图的时候,取消监听器
     * @param listener {Function} 音频频谱数据监听器处理方法
     */
    setAudioSpectrumListener(listener = null) {
        // 取消原有监听器
        this.spectrumTimer ? cancelAnimationFrame(this.spectrumTimer) : null;
        // 解除原有监听器引用
        this.audioSpectrumListener = null;
        // 若未提供监听器,则后续什么也不做
        if (!listener) {
            return;
        }

        // 若未初始化音频上下文,则先初始化
        if (!this.audioContext) {
            // 创建音频上下文
            this.audioContext = new (AudioContext || window['webkitAudioContext'])();
            // 创建音频输入源
            this.audioSource = this.audioContext.createMediaElementSource(this.nativePlayer);
            // 创建音频分析器
            this.analyser = this.audioContext.createAnalyser();
            // 音频输入源连接到分析器
            this.audioSource.connect(this.analyser);
            // 音频分析器连接到音频输出目标(如麦克风、耳机...)
            this.analyser.connect(this.audioContext.destination);

            // 8位无符号音频频谱数据
            this.dataArray = new Uint8Array(1024);
        }

        // 代理传入的监听方法
        this.audioSpectrumListener = () => {
            // 复制频谱数据到8位无符号数组中
            this.analyser.getByteFrequencyData(this.dataArray);
            // 主动调用传入的监听方法,以便渲染频谱数据
            listener(this.dataArray);
            // 以每秒60次的调用继续调用代理监听方法
            this.spectrumTimer = requestAnimationFrame(this.audioSpectrumListener);
        }

        // 主动执行一次代理监听方法
        this.audioSpectrumListener();
        // 若播放器并未播放,则取消监听
        if (!this.isPlaying()) {
            cancelAnimationFrame(this.spectrumTimer);
        }
    }
};

// 注册播放器时长改变时的回调
player.nativePlayer.ondurationchange = () => {
    let listener = player.eventListener;
    if (listener && listener.durationChanged) {
        listener.durationChanged(player.nativePlayer.duration);
    }
};

// 注册播放器播放时间改变的回调
player.nativePlayer.ontimeupdate = () => {
    let listener = player.eventListener;
    if (listener && listener.timeChanged) {
        listener.timeChanged(player.nativePlayer.currentTime);
    }
};

// 注册播放器正在缓冲时的回调
player.nativePlayer.onprogress = () => {
    let listener = player.eventListener;
    if (listener && listener.bufferChanged) {
        let value = player.nativePlayer.buffered;
        value = value.length > 0 ? value.end(value.length - 1) : 0;
        let duration = player.nativePlayer.duration || 1;
        listener.bufferChanged(value / duration);
    }
};

// 注册播放器播放时的回调
player.nativePlayer.onplaying = () => {
    let listener = player.eventListener;
    player.status = STATUS.PLAYING;
    if (listener && listener.statusChanged) {
        listener.statusChanged(STATUS.PLAYING);
    }

    // 若已注册音频监听器
    if (player.audioSpectrumListener) {
        // 开启音频频谱监听
        player.audioSpectrumListener();
    }
};

// 注册播放器正在播放时的回调
player.nativePlayer.onended = () => {
    let listener = player.eventListener;
    player.status = STATUS.STOPPED;
    if (listener && listener.finished) {
        listener.finished();
    }

    // 取消音频频谱数据监听
    if (player.spectrumTimer) {
        cancelAnimationFrame(player.spectrumTimer);
    }
};

// 注册播放器暂停时的回调
player.nativePlayer.onpause = () => {
    let listener = player.eventListener;
    player.status = STATUS.PAUSED;
    if (listener && listener.statusChanged) {
        listener.statusChanged(STATUS.PAUSED);
    }

    // 取消音频频谱数据监听
    if (player.spectrumTimer) {
        cancelAnimationFrame(player.spectrumTimer);
    }
};

// 注册播放器阻塞时的回调
player.nativePlayer.onstalled = () => {
    let listener = player.eventListener;
    player.status = STATUS.STALLED;
    if (listener && listener.statusChanged) {
        listener.statusChanged(STATUS.STALLED);
    }

    // 取消音频频谱数据监听
    if (player.spectrumTimer) {
        cancelAnimationFrame(player.spectrumTimer);
    }
};

// 导出对象
export default player;
