<template>
  <teleport :to="notTeleported ? 'body' : '.music-viewer' " :disabled='notTeleported'>
    <div class='v-column media-control' :class='{viewer}'>
      <slider v-model='media.timeValue' ref='progressSlider' :buffering='media.buffered' @change='valueChanged'/>

      <div class='v-row' style='justify-content:space-between;'>
        <!-- 左侧部分 -->
        <div class='v-row' style='flex:1;gap:8px;padding:0 0 0 8px;' v-if='viewer'>
          <icon name='heart' width='2em' height='2em'/>
          <icon name='download' width='2em' height='2em'/>
          <icon name='more' width='1.8em' height='1.8em'/>
          <icon name='comment-fill' width='1.8em' height='1.8em'/>

          <span>{{ media.time }}</span>
          <span>/</span>
          <span>{{ media.duration }}</span>
        </div>

        <div class='v-row' style='flex:1' v-else>
          <image-view class='album-icon' v-model='media.cover' defaultValue='icon/default_cover.jpg'
                      @click='openViewer'/>

          <div class='v-column'>
            <div class='v-row data-media' style='gap:8px'>
              <span class='link'>{{ media.singer }}</span>
              <span v-if='media.hasLine'>-</span>
              <span class='link'>{{ media.title }}</span>
            </div>

            <div class='v-row'>
              <span>{{ media.time }}</span>
              <span style='margin:0 4px;'>/</span>
              <span>{{ media.duration }}</span>
            </div>
          </div>
        </div>

        <!-- 中间部分 -->
        <div class='v-row' style='gap:8px;'>
          <!-- 播放模式 -->
          <popover class='v-column mode-control arrow' closeable :gap='16'>
            <icon id='mode' width='2em' height='2em' :name='modeIcon'/>

            <template v-slot:content>
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
            </template>
          </popover>

          <!-- 上一首 -->
          <icon width='2em' height='2em' name='previous' @click='play(getIndex(false),false)'/>
          <!-- 播放或暂停 -->
          <icon width='3em' height='3em' :name="isPlaying ? 'pause' : 'play' " @click='togglePlay'/>
          <!-- 下一首 -->
          <icon width='2em' height='2em' name='next' @click='play(getIndex(true),false)'/>

          <!-- 音量 -->
          <popover class='v-column volume-control arrow' :gap='16' @wheel='onVolumeScroll'>
            <icon id='volume' width='2em' height='2em' :name="volume === 0 ? 'mute' : 'volume' "/>
            <template v-slot:content>
              <slider vertical v-model='volume' style='flex:1' @change='handleVolumeChange'/>
              <span>{{ (volume * 100).toFixed(0) }}%</span>
            </template>
          </popover>
        </div>

        <!--  右侧部分 -->
        <div class='v-row' style='flex:1;justify-content:flex-end;gap:8px;padding:0 8px 0 0'>
          <popover class='v-row speed-control arrow' :gap='16' @wheel='onSpeedPaneScroll'>
            <!-- 「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」-->
            <div class='stroke-icon'>{{ (1.5 * speed + 0.5).toFixed(1) }}X</div>
            <template v-slot:content>
              <slider vertical v-model='speed' @change='handleSpeedChange'/>
              <div class='v-column' style='justify-content:space-between;'>
                <span>2.0</span><span>1.5</span><span>1.0</span><span>0.5</span>
              </div>
            </template>
          </popover>

          <template v-if='viewer'>
            <div class='stroke-icon'>写真</div>
            <div class='stroke-icon'>音质</div>
            <div class='stroke-icon'>音效</div>
          </template>

          <template v-else>
            <icon name='heart' width='2em' height='2em'/>
            <icon name='download' width='2em' height='2em'/>
          </template>

          <popover class='v-column play-queue' placement='right'>
            <icon name='playlist' width='2em' height='2em'/>
            <template v-slot:content>
              <div class='v-row title'>
                <span>播放队列</span>
                <icon name='close' class='--popover-close' width='1.4em' height='1.4em'/>
              </div>

              <div class='v-row option-bar' style="--button-icon-size: 1.5em">
                <template v-if='multiple'>
                  <popover>
                    <hl-button icon='plus'>添加到</hl-button>
                    <template v-slot:content>
                      <div class='dropdown-item separator first'>我的收藏</div>
                      <div class='dropdown-item last'>添加到新歌单</div>
                    </template>
                  </popover>

                  <hl-button icon='my-download'>下载</hl-button>
                  <hl-button icon='trash'>删除</hl-button>
                  <hl-button icon='multiple' @click='onMultiple'>退出批量操作</hl-button>
                </template>

                <template v-else>
                  <hl-button icon='trash' v-if='!multiple'>清空</hl-button>
                  <hl-button icon='multiple' @click='onMultiple'>批量操作</hl-button>
                </template>
              </div>

              <table-view style='flex:1;margin:0 0 0 8px' :columns='columns' :data='playList' :selection="multiple">
                <template v-slot:title='{item}'>
                  <span class='cell-text'>{{ item.title }}</span>
                  <icon class='vip-icon' name='vip' width='1em' height='1em' v-if='item.vip'/>
                  <icon class='mv-icon' name='mv' width='1em' height='1em' v-if='item.vid'/>
                </template>
              </table-view>
            </template>
          </popover>
        </div>
      </div>

    </div>
  </teleport>

  <teleport to='body' v-if='viewer'>
    <music-viewer :cover='media.cover' @close='closeViewer'>
      <template v-slot:song>
        <div class='v-row data-media'>
          <span class='link'>{{ media.singer }}</span>
          <span v-if='media.hasLine'>-</span>
          <span class='link'>{{ media.title }}</span>
          <icon class='mv-icon link' name='mv' v-if='media.vid'/>
        </div>
      </template>
    </music-viewer>
  </teleport>

</template>

<script lang='ts'>
import {getLyric} from '../api';
import {db, tables} from '../database';
import {Status} from '../player';
import {useMediaPlayer} from '../player/hooks';
import Message from '../components/Message';
import {secondToString, sleep} from '../../utils';

import MusicViewer from './MusicViewer.vue';

import {defineComponent, reactive, ref, nextTick, readonly, provide, onBeforeUnmount} from 'vue';

import {LyricLine} from '../../types';
import {TableColumn} from '../components/types';

export default defineComponent({
  name: 'MediaControl',

  components: {MusicViewer},

  setup() {
    const currentMedia = reactive({
      timeValue: 0, buffered: 0, time: '00:00', duration: '00:00',
      singer: 'MQ音乐', title: '聆听世界', album: '未知', cover: '', vid: 1,
      hasLine: false,
    });

    // 是否正在播放
    const isPlaying = ref(false);

    // 音量大小
    const volume = ref(0.2);

    // 播放模式图标
    const modeIcon = ref('list-loop');

    // 播放速率大小(用于绑定滑动条) 「1 = 1.5x + 0.5 => x = 1/3」
    const speed = ref(1 / 3);

    // 指定是否为viewer, 默认为false
    const viewer = ref(false);

    // 是否可以将组件内指定的DOM元素移动到MusicViewer组件下
    const notTeleported = ref(true);

    // 进度Slider
    const progressSlider = ref(null as any);

    const multiple = ref(false);

    const columns: TableColumn[] = [
      {type: 'index', width: '80px'},
      {title: '歌曲', property: 'title', width: '1.6fr', flex: true},
      {title: '歌手', property: 'singerName'},
      {title: '时长', property: 'duration', width: '80px'}
    ];

    // 歌词信息
    const lyrics = reactive({list: [] as LyricLine[], playedTime: 0});

    // 提供给LyricView组件所使用的歌词信息
    provide('lyrics', readonly(lyrics));

    const [player, playIndex, playList] = useMediaPlayer();

    // 设置音量
    player.setVolume(volume.value);

    /**
     * 获取播放器媒体播放索引
     *
     * @param next true:生成下一个索引,false:生成上一个索引
     * @return {number} 新的播放索引. 若返回{@code -1},则表示没有播放数据源,若返回{@code -2},则表示顺序播放结束
     */
    const getIndex = (next: boolean) => {
      let index = playIndex.value, size = playList.length;

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
      let list = playList;
      // 暂停当前播放的媒体
      player.pause();

      if (!list || list.length === 0 || index === -1 || index >= list.length) {
        Message.warning('没有播放数据源，请选择一个播放源！');
        return;
      }

      playIndex.value = index;

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
        if (player.prepare(media)) {
          player.play();
        } else {
          Message.error('媒体加载失败，即将播放下一首');
          playNext && play(++index, true);
        }
      }
    };

    player.setEventListener({
      statusChanged(status) {
        console.info(status);
        isPlaying.value = status === Status.PLAYING;

        if (isPlaying.value) {
          Message.info('已开始播放');
        } else if (status === Status.PAUSED) {
          Message.info('已暂停播放');
        }
      },

      timeChanged(time) {
        // 当滑动条没有再拖动时,才同步播放进度到滑动条视图
        let slider = progressSlider.value;
        if (!slider || slider.isNotDragging()) {
          currentMedia.timeValue = time / player.getDuration();
        }
      },

      durationChanged(duration) {
        currentMedia.duration = secondToString(duration);
      },

      mediaChanged(media) {
        currentMedia.title = media.title;

        let singer = media.singer, album = media.album;

        currentMedia.singer = ((singer instanceof Array)
            ? singer.map(item => item.name).join('/')
            : (singer instanceof Object ? singer.name : singer)) || '未知';

        currentMedia.hasLine = true;

        currentMedia.cover = (album instanceof Object) ? album.cover : media.cover;

        currentMedia.vid = media.vid;

        const list = lyrics.list;
        // 清空歌词信息
        list.length > 0 && list.splice(0, list.length);

        type LyricRowData = {
          id: string | number,
          mid: string | number,
          list: LyricLine[],
          [key: string]: any,
        };

        // 使否来自数据源接口
        const fromDataSource = media.platform > 0;

        // 先尝试从indexedDB中获取歌词
        const promise = fromDataSource
            // 若是网络资源
            ? db.queryOfFilter<LyricRowData>(tables.lyrics, data =>
                data.id === media.id && data.mid === media.mid)

            // 若是本地资源
            : db.queryOfFilter<LyricRowData>(tables.lyrics, data =>
                data.title === currentMedia.title && data.singer === currentMedia.singer);

        promise.then(data => {
          // 若存在歌词, 添加到歌词列表
          if (data && data.length > 0) {
            list.push(...data[0].list);
          }

        }).finally(() => {
          // 若未找到歌词 且 来自数据源接口
          if (list.length < 1 && fromDataSource) {
            // 从数据源api获取歌词
            getLyric(media).then(data => {
              if (data.length > 0) {
                list.push(...data);

                db.insert<LyricRowData>(tables.lyrics, {
                  id: media.id, mid: media.mid, list: data,
                  title: currentMedia.title, singer: currentMedia.singer
                });
              }
            });
          }
        });
      },

      bufferChanged(value) {
        currentMedia.buffered = value;
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

    // 移除事件监听器
    onBeforeUnmount(() => player.release());

    return {
      media: currentMedia, isPlaying, volume, speed, modeIcon, progressSlider,
      viewer, notTeleported, multiple, columns, playIndex, playList, getIndex, play,

      openViewer() {
        viewer.value = true;
        nextTick(() => void (notTeleported.value = false));
      },

      closeViewer() {
        viewer.value = false;
        notTeleported.value = true;
      },

      /**
       * 鼠标滚轮在音量面板上滚动时,重新设置播放器音量
       *
       * @param {WheelEvent} event 鼠标滚轮滚动事件
       */
      onVolumeScroll(event: WheelEvent) {
        let value = volume.value + (event.deltaY > 0 ? -0.05 : 0.05);
        volume.value = value < 0 ? 0 : value > 1 ? 1 : value;
      },


      /**
       * 播放或暂停
       */
      togglePlay() {
        player.isPlayable()
            ? (player.isPlaying() ? player.pause() : player.play())
            : play(playIndex.value, false);
      },

      /**
       * 鼠标滚轮在播放速率面板上滚动时,重新设置播放速率
       * @param {WheelEvent} event 鼠标事件
       */
      onSpeedPaneScroll(event: WheelEvent) {
        // 由 y = 1.5x + 0.5 得 x = (y - b) / a , 增量 = x2 -x1()
        // y = 0.5时,x = 0; 当 y = 0.6时 x = (0.6 - 0.5) / 1.5 = 1 / 15 = -0.066
        let value = speed.value + (event.deltaY > 0 ? -0.066 : 0.066);
        speed.value = value < 0 ? 0 : value > 1 ? 1 : value;
      },

      /**
       * 当播放速率值改变时,给播放器设置这个速率值
       * 「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」
       *
       * @param {number} newValue 播放速率
       */
      handleSpeedChange(newValue: number) {
        const value = 1.5 * newValue + 0.5;
        player.setSpeed(Number(value.toFixed(1)));
      },

      /**
       * 当音量值改变时,给播放器设置这个音量值
       *
       * @param {number} newValue 新的播放器音量值
       */
      handleVolumeChange(newValue: number) {
        player.setVolume(newValue);
      },

      /**
       * 滑动条值改变事件回调方法
       *
       * @param newValue 滑动条新的值
       * @param seek 是否为用户主动操作而导致的改变(如滑块被拖动 或 滑动条滑轨被点击)
       */
      valueChanged(newValue: number, seek: boolean) {
        const value = newValue * player.getDuration();

        // 重设歌词播放时间点
        currentMedia.time = secondToString(lyrics.playedTime = value);
        // 若未在拖动滑动条, 则跳到指定时间播放
        seek && player.status !== Status.UNKNOWN && player.seek(value);
      },

      /** 开始或结束批量操作 */
      onMultiple: () => void (multiple.value = !multiple.value),

    };
  }

});
</script>