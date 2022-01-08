<template>
  <div class='v-row' style='margin:0 8px 12px 0; gap:8px; flex-wrap:wrap;'>
    <Button text='播放全部' @click='playSelect' prefixIcon='play-select' prefixIconSize='1.5em'/>
    <Button text='批量操作' @click='onMultiple' prefixIconSize='1.5em'
            :prefixIcon='multiple ? "exit-multiple" : "multiple" '/>
    <Button text='增加列' @click='doAddColumn'/>
    <Button text='删除列' @click='doDelColumn'/>
    <Button text='修改列' @click='doUpdColumn'/>

    <text-field v-model='inputKey' placeholder='搜索本地歌曲' @input='handleMusicFilter' style='margin:0 0 0 auto'/>

    <Button text='导入歌曲' @click='onImportButtonClicked' prefixIcon='import' prefixIconSize='1.5em'/>
    <input type='file' style='display:none' ref='fileChooser' multiple accept='audio/*' @change='addMusic'/>
    <Button text='排序方式' prefixIcon='sort' prefixIconSize='1.2em'/>
  </div>

  <table-view :columns='columns' :data='list' style='flex:auto;' @row-dblclick='onCellClick'/>
</template>

<script lang='ts'>
import db from '../database';
import player from '../player';
import Message from '../components/Message';
import Spinner from '../components/Spinner';

import {reactive, ref, onBeforeUnmount, defineComponent} from 'vue';
import {getFileURL, secondToString, resolveFileName, getMediaInfo, toFileSize} from '../../utils';
import {TableColumn} from '../components/types';
import {Song} from '../../types';

export default defineComponent({
  name: 'LocalMusic',

  setup() {
    const inputKey = ref('');
    const multiple = ref(false);
    const list = reactive<Song[]>([]);

    const columns = reactive<TableColumn[]>([
      {type: 'index', width: '100px'},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: '100px'},
      {title: '大小', property: 'size', width: '100px'}
    ]);

    const fileChooser = ref(null as unknown as HTMLInputElement);

    // 用于在indexDB中存储本地音乐信息的数据量(非响应式)
    let maxSize = 0;

    /**
     * 通过文件对象生成音乐信息
     *
     * @param basePath 存储音频专辑封面图的根路径
     * @param file 文件对象
     * @param meta 音频元数据信息
     * @returns {Song} 音乐信息对象
     */
    const parse = (basePath: string, file: File, meta: any) => {
      let data: Song = {
        path: getFileURL(file.path),
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
      } as any;

      if (!data.title || !data.singer) {
        let info = getMediaInfo(file, true);
        data.title = info.title || '未知';
        data.singer = info.singer || '未知';
      }

      const {electron: electronApi} = window as any;

      const name = data.album as string || file.name;
      const path = `${basePath}/${resolveFileName(name)}`;
      // 注意必须先检测存在才能判断是文件还是目录,否则抛出异常
      let exists = electronApi.exists(path), isDirectory;

      // 若文件路径不存在,或者是目录
      if (!exists || (isDirectory = electronApi.isDirectory(path))) {
        // 是目录则强制删除目录
        isDirectory && electronApi.rmDir(path);

        let buffer = meta.common.picture;
        if ((buffer = buffer && buffer.length ? buffer[0].data : null)) {
          electronApi.writeFile(path, buffer);
          (data as any).cover = getFileURL(path);
        }

      } else {
        // 替换路径为本地服务器地址
        (data as any).cover = getFileURL(path);
      }
      meta = meta.common = meta.format = null;
      return data;
    };

    /**
     * @param item 数据库表单条记录
     * @return {boolean} true:保留或false:放弃
     */
    const filter = (item: { [key: string]: any }) => {
      const value = inputKey.value, {title = '', album = '', singer = ''} = item;
      return title.includes(value) || album.includes(value) || singer.includes(value);
    };

    const playSelect = () => Message({message: '播放所选音乐', showClose: true, type: 'success'});

    /** 开始执行本地歌曲模糊搜索(使用事件防抖原理,避免频繁调用过滤逻辑) */
    const handleMusicFilter: any = () => {
      // 若计时器存在,清除计时器,取消上次行的任务
      clearTimeout(handleMusicFilter.$timer);

      // 若还未初始化过处理方法,则先初始化
      if (!handleMusicFilter.$method) {
        handleMusicFilter.$method = () => {
          const limited = maxSize > 1024;
          limited && Spinner.open();

          const table = db.tables.localMusic.name;
          // 若输入了搜索关键词,则调用过滤,否则查询所有
          const promise = inputKey.value ? db.queryOfFilter(table, filter) : db.queryAll(table);

          promise.then(data => {
            inputKey.value && (maxSize = data.length);
            list.splice(0, list.length, ...data);
          });
          promise.finally(limited ? Spinner.close : null);
        }
      }
      // 开始计时,在指定时间后执行数据过滤
      handleMusicFilter.$timer = setTimeout(handleMusicFilter.$method, 500);
    };

    /**
     * 表格行单元格双击时的回调方法
     *
     * @param rowIndex 行单元格索引
     */
    const onCellClick = (rowIndex: number) => {
      player.playMediaList(list, rowIndex);
    };

    /** 导入音乐信息 */
    const addMusic = async (event: Event) => {
      let files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        return;
      }

      Spinner.open();
      let savedList: Song[] = [];

      const {electron: electronApi} = window as any;

      if (electronApi) {
        // 获取应用程序运行时进程所在的根路径
        let path = await electronApi.getAppPath();

        path = `${path}/picture/album`;
        if (!electronApi.exists(path)) {
          electronApi.mkDirs(path);
        }

        out: for (let file of files) {
          for (let item of list) {
            if (file.path === item.path) {
              continue out; // 若有相同的path则跳过
            }
          }

          let meta = await electronApi.parseFile(file.path);
          savedList.push(parse(path, file, meta));
        }

      } else {
        for (let file of files) {
          // 若是外部环境,只能使用URL类创建临时的文件访问地址
          savedList.push(getMediaInfo(file, false) as Song);
        }
      }

      if (savedList.length) {
        list.push(...savedList);
        await db.insert(db.tables.localMusic.name, savedList);
        maxSize += savedList.length;
      }

      Spinner.close();
    };

    onBeforeUnmount(() => db.close());

    /************ 加载表格视图数据 START ************/
        // 获取数据库表名称
    let tableNamed = db.tables.localMusic.name;

    Spinner.open();
    db.open()
        .then(() => db.queryAll(tableNamed))
        .then(data => maxSize = list.push(...data))
        .finally(Spinner.close);
    /************ 加载表格视图数据   END ************/

    return {
      columns, list, multiple, inputKey, fileChooser,
      playSelect, handleMusicFilter, onCellClick, addMusic,

      /** 开始或结束批量操作 */
      onMultiple: () => {
        let column = columns[0];
        column.type = column.type === 'index' ? 'checkbox' : 'index';
        multiple.value = !multiple.value
      },

      /** 导入歌曲按钮被点击时,弹出文件选择框 */
      onImportButtonClicked: () => {
        const inputElement = fileChooser.value;
        // 清除文件选择器(input元素)的值,解决重新选择不能回调change事件的问题
        inputElement.value = null as any;
        inputElement.click();
      },

      /********* 后期会删除的3个方法 **********/
      doAddColumn: () => columns.push({title: '采样率', property: 'sampleRate'}),
      doDelColumn: () => columns.splice(columns.length - 1),
      doUpdColumn: () => columns[1].property = columns[1].property === 'size' ? 'title' : 'size',
    };

  }

});
</script>