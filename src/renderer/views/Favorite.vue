<template>
  <div class="v-column">
    <div class="v-row option-flex">
      <button-base>播放全部</button-base>
      <button-base @click="handleClicked">批量操作</button-base>
      <text-field class="align-end" v-model="inputKey" placeholder="搜索本地歌曲"></text-field>
      <button-base class="align-end" @click="$refs.file_import.click()">导入歌曲</button-base>
      <button-base class="align-end">排序方式</button-base>
      <input type="file" style="display: none" ref="file_import" multiple accept="audio/*" @change="importData"/>
    </div>

    <table-view :columns="columns" :data="list" style="flex:1;overflow: hidden"/>
  </div>
</template>

<script>
export default {
  name: "Favorite",
  data: () => ({
    inputKey: "",
    multiple: false,
    visible: true,
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ],
    list: [],
  }),

  methods: {
    handleClicked() {
    },
    toIndex(index) {
      return ++index < 10 ? '0' + index : index;
    },
    /**
     * 表格行单元格双击时的回调方法
     */
    onCellClick(row) {
      if (!row.path) {
        return;
      }
      this.$player.playList.splice(0, this.$player.playList.length);
      this.$player.playList.push(...this.dataList)
      let player = this.$player;
      if (player.prepare(row)) {
        player.play();
      }
    },
    /**
     * 通过文件对象生成音乐信息
     * @param file 文件对象
     * @returns {Object} 音乐信息对象
     */
    parse(file) {
      let title = file.name;
      title = title.substring(0, title.lastIndexOf('.'))
      let index = title.indexOf('-');
      let singer = title.substring(0, index);
      title = title.substring(index + 1);
      let size = this.toFileSize(2, file.size);
      let path = URL.createObjectURL(file);
      return {title, album: title, singer, size, path};
    },
    /**
     * 导入音乐信息
     */
    importData(e) {
      let files = e.target.files;
      if (!files || files.length === 0) {
        return;
      }
      this.dataList.splice(0, this.dataList.length)
      for (let file of files) {
        this.dataList.push(this.parse(file));
      }
      this.$player.playList.splice(0, this.$player.playList.length);
      this.$player.playList.push(this.dataList);
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
        return size + "B";
      }
      let KB = 1048576;
      if (size < KB) {
        return (size / B).toFixed(2) + "KB"
      }
      let MB = 1073741824;
      if (size < MB) {
        return (size / KB).toFixed(2) + "MB";
      }
      // let GB = 1099511627776L;
      if (size < 1099511627776) {
        return (size / MB).toFixed(2) + "GB";
      }
      return "";
    }
  }
}
</script>