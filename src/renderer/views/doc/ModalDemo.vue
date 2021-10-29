<template>
  <div class="v-row">
    <Button @click="$refs.modal.open()" text='打开模态框'/>
  </div>
  <modal width="80%" height="60%" ref="modal">
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