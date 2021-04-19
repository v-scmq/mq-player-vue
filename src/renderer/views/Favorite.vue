<template>
  <div class="v-column">
    <div class="v-row option-flex">
      <el-button type="primary">播放全部</el-button>
      <el-button @click="handleClicked">批量操作</el-button>
      <el-input class="align-end" v-model="inputKey" placeholder="搜索本地歌曲" suffix-icon="el-icon-search"></el-input>
      <el-button class="align-end" @click="$refs.file_import.click()">导入歌曲</el-button>
      <el-button class="align-end">排序方式</el-button>
      <input type="file" style="display: none" ref="file_import" multiple accept="audio/*" @change="importData"/>
    </div>

    <!--    <el-table :data="dataList" border stripe height="auto" highlight-current-row @row-dblclick="onCellClick">-->
    <!--      <el-table-column type="index" width="60" :index="toIndex" :label="dataList.length+''"></el-table-column>-->
    <!--      <el-table-column prop="title" label="歌曲"></el-table-column>-->
    <!--      <el-table-column prop="singer" label="歌手"></el-table-column>-->
    <!--      <el-table-column prop="album" label="专辑"></el-table-column>-->
    <!--      <el-table-column prop="duration" label="时长" width="180"></el-table-column>-->
    <!--      <el-table-column prop="size" label="大小" width="180"></el-table-column>-->
    <!--    </el-table>-->
    <div class="v-column" style="flex:1;overflow: hidden">
      <vxe-table
          border
          auto-resize
          height="auto"
          show-overflow
          highlight-hover-row
          ref="table"
          :sort-config="{trigger: 'cell'}"
          :data="dataList">
        <vxe-table-column type="checkbox" width="80" :visible="multiple"/>
        <vxe-table-column type="seq" width="80" :visible="!multiple" :title="`${dataList.length}`"/>
        <vxe-table-column field="title" title="歌曲" sortable/>
        <vxe-table-column field="singer" title="歌手"/>
        <vxe-table-column field="album" title="专辑"/>
        <vxe-table-column field="duration" title="时长" width="180"/>
        <vxe-table-column field="size" title="大小" width="180"/>
      </vxe-table>
    </div>
  </div>
</template>

<script>
export default {
  name: "Favorite",
  data: () => ({
    inputKey: "",
    dataList: [],
    multiple: false,
    visible: true,
  }),

  methods: {
    handleClicked() {
      this.multiple = !this.multiple;
      let table = this.$refs.table;
      this.$nextTick(() => table.refreshColumn())
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

<style scoped>

.el-input {
  width: unset;
  margin: 0 10px 0 auto;
}

.el-table {
  background: none;
  margin: 10px 0 0 0;
  width: calc(100% - 1px);
}

.el-table::before {
  display: none;
}
</style>
