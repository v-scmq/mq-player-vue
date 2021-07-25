<template>
  <div class="v-column">
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

      <text-field v-model="inputKey" placeholder="搜索本地歌曲" @keyup.native.enter="onEntered"/>

      <button-base text='导入歌曲' @click="onImportData">
        <svg width="1.5em" height="1.5em" viewBox="0 0 16 16">
          <path
              d="M11.798 8.271l-3.182 1.97c-.27.166-.616-.036-.616-.372V9.1s-2.571-.3-4 2.4c.571-4.8 3.143-4.8 4-4.8v-.769c0-.336.346-.538.616-.371l3.182 1.969c.27.166.27.576 0 .742z M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14h10.348a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm.694 2.09A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09l-.636 7a1 1 0 0 1-.996.91H2.826a1 1 0 0 1-.995-.91l-.637-7zM6.172 2a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.684.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
        </svg>
        <input type="file" style="display:none" ref="fileChooser" multiple accept="audio/*" @change="importData"/>
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
  </div>
</template>

<script>
export default {
  name: "LocalMusic",
  data: () => ({
    inputKey: "",
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ],
    list: [],

    multiple: false,
  }),

  created() {
    // 获取数据库表名称
    this._tableNamed = this.$db.tables.localMusic.name;
    this.$spinner.open();
    this.$db.open()
        .then(() => this.$db.queryAll(this._tableNamed))
        .then(data => this.list = data || this.list)
        .finally(this.$spinner.close);
  },

  beforeDestroy() {
    this.$db.close();
  },

  methods: {
    doAddColumn() {
      this.columns.push({
        title: '采样率',
        property: 'sampleRate'
      });
    },

    doDelColumn() {
      this.columns.splice(this.columns.length - 1);
    },

    doUpdColumn() {
      let column = this.columns[1];
      column.property = column.property === 'size' ? 'title' : 'size';
    },

    playSelect() {
      this.$message({message: "播放所选音乐", showClose: true, type: 'success'});
    },
    /**
     * 进入或退出批量操作
     */
    onMultiple() {
      this.multiple = !this.multiple;
      // TODO 删除所有列后,新增的列信息,以下修改并不会更新视图
      let column = this.columns[0];
      column.type = column.type === 'index' ? 'checkbox' : 'index';
    },

    /**
     *  开始执行本地歌曲模糊搜索
     */
    onEntered() {
      this.$spinner.open(this.$el);
      this.$db.queryOfFilter(this._tableNamed, this.onFilter).then(data => {
        this.list = data || this.list;
        this.$spinner.close();
      });
    },

    /**
     * @param value {Object}数据库表单条记录
     * @return true:保留或false:放弃
     */
    onFilter(value) {
      return (value.title && value.title.indexOf(this.inputKey) >= 0) ||
          (value.album && value.album.indexOf(this.inputKey) >= 0) ||
          (value.singer && value.singer.indexOf(this.inputKey) >= 0);
    },

    /**
     * 表格行单元格双击时的回调方法
     * @param row {Number} 行单元格索引
     */
    onCellClick(row) {
      let item = this.list[row];
      if (!item.path) {
        return;
      }

      let player = this.$player, playList = player.playList;
      player.index = row;
      playList.splice(0, playList.length, ...this.list);
      if (player.prepare(item)) {
        player.play();
      }
    },

    /**
     * 解决字符序列不能用于Windows操作系统平台的文件或文件夹名称. <br>
     * 对于Windows平台,文件或文件夹名称一定不能包含 “{@code / \ * ? " : | < >}”中的任一字符.
     *
     * @param name {String | Array | Object} 文件或文件夹名称
     * @return String 标准的文件或文件夹名称
     */
    resolveFileName(name) {
      if (!name) return name;

      let replace, values = [...name];
      for (let index = values.length - 1; index >= 0; --index) {
        let c = values[index] = name.charAt(index);
        if (c === '/' || c === '\\' || c === '*' || c === '?' || c === '"'
            || c === ':' || c === '|' || c === '<' || c === '>') {
          values[index] = '~';
          replace = true;
        }
      }
      return replace ? values.join('') : name;
    },

    /**
     * 通过文件对象生成音乐信息
     * @param path {String} 文件路径
     * @param file {File}文件对象
     * @param meta {Object}音频元数据信息
     * @returns {Object} 音乐信息对象
     */
    parse(path, file, meta) {
      if (!meta) {
        let title = file.name;
        title = title.substring(0, title.lastIndexOf('.'))
        let index = title.indexOf('-');
        let singer = title.substring(0, index);
        title = title.substring(index + 1);
        let size = this.toFileSize(2, file.size);
        return {title, album: title, singer, size, path: path};
      }

      let data = {
        path: path,
        title: meta.common.title,
        singer: meta.common.artist,
        singerList: meta.common.artists,
        year: meta.common.year,
        album: meta.common.album,
        cover: null,
        duration: this.$player.toTime(meta.format.duration),
        size: this.toFileSize(2, file.size),
        bitrate: meta.format.bitrate,
        sampleRate: meta.format.sampleRate
        // codec: meta.format.codec, // "MPEG 1 Layer 3"
        // codecProfile: meta.format.codecProfile,
        //container: meta.format.container,
        // lossless: false,
        // numberOfChannels: meta.format.numberOfChannels,
      };

      if (!this.$fs) {
        meta = meta.common = meta.format = null;
        return data;
      }

      path = 'E:/picture/album';
      if (!this.$fs.existsSync(path)) {
        this.$fs.mkdirSync(path);
      }

      path = `${path}/${this.resolveFileName(data.album || data.title)}.jpg`;
      // 注意必须先检测存在才能判断是文件还是目录,否则抛出异常
      let exists = this.$fs.existsSync(path);
      let isDirectory = exists && this.$fs.statSync(path).isDirectory();
      // 若文件路径不存在,或者是目录
      if (!exists || isDirectory) {
        // 是目录则强制删除目录
        isDirectory ? this.$fs.rmSync(path, {force: true}) : null;

        let buffer = meta.common.picture;
        buffer = buffer && buffer.length ? buffer[0].data : null;
        buffer ? this.$fs.writeFileSync(data.cover = path, buffer) : null;

      } else {
        data.cover = path;
      }
      meta = meta.common = meta.format = null;
      return data;
    },

    /**
     * 导入歌曲按钮被点击时,弹出文件选择框
     */
    onImportData() {
      // 清除文件选择器(input元素)的值,解决重新选择不能回调change事件的问题
      this.$refs.fileChooser.value = null;
      this.$refs.fileChooser.click();
    },

    /**
     * 导入音乐信息
     */
    async importData(e) {
      let files = e.target.files;
      if (!files || files.length === 0) {
        return;
      }

      this.$spinner.open(this.$el);
      let path, savedList = [], meta = null;
      out: for (let file of files) {
        // 若是外部环境,只能使用URL类创建临时的文件访问地址
        path = file.path || URL.createObjectURL(file);

        for (let item of this.list) {
          if (path === item.path) {
            continue out; // 若有相同的path则跳过
          }
        }

        if (this.$metadata) {
          // try {
            meta = await this.$metadata.parseFile(path);
          // } catch (error) {
          //   console.info('file=>', file, ' error=>', error.message);
          //   meta = null;
          // }
        }
        savedList.push(this.parse(path, file, meta));
      }

      if (savedList.length) {
        this.list.push(...savedList);
        await this.$db.insert(this._tableNamed, savedList);
      }
      this.$spinner.close();
    },

    /**
     * 文件大小格式化
     *
     * @param scale 精度
     * @param size 文件字节大小
     * @return {string}返回格式化后的文件大小的字符串表示
     */
    // 注意这里的除法运算必须有一个是浮点数,否则计算精度相差较大(这里将size参数用double类型接收)
    toFileSize(scale, size) {
      let B = 1024;
      if (size < B) {
        return `${size}B`;
      }
      let KB = 1048576;
      if (size < KB) {
        return `${(size / B).toFixed(2)}KB`;
      }
      let MB = 1073741824;
      if (size < MB) {
        return `${(size / KB).toFixed(2)}MB`;
      }
      // let GB = 1099511627776L;
      if (size < 1099511627776) {
        return `${(size / MB).toFixed(2)}GB`;
      }
      return "";
    }
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
