<template>
  <div class="v-column">
    <div class="v-row option-flex">
      <el-button type="primary">播放全部</el-button>
      <el-button @click="multiple=!multiple">批量操作</el-button>
      <el-input class="align-end" v-model="inputKey" placeholder="搜索本地歌曲" suffix-icon="el-icon-search"></el-input>
      <el-button class="align-end" @click="$refs.file_import.click()">导入歌曲</el-button>
      <el-button class="align-end">排序方式</el-button>
      <input type="file" style="display: none" ref="file_import" multiple accept="audio/*" @change="importData"/>
    </div>

    <el-table :data="dataList" border stripe height="auto" highlight-current-row @row-dblclick="onCellClick">
      <el-table-column type="index" width="60" :index="toIndex" :label="dataList.length+''"/>
      <el-table-column prop="title" label="歌曲"></el-table-column>
      <el-table-column prop="singer.name" label="歌手"></el-table-column>
      <el-table-column prop="album" label="专辑"></el-table-column>
      <el-table-column prop="duration" label="时长" width="180"></el-table-column>
      <el-table-column prop="size" label="大小" width="180"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "Special",

  data: () => ({
    inputKey: "",
    visible: true,
    dataList: [],
    multiple: null
  }),

  created() {
    this.dataList.push({title: 'xxxx', singer: {name: '歌手名称', id: 1}, album: {name: '专辑名', id: 1}})
    this.dataList.push({title: 'xxxx', singer: null, album: {name: '专辑名', id: 1}})
    this.dataList.push({title: 'xxxx',   album: {name: '专辑名', id: 1}})
  },

  methods: {
    /**
     * @param index {number} 元素索引
     * @return {string} 列表序号字符串
     */
    toIndex(index) {
      return ++index < 10 ? `0${index}` : index;
    },

    /**
     * 表格行单元格双击时的回调方法
     */
    onCellClick(row) {
      if (!row.path) {
        return;
      }
      let player = this.$player, playList = player.playList;
      playList.splice(0, playList.length, ...this.dataList);
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
      console.info('files = ', files)
      this.dataList.splice(0, this.dataList.length)
      for (let file of files) {
        this.dataList.push(this.parse(file));
      }
      let playList = this.$player.playList;
      playList.splice(0, playList.length);
      playList.push(this.dataList);
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

<style scoped>
.el-input {
  width: unset;
  margin: 0 10px 0 auto;
}
</style>
