<template>
  <div class="v-column" style="height:100%;">
    <table-view :data="data" :columns="columns" style="flex:1;" @infinite-scroll='addData'/>
  </div>
</template>

<script>
import {reactive } from "vue";

export default {
  name: "TableViewDemo",

  setup() {
    const columns = reactive([
      { type: "index", width: 100 },
      { title: "姓名", property: "name" },
      { title: "年龄", property: "age" },
      { title: "性别", property: "sex" },
      { title: "专业", property: "major", width: 100 },
      { title: "班级", property: "class", width: 100 }
    ]);

    const data = reactive([]);

    for (let index = 0; index < 100; ++index) {
      data.push({
        name: "张三" + index,
        age: 0 ^ (Math.random() * 10 + 20),
        sex: "男",
        major: "软件工程",
        class: "16001"
      });
    }

    const addData= () => {
      console.info('添加数据');
    };

    return { columns, data , addData};
  }
};
</script>

<style scoped></style>
