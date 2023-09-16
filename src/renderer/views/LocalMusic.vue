<template>
  <div class="v-row" style="margin: 0 8px 12px 0; gap: 8px; flex-wrap: wrap; --button-icon-size: 1.5em">
    <hl-button icon="play-select" @click="playSelect">播放全部</hl-button>

    <popover closeable>
      <hl-button icon="plus">添加到</hl-button>

      <template v-slot:content>
        <div class="dropdown-item separator first">我的收藏</div>
        <div class="dropdown-item last">添加到新歌单</div>
        <div class="dropdown-item separator first">我的收藏</div>
        <div class="dropdown-item last">添加到新歌单</div>
        <div class="dropdown-item separator first">我的收藏</div>
        <div class="dropdown-item last">添加到新歌单</div>
        <div class="dropdown-item separator first">我的收藏</div>
        <div class="dropdown-item last">添加到新歌单</div>
        <div class="dropdown-item separator first">我的收藏</div>
        <div class="dropdown-item last">添加到新歌单</div>
        <div class="dropdown-item separator first">我的收藏</div>
        <div class="dropdown-item last">添加到新歌单</div>
      </template>
    </popover>

    <hl-button icon="my-download">下载</hl-button>
    <hl-button icon="trash" icon-size="1.5em">删除</hl-button>
    <hl-button icon="multiple" @click="multiple = !multiple">{{ multiple ? '退出批量操作' : '批量操作' }}</hl-button>

    <text-field v-model="inputKey" placeholder="搜索本地歌曲" @input="handleMusicFilter" style="margin: 0 0 0 auto" />

    <hl-button icon="import" @click="onImportButtonClicked">导入歌曲</hl-button>
    <input type="file" style="display: none" ref="fileChooser" multiple accept="audio/*" @change="addMusic" />
    <hl-button icon="sort" style="--button-icon-size: 1.2em">排序方式</hl-button>
  </div>

  <table-view style="flex: auto" :columns="columns" :data="list" :selection="multiple" @row-dblclick="playMediaList" />
</template>

<script lang="ts">
import { db, tables } from '@/database'
import { Message } from '@/components/Message'
import Spinner from '@/components/Spinner'
import { playMediaList } from '@/player/hooks'

import { defineComponent, onBeforeUnmount, reactive, ref } from 'vue'
import { getMediaInfo, resolveFileName, secondToString, toFileSize } from '@/utils'
import { TableColumn } from '@/components/types'
import { Song } from '@/types'

export default defineComponent({
  name: 'LocalMusic',

  setup() {
    const inputKey = ref('');
    const multiple = ref(false);
    const list = reactive([] as Song[]);

    const columns: TableColumn[] = [
      { type: 'index', width: '100px' },
      { title: '歌曲', property: 'title' },
      { title: '歌手', property: 'singer' },
      { title: '专辑', property: 'album' },
      { title: '时长', property: 'duration', width: '100px' },
      { title: '大小', property: 'size', width: '100px' }
    ];

    const fileChooser = ref(null as unknown as HTMLInputElement);

    // 用于在indexDB中存储本地音乐信息的数据量(非响应式)
    let maxSize = 0;

    /**
     * 通过文件对象生成音乐信息
     *
     * @param basePath 存储音频专辑封面图的根路径
     * @param file 文件对象
     * @param meta 音频元数据信息
     */
    const parse = (basePath: string, file: File, meta: any) => {
      const data = {
        path: import.meta.env.DEV
          ? `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${
              import.meta.env.VITE_SERVER_FILE
            }/${file.path}`
          : `/${import.meta.env.VITE_SERVER_FILE}/${file.path}`,
        title: meta.common.title,
        singer: meta.common.artist,
        // singerList: meta.common.artists,
        year: meta.common.year,
        album: meta.common.album,
        cover: '',
        duration: secondToString(meta.format.duration),
        size: toFileSize(2, file.size),
        bitrate: meta.format.bitrate,
        sampleRate: meta.format.sampleRate
        // codec: meta.format.codec, // 'MPEG 1 Layer 3'
        // codecProfile: meta.format.codecProfile,
        // container: meta.format.container,
        // lossless: false,
        // numberOfChannels: meta.format.numberOfChannels,
      } as Song;

      if (!data.title || !data.singer) {
        let info = getMediaInfo(file, true);
        data.title = info.title || '未知';
        data.singer = info.singer || '未知';
      }

      const { electron: electronApi } = window as any;

      const name = (data.album as string) || file.name;
      const path = `${basePath}/${resolveFileName(name)}`;
      // 注意必须先检测存在才能判断是文件还是目录,否则抛出异常
      const exists = electronApi.exists(path);
      let isDirectory, cover;

      // 若文件路径不存在,或者是目录
      if (!exists || (isDirectory = electronApi.isDirectory(path))) {
        // 是目录则强制删除目录
        isDirectory && electronApi.rmDir(path);

        let buffer = meta.common.picture;

        if ((buffer = buffer && buffer.length ? buffer[0].data : null)) {
          electronApi.writeFile(path, buffer);
          cover = path;
        }
      } else {
        // 替换路径为本地服务器地址
        cover = path;
      }

      meta = meta.common = meta.format = null;

      if (cover) {
        data.cover = import.meta.env.DEV
          ? `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${
              import.meta.env.VITE_SERVER_FILE
            }/${cover}`
          : `/${import.meta.env.VITE_SERVER_FILE}/${cover}`;
      }

      return data;
    };

    /**
     * @param item 数据库表单条记录
     */
    const filter = (item: { [key: string]: any }) => {
      const value = inputKey.value,
        { title = '', album = '', singer = '' } = item;
      return title.includes(value) || album.includes(value) || singer.includes(value);
    };

    const playSelect = () => Message({ message: '播放所选音乐', showClose: true, type: 'success' });

    /** 开始执行本地歌曲模糊搜索(使用事件防抖原理,避免频繁调用过滤逻辑) */
    const handleMusicFilter: any = () => {
      // 若计时器存在,清除计时器,取消上次行的任务
      clearTimeout(handleMusicFilter.$timer);

      // 若还未初始化过处理方法,则先初始化
      if (!handleMusicFilter.$method) {
        handleMusicFilter.$method = () => {
          const limited = maxSize > 1024;
          limited && Spinner.open();

          const table = tables.localMusic;
          // 若输入了搜索关键词,则调用过滤,否则查询所有
          const promise = inputKey.value ? db.queryOfFilter(table, filter) : db.queryAll(table);

          promise.then(data => {
            inputKey.value && (maxSize = data.length);
            list.splice(0, list.length, ...data);
          });
          promise.finally(limited ? Spinner.close : null);
        };
      }
      // 开始计时,在指定时间后执行数据过滤
      handleMusicFilter.$timer = setTimeout(handleMusicFilter.$method, 500);
    };

    /** 导入音乐信息 */
    const addMusic = async (event: Event) => {
      const files = (event.target as HTMLInputElement).files as null | File[];

      if (!files || files.length === 0) {
        return;
      }

      Spinner.open();
      let savedList: Song[] = [];

      const { electron: electronApi } = window as any;

      // 获取应用程序运行时进程所在的根路径
      let path = await electronApi.getStorePath();

      path = `${path}/picture/album`;
      if (!electronApi.exists(path)) {
        electronApi.mkDirs(path);
      }

      const map: { [key: string]: true } = {};

      for (const item of list) {
        map[item.path || ''] = true;
      }

      for (let file of files) {
        if (!map[file.path]) {
          const meta = await electronApi.parseFile(file);
          // TODO 解析音频文件失败时,将无法添加
          meta && savedList.push(parse(path, file, meta));
        }
      }

      if (savedList.length) {
        list.push(...savedList);
        await db.insert(tables.localMusic, savedList);
        maxSize += savedList.length;
      }

      Spinner.close();
    };

    onBeforeUnmount(() => db.close());

    /************ 加载表格视图数据 START ************/
    Spinner.open();
    db.open()
      .then(() => db.queryAll(tables.localMusic))
      .then(data => (maxSize = list.push(...data)))
      .finally(Spinner.close);
    /************ 加载表格视图数据   END ************/

    return {
      columns,
      list,
      multiple,
      inputKey,
      fileChooser,
      playSelect,
      handleMusicFilter,
      playMediaList,
      addMusic,

      /** 导入歌曲按钮被点击时,弹出文件选择框 */
      onImportButtonClicked: () => {
        const inputElement = fileChooser.value;
        // 清除文件选择器(input元素)的值,解决重新选择不能回调change事件的问题
        inputElement.value = null as any;
        inputElement.click();
      }
    };
  }
});
</script>
