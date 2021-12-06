<template>
  <table-view :data='data' :columns='columns' style='flex:1;' @infinite-scroll='addData'/>
</template>

<script lang='ts'>
import {TableColumn} from '../../components/types';
import {reactive, defineComponent} from 'vue';

export default defineComponent({
  name: 'TableViewDemo',

  setup() {
    const columns = reactive<TableColumn[]>([
      {type: 'index', width: '100px'},
      {title: '日期', property: 'date'},
      {title: '名称', property: 'name'},
      {title: '状态', property: 'state', width: '100px'},
      {title: '城市', property: 'city', width: '100px'},
      {title: '地址', property: 'address'},
      {title: '邮编', property: 'zip', width: '100px'}
    ]);

    const data = reactive([
      {
          date: '2021-11-01',
          name: 'Tom',
          state: 'California',
          city: 'Los Angeles',
          address: 'No. 189, Grove St, Los Angeles',
          zip: 'CA 90036',
      },
      {
          date: '2021-11-05',
          name: 'Tony',
          state: 'California',
          city: 'Los Angeles',
          address: 'No. 189, Grove St, Los Angeles',
          zip: 'CA 90038',
      },
      {
          date: '2021-11-10',
          name: 'Jack',
          state: 'California',
          city: 'Los Angeles',
          address: 'No. 189, Grove St, Los Angeles',
          zip: 'CA 90030',
      }
    ]);

    const addData = () => {
      for (let index = 0; index < 100; ++index) {
        data.push(data[index % 3]);
      }
    };

    // 最大支持 1 << 20 = 1048576

    addData();

    return {columns, data, addData};
  }

});
</script>