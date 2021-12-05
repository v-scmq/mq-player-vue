<template>
  <div class='v-column'>
    <slider v-model='media.timeValue' ref='progressSlider' :buffering='media.buffered' @change='valueChanged'/>
    <div class='v-row' style='justify-content: space-between;'>

      <!-- 左侧部分 -->
      <div class='v-row' style='flex:1'>
        <img class='cover album-icon' :src='media.cover' alt='专辑' draggable='false' @error='media.cover = DEFAULT_COVER'
             @click='viewerVisible=true'/>

        <div class='v-column media-info'>
          <span>{{ media.singer }} - {{ media.title }}</span>
          <div class='v-row'>
            <span>{{ media.time }}</span> <span style='margin:0 4px;'>/</span><span>{{ media.duration }}</span>
          </div>
        </div>
      </div>

      <!-- 中间部分 -->
      <div class='v-row'>
        <!-- 播放模式 -->
        <div class='popup-container'>
          <icon id='mode' width='2em' height='2em' :name='modeIcon'/>

          <div class='v-column popup-pane mode'>
            <div class='v-row' @click="modeIcon = 'list-loop' ">
              <icon width='2em' height='2em' name='list-loop'/>
              <span class='title'>列表循环</span>
            </div>
            <div class='v-row' @click="modeIcon = 'order' ">
              <icon width='2em' height='2em' name='order'/>
              <span class='title'>顺序播放</span>
            </div>
            <div class='v-row' @click="modeIcon = 'single-loop' ">
              <icon width='2em' height='2em' name='single-loop'/>
              <span class='title'>单曲循环</span>
            </div>
            <div class='v-row' @click="modeIcon = 'random' ">
              <icon width='2em' height='2em' name='random'/>
              <span class='title'>随机播放</span>
            </div>
          </div>
        </div>

        <!-- 上一首 -->
        <icon width='2em' height='2em' name='previous' @click='play(getIndex(false),false)'/>
        <!-- 播放或暂停 -->
        <icon width='3em' height='3em' :name="isPlaying ? 'pause' : 'play' " @click='playOrPause'/>
        <!-- 下一首 -->
        <icon width='2em' height='2em' name='next' @click='play(getIndex(true),false)'/>

        <!-- 音量 -->
        <div class='popup-container'>
          <icon id='volume' width='2em' height='2em' :name="volume === 0 ? 'mute' : 'volume' "/>
          <div class='v-column popup-pane volume' @wheel='onVolumeScroll'>
            <slider vertical v-model='volume' style='flex:1' @change='handleVolumeChange'/>
            <span>{{ (volume * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </div>

      <!--  右侧部分 -->
      <div class='v-row' style='flex:1;justify-content:flex-end;'>
        <div class='popup-container'>
          <!-- 「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」-->
          <div class='icon' id='speed'>{{ (1.5 * speed + 0.5).toFixed(1) }}X</div>
          <div class='v-row popup-pane speed' @wheel='onSpeedPaneScroll'>
            <slider vertical v-model='speed' style='height:100%' @change='handleSpeedChange'/>
            <div class='v-column' style='height:100%;justify-content:space-between;line-height:0.5'>
              <span>2.0</span><span>1.5</span><span>1.0</span><span>0.5</span>
            </div>
          </div>
        </div>

        <icon name='favorites' width='2em' height='2em'/>
        <icon name='download' width='2em' height='2em'/>
        <icon name='playlist' width='2em' height='2em'/>
      </div>
    </div>

    <teleport to='body' v-if='viewerVisible'>
      <music-viewer :cover='media.cover' @close='viewerVisible=false'/>
    </teleport>
  </div>
</template>

<script lang='ts'>
import player, {Status} from '../player';
import Message from '../components/Message';
import {secondToString, sleep} from '../../utils';

import {ref, reactive, onBeforeUnmount} from 'vue';

import MusicViewer from './MusicViewer.vue';

export default {
  name: 'Footer',

  components: {MusicViewer},

  setup() {
    const DEFAULT_COVER = 'icon/default_cover.jpg';

    const media = reactive({
      timeValue: 0, buffered: 0, time: '00:00', duration: '00:00', path: null,
      singer: 'MQ音乐', title: '聆听世界', album: '未知', cover: ''
    });

    const isPlaying = ref(false);       // 播放状态(特指 未播放 或 播放)

    const volume = ref(0.2);            // 音量大小

    const modeIcon = ref('list-loop'); // 播放模式图标

    const speed = ref(1 / 3);           // 播放速率大小 「1 = 1.5x + 0.5 => x = 1/3」

    const viewerVisible = ref(false);   // 音乐详情页面可见性

    const progressSlider = ref(null as any);   // 进度Slider

    /**
     * 获取播放器媒体播放索引
     *
     * @param next true:生成下一个索引,false:生成上一个索引
     * @return {number} 新的播放索引. 若返回{@code -1},则表示没有播放数据源,若返回{@code -2},则表示顺序播放结束
     */
    const getIndex = (next: boolean) => {
      let index = player.index, size = player.playList.length;
      // 列表循环
      if (modeIcon.value === 'list-loop') {
        return next ? (++index >= size ? 0 : index) : (--index < 0 ? --size : index);
      }
      // 顺序播放
      if (modeIcon.value === 'order') {
        // 若生成下一个索引,则直接增加;
        // 若生成上一个且生成的索引小于0时返回不等于-1且小于0的整数,表示列表播放完毕
        return next ? (++index >= size ? -2 : index) : (--index < 0 ? -2 : index);
      }
      // 随机播放
      if (modeIcon.value === 'random') {
        // [0,1) * length => [0,length)
        return Math.floor(Math.random() * size);
      }
      // 单曲循环
      return index;
    };

    /**
     * 播放指定索引的歌曲列表
     *
     * @param index 媒体资源索引
     * @param playNext 指定遇到错误时是否继续播放下一首
     */
    const play = (index: number, playNext: boolean) => {
      let list = player.playList;
      // 暂停当前播放的媒体
      player.pause();
      if (!list || list.length === 0 || index === -1 || index >= list.length) {
        Message.warning('没有播放数据源，请选择一个播放源！');
        return;
      }

      player.index = index;
      // 若index==-2,则是列表播放模式,且列表播放已完成,不播放下一首,
      // 可以不处理,因为index==-2在下面的执行中无法通过
      // 若播放索引在正常范围内,则准备播放媒体
      if (index >= 0 && index < list.length) {
        let media = list[index];
        if (!media) {
          Message.info('媒体信息不存在，即将播放下一首');
          playNext && play(++index, true);
          return;
        }

        // 准备加载媒体资源
        player.prepare(media).then(state => {
          if (state) {
            player.play();
          } else {
            Message.error('媒体加载失败，即将播放下一首');
            playNext ? play(++index, true) : null;
          }
        });
      }
    };

    /**
     * 播放或暂停
     */
    const playOrPause = () => {
      if (player.isPlayable()) {
        !player.isPlaying() ? player.play() : player.pause();
      } else {
        play(player.index, false);
      }
    };

    /**
     * 滑动条值改变事件回调方法
     *
     * @param newValue 滑动条新的值
     * @param seek 是否为用户主动操作而导致的改变(如滑块被拖动 或 滑动条滑轨被点击)
     */
    const valueChanged = (newValue: number, seek: boolean) => {
      media.time = secondToString(newValue * player.getDuration());
      if (seek && player.status !== Status.UNKNOWN) {
        player.seek(newValue * player.getDuration());
      }
    };

    /**
     * 当音量值改变时,给播放器设置这个音量值
     *
     * @param {number} newValue 新的播放器音量值
     */
    const handleVolumeChange = (newValue: number) => player.setVolume(newValue);

    /**
     * 当播放速率值改变时,给播放器设置这个速率值
     * 「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」
     *
     * @param {number} newValue 播放速率
     */
    const handleSpeedChange = (newValue: number) => player.setSpeed(1.5 * newValue + 0.5);

    /**
     * 鼠标滚轮在音量面板上滚动时,重新设置播放器音量
     *
     * @param {WheelEvent} event 鼠标滚轮滚动事件
     */
    const onVolumeScroll = (event: WheelEvent) => {
      let value = volume.value + (event.deltaY > 0 ? -0.05 : 0.05);
      volume.value = value < 0 ? 0 : value > 1 ? 1 : value;
    };

    /**
     * 鼠标滚轮在播放速率面板上滚动时,重新设置播放速率
     * @param {WheelEvent} event 鼠标事件
     */
    const onSpeedPaneScroll = (event: WheelEvent) => {
      // 由 y = 1.5x + 0.5 得 x = (y - b) / a , 增量 = x2 -x1()
      // y = 0.5时,x = 0; 当 y = 0.6时 x = (0.6 - 0.5) / 1.5 = 1 / 15 = -0.066
      let value = speed.value + (event.deltaY > 0 ? -0.066 : 0.066);
      speed.value = value < 0 ? 0 : value > 1 ? 1 : value;
    };

    player.setVolume(volume.value);

    player.setEventListener({
      statusChanged(status) {
        console.info('status=>', status)
        isPlaying.value = status === Status.PLAYING;
      },

      timeChanged(time) {
        // 当滑动条没有再拖动时,才同步播放进度到滑动条视图
        let slider = progressSlider.value;
        if (!slider || slider.isNotDragging()) {
          media.timeValue = time / player.getDuration();
        }
      },

      durationChanged(duration) {
        media.duration = secondToString(duration);
      },

      mediaChanged(mediaSource) {
        media.title = mediaSource.title;

        let singer = mediaSource.singer, album = mediaSource.album;

        media.singer = (singer instanceof Array) ? singer.map(item => item.name).join('/') :
            ((singer instanceof Object ? singer.name : singer) || '未知');

        media.cover = (album instanceof Object) ? album.cover : mediaSource.cover || DEFAULT_COVER;

        // 重新媒体后需要重新设置播放速率
        handleSpeedChange(speed.value);
      },

      bufferChanged(value) {
        media.buffered = value;
      },

      finished() {
        play(getIndex(true), true);
      },

      error(reason) {
        reason && Message.error(reason.message);
        Message.info('即将播放下一首');
        sleep().then(() => play(getIndex(true), true));
      }
    });

    // 释放媒体资源
    onBeforeUnmount(() => player.release());

    return {
      media, isPlaying, DEFAULT_COVER, viewerVisible, volume, speed, modeIcon, progressSlider,
      getIndex, play, playOrPause, valueChanged, handleVolumeChange, handleSpeedChange,
      onVolumeScroll, onSpeedPaneScroll
    }
  }
}
</script>

<style scoped>
.media-info {
  color: var(--text-base);
}

.album-icon {
  width: 4em;
  height: 4em;
  border-radius: 6px;
  cursor: pointer;
  margin: 0 4px 2px 2px;
}

#speed.icon {
  padding: 1px 10px;
  border-radius: 1.25em;
  color: var(--fill-base);
  border: 1px solid var(--fill-base);
}

.v-row .icon {
  margin: 0 4px;
  cursor: pointer;
  fill: var(--fill-base);
}

/* 音量弹出式面板 */
.popup-pane.volume, .popup-pane.speed {
  height: 10.5em;
  width: 4.5em;
  padding: 1em 0;
}

/* 播放模式弹出式面板 */
.popup-pane.mode {
  width: 8em;
  white-space: nowrap;
  fill: var(--fill-base);
}

.popup-pane.mode .title {
  margin: 0 0 0 0.5em;
  font-size: 0.875em;
}

.popup-pane.mode .v-row {
  width: 100%;
  cursor: pointer;
  padding: 0.5em 0.25em;
  box-sizing: border-box;
  justify-content: center;
}

.popup-pane.mode .v-row:not(:last-child) {
  border-bottom: 1px solid var(--fill-popup-mode-border);
}

.popup-pane.mode .v-row:hover {
  background: var(--fill-popup-mode-hover);
}
</style>
