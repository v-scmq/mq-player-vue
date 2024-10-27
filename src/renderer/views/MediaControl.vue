<script lang="ts" setup>
import { reactive, ref, nextTick, watch, toRaw } from 'vue';

import CSlider from '@/components/CSlider.vue';
import CIcon from '@/components/CIcon.vue';
import CImage from '@/components/CImage.vue';
import CPopover from '@/components/CPopover.vue';
import CButton from '@/components/CButton.vue';
import CTable from '@/components/CTable.vue';
import MusicViewer from './MusicViewer.vue';

import { db } from '@/database';
import player, { Status, lyrics, playIndex, playList } from '@/player';

import { Message } from '@/components/message';
import { formatTime, sleep, isArray } from '@/utils';
import { getSongLyric } from '@/api';

import type { TableColumn } from '@/components/types';
import type { LyricLine, Song } from '@/types';

type IconName = import('@/components/CIcon.vue').IconNamedType;

// 歌词缓存相关记录存储表名称
const LYRIC_TABLE = import.meta.env.VITE_TABLE_LYRIC;
// 播放队列记录的存储表名称
const PLAY_QUEUE_TABLE = import.meta.env.VITE_TABLE_PLAY_QUEUE;

const media = reactive({
  timeValue: 0,
  buffered: 0,
  time: '00:00',
  duration: '00:00',
  singer: '' as string | undefined,
  title: '' as string | undefined,
  album: '未知' as string | undefined,
  cover: '',
  vid: 0 as string | number | undefined,
  hasLine: false
});

// 是否正在播放
const isPlaying = ref(false);

// 音量大小
const volume = ref(0.2);

// 播放模式图标
const modeIcon = ref<IconName>('list-loop');

// 播放速率大小(用于绑定滑动条) 「1 = 1.5x + 0.5 => x = 1/3」
const speed = ref(1 / 3);

// 指定是否为viewer, 默认为false
const viewer = ref(false);

// 是否可以将组件内指定的DOM元素移动到MusicViewer组件下
const notTeleported = ref(true);

// 进度Slider
const timeSlider = ref(null as any);

// 是否为多选模式
const multiple = ref(false);
// 播放队列中已选择的歌曲
const selectSongs = ref<number[]>([]);

const columns: TableColumn[] = [
  { type: 'index', width: '80px' },
  { title: '歌曲', property: 'title', flex: true },
  { title: '歌手', property: 'singer', width: '100px' },
  { title: '时长', property: 'duration', width: '70px' }
];

// 连续播放失败最大次数
const MAX_ERRORS = 3;
// 记录当前播放失败次数
let currentErrors = 0;

/**
 * 获取播放器媒体播放索引
 *
 * @param next true:生成下一个索引,false:生成上一个索引
 */
const getIndex = (next: boolean) => {
  let index = playIndex.value;
  let size = playList.length;

  // 列表循环
  if (modeIcon.value === 'list-loop') {
    return next ? (++index >= size ? 0 : index) : --index < 0 ? --size : index;
  }

  // 顺序播放
  if (modeIcon.value === 'order') {
    // 若生成下一个索引,则直接增加;
    // 若生成上一个且生成的索引小于0时返回不等于-1且小于0的整数,表示列表播放完毕
    return next ? (++index >= size ? -2 : index) : --index < 0 ? -2 : index;
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
 * @param operation prev:上一首; next:下一首(默认)
 */
const play = (operation?: 'prev' | 'next') => {
  // 若传递了参数,则认为是人为触发, 那么重置播放失败次数
  operation && (currentErrors = 0);

  let list = playList;
  // 暂停当前播放的媒体
  player.pause();

  const index = getIndex(operation !== 'prev');

  if (!list || list.length === 0 || index === -1 || index >= list.length) {
    Message.warning('没有播放数据源，请选择一个播放源！');
    return;
  }

  playIndex.value = index;

  // 若index==-2,则是列表播放模式,且列表播放已完成,不播放下一首,
  // 可以不处理,因为index==-2在下面的执行中无法通过
  // 若播放索引在正常范围内,则准备播放媒体
  const song = list[index];

  if (!song) {
    Message.info('播放错误，指定了一个错误的位置！');
    return;
  }

  // 准备加载媒体资源
  if (player.prepare(song)) {
    player.play();
  } else {
    Message.error('媒体加载失败，即将播放下一首');
    ++currentErrors < MAX_ERRORS && play();
  }
};

const openViewer = () => {
  viewer.value = true;
  nextTick(() => void (notTeleported.value = false));
};

const closeViewer = () => {
  viewer.value = false;
  notTeleported.value = true;
};

/**
 * 鼠标滚轮在音量面板上滚动时,重新设置播放器音量
 *
 * @param event 鼠标滚轮滚动事件
 */
const onVolumeScroll = (event: WheelEvent) => {
  let value = volume.value + (event.deltaY > 0 ? -0.05 : 0.05);
  volume.value = value < 0 ? 0 : value > 1 ? 1 : value;
};

/**
 * 播放或暂停
 */
const togglePlay = () => {
  if (currentErrors >= MAX_ERRORS || !player.isPlayable()) {
    // 未超过尝试次数 且 播放列表至少超过1首歌曲
    const next = playList.length > 1;
    next && Message.error('当前歌曲不能播放,即将播放下一首');
    next && play('next');
  } else {
    player.isPlaying() ? player.pause() : player.play();
  }
};

/**
 * 鼠标滚轮在播放速率面板上滚动时,重新设置播放速率
 *
 * @param event 鼠标事件
 */
const onSpeedPaneScroll = (event: WheelEvent) => {
  // 由 y = 1.5x + 0.5 得 x = (y - b) / a , 增量 = x2 -x1()
  // y = 0.5时,x = 0; 当 y = 0.6时 x = (0.6 - 0.5) / 1.5 = 1 / 15 = -0.066
  let value = speed.value + (event.deltaY > 0 ? -0.066 : 0.066);
  speed.value = value < 0 ? 0 : value > 1 ? 1 : value;
};

/**
 * 当播放速率值改变时,给播放器设置这个速率值
 * 「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」
 *
 * @param newValue 播放速率
 */
const handleSpeedChange = (newValue: number) => {
  const value = 1.5 * newValue + 0.5;
  player.setSpeed(Number(value.toFixed(1)));
};

/**
 * 当音量值改变时,给播放器设置这个音量值
 *
 * @param newValue 新的播放器音量值
 */
const handleVolumeChange = (newValue: number) => {
  player.setVolume(newValue);
};

/**
 * 滑动条值改变事件回调方法
 *
 * @param newValue 滑动条新的值
 * @param seek 是否为用户主动操作而导致的改变(如滑块被拖动 或 滑动条滑轨被点击)
 */
const valueChanged = (newValue: number, seek: boolean) => {
  const value = newValue * player.getDuration();

  // 重设歌词播放时间点
  media.time = formatTime((lyrics.playedTime = value));
  // 若未在拖动滑动条, 则跳到指定时间播放
  seek && player.isPlayable() && player.seek(value);
};

/** 删除播放队列中的歌曲 */
const deletePlayQueue = () => {
  const list = playList as Array<{ id: string | number }>;

  if (playList.length < 1) {
    return Message.error('当前无任何歌曲！');
  }

  // 若处于非批量选择模式
  if (!multiple.value) {
    // ===执行全部删除===
    return void list.splice(0, list.length);
  }

  // 处于批量选择模式
  const { value } = selectSongs;

  if (value.length < 1) {
    return Message.error('请至少选择一首歌曲！');
  }

  // 本地歌曲以路径作为id
  const ids = value.map(i => list[i].id as string);
  selectSongs.value = [];

  // 若全选, 则直接清空列表
  if (ids.length === list.length) {
    list.splice(0, list.length);
  } else {
    const length = list.length - ids.length;
    const map: { [key: string | number]: 1 } = {};

    ids.forEach(id => (map[id] = 1));
    list.splice(0, length, ...list.filter(item => !map[item.id]));
  }
};

// 从播放列表播放指定位置的歌曲
const playsFromQueue = (list: Song[], index: number) => {
  if (index === playIndex.value) {
    player.isPlayable() && !player.isPlaying() && player.play();
  } else if (player.prepare(list[index])) {
    player.play();
  }
};

player.setEventListener({
  statusChanged(status) {
    isPlaying.value = status === Status.PLAYING;
  },

  timeChanged(time) {
    // 当滑动条没有再拖动时,才同步播放进度到滑动条视图
    timeSlider.value?.isNotDragging() && (media.timeValue = time / player.getDuration());
  },

  durationChanged(duration) {
    media.duration = formatTime(duration);
  },

  mediaChanged(song: Song) {
    Object.assign(media, {
      title: song.title,
      singer: song.singerName || '未知',
      cover: song.album?.cover || song.cover,
      vid: song.vid,
      hasLine: true
    });

    const list = lyrics.list;
    // 使否来自数据源接口
    const isNetSource = !!song.mid;

    // 清空歌词信息
    list.length > 0 && list.splice(0, list.length);

    type LyricRowData = {
      id?: string | number;
      mid: string | number;
      list: LyricLine[];
      [key: string]: any;
    };

    // 歌词筛选器
    const filter: (data: LyricRowData) => boolean = isNetSource
      ? data => data.id === song.id && data.mid === song.mid // 若是网络资源
      : data => data.title === media.title && data.singer === media.singer; // 若是本地资源

    // 先尝试从indexedDB中获取歌词
    db.query<LyricRowData>(LYRIC_TABLE, filter).then(data => {
      if (data?.length > 0) {
        // 若存在歌词, 添加到歌词列表
        list.push(...data[0].list);
      }

      // 若已经找到歌词, 或者是本地媒体资源(未找到歌词也直接结束后续处理)
      if (list.length > 0 || !isNetSource) {
        return;
      }

      const { id, mid } = song as { id: string; mid: string };
      // 从数据源api获取歌词
      getSongLyric({ id, mid }).then(({ data }) => {
        if (data) {
          list.push(...data);

          db.put<LyricRowData>(LYRIC_TABLE, {
            id,
            mid,
            list: data,
            title: media.title,
            singer: media.singer
          });
        }
      });
    });
  },

  bufferChanged(value) {
    media.buffered = value;
  },

  finished: play,

  error(reason) {
    reason && Message.error(reason.message);

    // 未超过尝试次数 且 播放列表至少超过1首歌曲
    if (++currentErrors < MAX_ERRORS && playList.length > 1) {
      Message.info('即将播放下一首');
      sleep().then(() => play());
    }
  }
});

// 查询播放队列记录
db.query<Song>(PLAY_QUEUE_TABLE).then(list => {
  // 设置音量
  player.setVolume(volume.value);

  if (list.length) {
    playList.push(...list);
    // TODO 记录上一次播放信息
    playIndex.value = 0;
  }

  // 监听播放列表变化, 然后同步至indexedDB
  watch(playList, () => {
    db.clear(PLAY_QUEUE_TABLE).then(() => {
      playList.length && db.put(PLAY_QUEUE_TABLE, toRaw(playList));
    });
  });
});
</script>

<template>
  <teleport :to="notTeleported ? 'body' : '.music-viewer'" :disabled="notTeleported">
    <div class="col media-control no-gap" :class="{ viewer }">
      <c-slider v-model="media.timeValue" ref="timeSlider" :buffering="media.buffered" @change="valueChanged" />

      <div class="row">
        <!-- 左侧部分 -->
        <div class="row icons" style="flex: 1; padding-left: 8px" v-if="viewer">
          <c-icon name="heart" />
          <c-icon name="download" />
          <c-icon name="comment-fill" />

          <span>{{ media.time }}</span>
          <span>/</span>
          <span>{{ media.duration }}</span>
        </div>

        <div class="row" style="flex: 1" v-else>
          <c-image class="album-icon" v-model="media.cover" error="image/cover.jpg" @click="openViewer" />

          <div class="col min-gap">
            <template v-if="media.hasLine">
              <div class="row">
                <span class="link">{{ media.singer }}</span>
                <span>-</span>
                <span class="link">{{ media.title }}</span>
              </div>

              <div class="row min-gap">
                <span>{{ media.time }}</span>
                <span>/</span>
                <span>{{ media.duration }}</span>
              </div>
            </template>

            <template v-else>MQ音乐 聆听世界</template>
          </div>
        </div>

        <!-- 中间部分 -->
        <div class="row">
          <!-- 播放模式 -->
          <c-popover class="col mode-control arrow icons" closeable :gap="16">
            <c-icon :name="modeIcon" />

            <template #content>
              <div class="row" @click="modeIcon = 'list-loop'">
                <c-icon name="list-loop" />
                <span class="title">列表循环</span>
              </div>
              <div class="row" @click="modeIcon = 'order'">
                <c-icon name="order" />
                <span class="title">顺序播放</span>
              </div>
              <div class="row" @click="modeIcon = 'single-loop'">
                <c-icon name="single-loop" />
                <span class="title">单曲循环</span>
              </div>
              <div class="row" @click="modeIcon = 'random'">
                <c-icon name="random" />
                <span class="title">随机播放</span>
              </div>
            </template>
          </c-popover>

          <!-- 上一首 -->
          <c-icon name="previous" @click="play('prev')" />
          <!-- 播放或暂停 -->
          <c-icon class="play-pause" :name="isPlaying ? 'pause' : 'play'" @click="togglePlay" />
          <!-- 下一首 -->
          <c-icon name="next" @click="play" />

          <!-- 音量 -->
          <c-popover class="col volume-control arrow icons" :gap="16" @wheel="onVolumeScroll">
            <c-icon :name="volume === 0 ? 'mute' : 'volume'" />
            <template #content>
              <c-slider vertical v-model="volume" style="flex: 1" @change="handleVolumeChange" />
              <span>{{ (volume * 100).toFixed(0) }}%</span>
            </template>
          </c-popover>
        </div>

        <!--  右侧部分 -->
        <div class="row right" style="flex: 1; padding-right: 8px">
          <c-popover class="row speed-control arrow" :gap="16" @wheel="onSpeedPaneScroll">
            <!-- 「设 y = ax + b, 由 0.5 = 0a + b 且 2.0 = 1a + b」 => 「y = 1.5x + 0.5」-->
            <div class="stroke-icon">{{ (1.5 * speed + 0.5).toFixed(1) }}X</div>
            <template #content>
              <c-slider vertical v-model="speed" @change="handleSpeedChange" />
              <div class="col" style="justify-content: space-between">
                <span>2.0</span><span>1.5</span><span>1.0</span><span>0.5</span>
              </div>
            </template>
          </c-popover>

          <template v-if="viewer">
            <div class="stroke-icon">写真</div>
            <div class="stroke-icon">音质</div>
            <div class="stroke-icon">音效</div>
          </template>

          <template v-else>
            <c-icon name="heart" />
            <c-icon name="download" />
          </template>

          <c-popover class="col play-queue" placement="right">
            <c-icon name="playlist" />
            <template #content>
              <div class="row title">
                <span>播放队列</span>
              </div>

              <div class="row option-bar" style="--button-icon-size: 1.5em">
                <c-popover>
                  <c-button icon="plus">添加到</c-button>
                  <template #content>
                    <div class="dropdown-item separator first">我的收藏</div>
                    <div class="dropdown-item last">添加到新歌单</div>
                  </template>
                </c-popover>

                <c-button icon="trash" @click="deletePlayQueue">{{ multiple ? '删除' : '清空' }}</c-button>
                <!--<c-button icon="my-download">下载</c-button>-->
                <c-button icon="multiple" @click="multiple = !multiple"
                  >{{ multiple ? '退出批量操作' : '批量操作' }}
                </c-button>
              </div>

              <c-table
                :columns="columns"
                :data="playList"
                v-model:multiple="multiple"
                v-model:selections="selectSongs"
                @row-dblclick="playsFromQueue"
              >
                <template #title="{ item }">
                  <span class="cell-text">{{ item.title }}</span>
                  <c-icon class="vip-icon" name="vip" v-if="item.vip" />
                  <c-icon class="mv-icon" name="mv" v-if="item.vid" />
                </template>

                <template #singer="{ item: { singerName, singer: singers } }">
                  <span
                    class="link cell-text"
                    v-if="isArray(singers) && singers.length"
                    v-for="(singer, index) in singers"
                    :key="index"
                    :data-mid="singer.mid"
                    >{{ singer.name }}</span
                  >
                  <span class="link cell-text" v-else> {{ singerName }} </span>
                </template>
              </c-table>
            </template>
          </c-popover>
        </div>
      </div>
    </div>
  </teleport>

  <teleport to="body" v-if="viewer">
    <music-viewer :cover="media.cover" @close="closeViewer">
      <template #song>
        <div class="row data-media">
          <span class="link">{{ media.singer }}</span>
          <span v-if="media.hasLine">-</span>
          <span class="link">{{ media.title }}</span>
          <c-icon class="mv-icon link" name="mv" v-if="media.vid" />
        </div>
      </template>
    </music-viewer>
  </teleport>
</template>
