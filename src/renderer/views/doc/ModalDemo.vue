<template>
  <div class="v-row">
    <button-base @click="$refs.modal.open()">打开模态框</button-base>
  </div>
  <modal width="800px" height="600px" ref="modal">
    <template v-slot:content>
      <div style="text-align: center">模态框内容</div>
    </template>
  </modal>
</template>

<script>
export default {
  name: "ModalDemo"
}
</script>

<style scoped>

</style>