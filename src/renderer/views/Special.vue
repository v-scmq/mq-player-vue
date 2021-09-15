<template>
  <div class="v-row option-flex" style="margin:0 0 8px 0;">
    <button-base @click="multiple=!multiple">批量操作</button-base>

    <button-base class="align-end" @click="doAdd">添加数据</button-base>
    <button-base class="align-end" @click="doUpd">修改数据</button-base>
    <button-base class="align-end" @click="doDel">删除数据</button-base>
    <button-base class="align-end" @click="doAddAll">批量添加</button-base>
    <button-base class="align-end" @click="doDelAll">全部删除</button-base>
  </div>

  <table-view :columns="columns" :data="dataList" style="flex:1;overflow: hidden"/>
</template>

<script>
import {reactive, ref} from "vue";

export default {
  name: "Special",

  setup() {
    const visible = ref(true);
    const multiple = ref(false);
    const dataList = reactive([]);

    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', property: 'album'},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ]);

    return {
      visible, multiple, dataList, columns,

      doAdd() {
        dataList.push({
          title: '九张机' + dataList.length,
          singer: '叶炫清', album: '九张机', duration: '03:40', size: '8.4MB'
        })
      },
      doUpd() {
        dataList[0] = {
          title: '九张机' + ((Math.random() * 10) ^ 0),
          singer: '叶炫清', album: '九张机', duration: '03:40', size: '8.4MB'
        }
      },
      doDel() {
        if (dataList.length) {
          dataList.splice(dataList.length - 1, dataList.length);
        }
      },
      doAddAll() {
        let list = [];
        for (let index = 0; index < 8; ++index) {
          list.push({
            title: '九张机' + index,
            singer: '叶炫清', album: '九张机', duration: '03:40', size: '8.4MB'
          });
        }
        dataList.push(...list);
      },
      doDelAll() {
        dataList.splice(0, dataList.length);
      },

      /** 表格行单元格双击时的回调方法 */
      onCellClick(row) {
        console.info(row)
      }
    };
  }
}
</script>
<style scoped>
.v-row .button {
  margin: 0 4px;
}
</style>