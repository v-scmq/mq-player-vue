<template>
  <div class="v-row" style="margin: 0 0 12px 0;">
    <button-base text="播放全部" @click="playSelect">
      <svg width="1.5em" height="1.5em" viewBox="0 0 16 16">
        <path
            d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
      </svg>
    </button-base>

    <button-base text="批量操作" @click="onMultiple">
      <svg width="1.5em" height="1.5em" viewBox="0 0 16 16">
        <path v-if="multiple"
              d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
        <path v-else
              d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
      </svg>
    </button-base>

    <button-base text="增加列" @click="doAddColumn"/>
    <button-base text="删除列" @click="doDelColumn"/>
    <button-base text="修改列" @click="doUpdColumn"/>

    <text-field v-model="inputKey" placeholder="搜索本地歌曲" @input="handleMusicFilter"/>

    <button-base text='导入歌曲' @click="onImportButtonClicked">
      <svg width="1.5em" height="1.5em" viewBox="0 0 16 16">
        <path
            d="M11.798 8.271l-3.182 1.97c-.27.166-.616-.036-.616-.372V9.1s-2.571-.3-4 2.4c.571-4.8 3.143-4.8 4-4.8v-.769c0-.336.346-.538.616-.371l3.182 1.969c.27.166.27.576 0 .742z M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14h10.348a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm.694 2.09A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09l-.636 7a1 1 0 0 1-.996.91H2.826a1 1 0 0 1-.995-.91l-.637-7zM6.172 2a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.684.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
      </svg>
      <input type="file" style="display:none" ref="fileChooser" multiple accept="audio/*" @change="addMusic"/>
    </button-base>

    <button-base text="排序方式">
      <svg width="1.2em" height="1.2em" viewBox="0 0 16 16">
        <path
            d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/>
      </svg>
    </button-base>
  </div>

  <table-view :columns="columns" :data='list' style="flex:auto;" @row-dblclick="onCellClick">
    <!-- <template v-slot:singer="{item}">{{ item.singer }}</template>-->
  </table-view>
</template>

<script>
import {TimeUtil, FileUtil} from '../utils';
import {reactive, ref, getCurrentInstance, onBeforeUnmount} from "vue";

export default {
  name: "LocalMusic",

  setup() {
    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ]);

    /** @type {[{path, title, singer, album, duration, size , [property:string]}]} */
    const list = reactive([]);
    const multiple = ref(false);
    const inputKey = ref('');
    // 用于在indexDB中存储本地音乐信息的数据量(非响应式)
    let maxSize = 0;

    /**
     * 通过文件对象生成音乐信息
     * @param basePath 存储音频专辑
     * @param file {File}文件对象
     * @param meta {Object}音频元数据信息
     * @returns {Object} 音乐信息对象
     */
    const parse = (basePath, file, meta) => {
      let data = {
        path: file.path,
        title: meta.common.title,
        singer: meta.common.artist,
        singerList: meta.common.artists,
        year: meta.common.year,
        album: meta.common.album,
        cover: null,
        duration: TimeUtil.secondToTime(meta.format.duration),
        size: FileUtil.toFileSize(2, file.size),
        bitrate: meta.format.bitrate,
        sampleRate: meta.format.sampleRate
        // codec: meta.format.codec, // "MPEG 1 Layer 3"
        // codecProfile: meta.format.codecProfile,
        //container: meta.format.container,
        // lossless: false,
        // numberOfChannels: meta.format.numberOfChannels,
      };

      if (!data.title || !data.singer) {
        let info = FileUtil.getMediaInfo(file, true);
        data.title = info.title || '未知';
        data.singer = info.singer || '未知';
      }

      let fs = window.electron, name = data.album || file.name;
      let path = `${basePath}/${FileUtil.resolveFileName(name)}.jpg`;
      // 注意必须先检测存在才能判断是文件还是目录,否则抛出异常
      let exists = fs.exists(path), isDirectory;

      // 若文件路径不存在,或者是目录
      if (!exists || (isDirectory = fs.isDirectory(path))) {
        // 是目录则强制删除目录
        isDirectory ? fs.rmDir(path) : null;

        let buffer = meta.common.picture;
        buffer = buffer && buffer.length ? buffer[0].data : null;
        buffer ? fs.writeFile(data.cover = path, buffer) : null;

      } else {
        data.cover = path;
      }
      meta = meta.common = meta.format = fs = null;
      return data;
    };

    /**
     * @param item {Object} 数据库表单条记录
     * @return true:保留或false:放弃
     */
    const filter = item => {
      let value = inputKey.value;
      return (item.title && item.title.indexOf(value) >= 0) ||
          (item.album && item.album.indexOf(value) >= 0) ||
          (item.singer && item.singer.indexOf(value) >= 0);
    };

    const vc = getCurrentInstance();
    let propObj = vc.appContext.config.globalProperties;

    const playSelect = () => {
      propObj.$message({message: "播放所选音乐", showClose: true, type: 'success'});
    };

    /** 开始执行本地歌曲模糊搜索(使用事件防抖原理,避免频繁调用过滤逻辑) */
    const handleMusicFilter = () => {
      // 若计时器存在,清除计时器,取消上次行的任务
      clearTimeout(handleMusicFilter.$timer);

      // 若还未初始化过处理方法,则先初始化
      if (!handleMusicFilter.$method) {
        handleMusicFilter.$method = () => {
          let limited = maxSize > 1024;
          limited ? propObj.$spinner.open() : null;

          let db = propObj.$db, table = db.tables.localMusic.name;
          // 若输入了搜索关键词,则调用过滤,否则查询所有
          let promise = inputKey.value ? db.queryOfFilter(table, filter) : db.queryAll(table);
          promise.then(data => {
            inputKey.value ? (maxSize = data.length) : null;
            list.splice(0, list.length, ...data);
          });
          promise.finally(limited ? propObj.$spinner.close : null);
        }
      }
      // 开始计时,在指定时间后执行数据过滤
      handleMusicFilter.$timer = setTimeout(handleMusicFilter.$method, 500);
    };

    /**
     * 表格行单元格双击时的回调方法
     * @param row {Number} 行单元格索引
     */
    const onCellClick = row => {
      let item = list[row];
      if (!item.path) {
        return;
      }

      let player = propObj.$player, playList = player.playList;
      player.index = row;
      playList.splice(0, playList.length, ...list);
      if (player.prepare(item)) {
        player.play();
      }
    };

    /** 导入音乐信息 */
    const addMusic = async e => {
      let files = e.target.files;
      if (!files || files.length === 0) {
        return;
      }

      propObj.$spinner.open();
      let savedList = [];

      if (window.electron) {
        // 获取应用程序运行时进程所在的根路径
        let path = await window.electron.getAppPath();

        path = `${path}/picture/album`;
        if (!window.electron.exists(path)) {
          window.electron.mkDirs(path);
        }

        out: for (let file of files) {
          for (let item of list) {
            if (file.path === item.path) {
              continue out; // 若有相同的path则跳过
            }
          }

          let meta = await window.electron.parseFile(file.path);
          savedList.push(parse(path, file, meta));
        }

      } else {
        for (let file of files) {
          // 若是外部环境,只能使用URL类创建临时的文件访问地址
          savedList.push(FileUtil.getMediaInfo(file, false));
        }
      }

      if (savedList.length) {
        list.push(...savedList);
        await propObj.$db.insert(propObj.$db.tables.localMusic.name, savedList);
        maxSize += savedList.length;
      }

      propObj.$spinner.close();
    };

    onBeforeUnmount(propObj.$db.close);

    /************ 加载表格视图数据 START ************/
        // 获取数据库表名称
    let tableNamed = propObj.$db.tables.localMusic.name;

    propObj.$spinner.open();
    propObj.$db.open()
        .then(() => propObj.$db.queryAll(tableNamed))
        .then(data => maxSize = list.push(...data))
        .finally(propObj.$spinner.close);
    /************ 加载表格视图数据   END ************/

    return {
      columns, list, multiple, inputKey,
      playSelect, handleMusicFilter, onCellClick, addMusic,

      /** 开始或结束批量操作 */
      onMultiple: () => {
        let column = columns[0];
        column.type = column.type === 'index' ? 'checkbox' : 'index';
        multiple.value = !multiple.value
      },

      /** 导入歌曲按钮被点击时,弹出文件选择框 */
      onImportButtonClicked: () => {
        // 清除文件选择器(input元素)的值,解决重新选择不能回调change事件的问题
        vc.refs.fileChooser.value = null;
        vc.refs.fileChooser.click();
      },

      /********* 后期会删除的3个方法 **********/
      doAddColumn: () => columns.push({title: '采样率', property: 'sampleRate'}),
      doDelColumn: () => columns.splice(columns.length - 1),
      doUpdColumn: () => columns[1].property = columns[1].property === 'size' ? 'title' : 'size',
    };

  }
}
</script>

<style scoped>
.v-row > .button {
  margin: 0 4px;
}

.v-row > .text-field {
  margin: 0 10px 0 auto;
}
</style>
