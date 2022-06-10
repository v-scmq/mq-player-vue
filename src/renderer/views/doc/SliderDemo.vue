<template>
  <slider style="" v-model="value"></slider>

  <div class="v-row" style="height: 160px;width: 128px; gap: 40px;justify-content: center">
    <slider style="height:100%" vertical v-model="value"></slider>
    <slider style="height:100%" vertical v-model="value"></slider>
  </div>

  <div class="v-row" style="gap: 20px">
    <div class="v-column" style="height: 160px;width: 56px;align-items:center">
      <slider style="height:100%" vertical v-model="value"></slider>
      <span>{{ (value * 100).toFixed(0) }}%</span>
    </div>

    <div class="v-column" style="height: 160px;align-items: center">
      <div class="v-row" style="height: 160px;gap:8px;justify-content:center;align-items:stretch">
        <slider vertical v-model="value"></slider>
        <div class="v-column" style="justify-content:space-between">
          <span>2.0</span>
          <span>1.5</span>
          <span>1.0</span>
          <span>0.5</span>
        </div>
      </div>
      <span>{{ (1.5 * value + 0.5).toFixed(1) }}</span>
    </div>
  </div>
</template>

<script>
import {ref} from "vue";

export default {
  name: "PaginationDemo",

  setup() {
    return {
      value: ref(0.6),
    };
  }
}
</script>

<style scoped>

</style>