<template>
  <div class='v-row'>
    <hl-button @click='modalVisible = true'>打开模态框</hl-button>
  </div>

  <modal width='80%' height='60%' v-model:visible='modalVisible'>
    <div style='text-align: center'>模态框内容</div>
  </modal>
</template>

<script lang='ts'>
import {ref} from 'vue';

export default {
  name: 'ModalDemo',

  setup() {
    return {
      modalVisible: ref(false),
    }
  }
}
</script>