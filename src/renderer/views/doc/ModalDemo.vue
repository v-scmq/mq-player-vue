<template>
  <div class='v-row'>
    <Button @click='modalVisible = true' text='打开模态框'/>
    <Button @click='showMessage' text='显示消息'/>
  </div>

  <modal width='80%' height='60%' v-model:visible='modalVisible'>
    <template v-slot:content>
      <div style='text-align: center'>模态框内容</div>
    </template>
  </modal>
</template>

<script lang='ts'>
import {ref} from 'vue';
import Message from '../../components/Message';

export default {
  name: 'ModalDemo',

  setup() {
    return {
      modalVisible: ref(false),

      showMessage(){
        // window.setTimeout(() => {
          Message.info('abcdefghijklmnoprstuvwxzy');
          // Message.info('zzzzzzzzzzzzzzzzzzzzzzzzz');
        // }, 3000);
      }
    }
  }
}
</script>

<style scoped>
  .v-row > .button:nth-child(n + 2){
    margin: 0 0 0 8px;
  }
</style>