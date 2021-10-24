<template>
  <div class='pagination v-row' ref='el'>
    <div>共{{ total }}页</div>

    <div class="item prev-button" @click="$emit('update:current', current > 1 ? current - 1 : 1)">❮</div>
    <div class="item page" v-for="(item, index) in pageButtonList" :key="index"
         :class="{active: item.active, hide:item.hide}" @click="$emit('update:current', item.value)">{{ item.value }}
    </div>
    <div class="item next-button" @click="$emit('update:current', current < total ? current + 1 : total)">❯</div>
  </div>
</template>

<script>
import {reactive, watchEffect, computed} from "vue";

export default {
  name: "Pagination",

  props: {
    // 每页数据量
    size: {type: Number, default: 30},
    // 当前页编号
    current: {type: Number, default: 1},
    // 数据总量
    dataCount: {type: Number, default: 1},
  },

  // change 和 用于更新双向绑定的当前页 事件
  emits: ['change', 'update:current'],

  setup(props) {
    // 总页数
    const total = computed(() => Math.ceil(props.dataCount / props.size));

    // 控制分页按钮展示
    const pageButtonList = reactive([
      {active: true, value: 1, hide: true},
      {active: false, value: 2, hide: true},
      {active: false, value: 3, hide: true},
      {active: false, value: 4, hide: true},
      {active: false, value: 5, hide: true}
    ]);

    watchEffect(() => {
      // 当前页、总页数
      const current = props.current, totalValue = total.value;

      // 左边起始页编号, 右边结束页编号
      let left = current - 2, right = current + 2;

      // 如果左边页编号小于1,使其为1,同时右边结束页编号同时增加
      while (left < 1) {
        ++left;
        ++right;
      }

      // 如果右边结束页编号超过总页数时,使其置为总页数
      right = Math.min(right, totalValue);

      // 如果从起始编号到结束编号没有5页,且左边页编号大于1,则左边页编号左移(逐减)
      while (left > 1 && right - left < 4) {
        --left;
      }

      let index = 0;

      for (; left <= right; left++, index++) {
        pageButtonList[index].hide = false;
        pageButtonList[index].value = left;
        pageButtonList[index].active = current === left;
      }

      // 总页数不超过5页时,多余部分不显示(不受布局容器约束,会自动不显示,且不占用有空间)
      for (; index < 5; index++) {
        pageButtonList[index].hide = true;
      }
    });

    return {pageButtonList, total};
  }
}
</script>

<style scoped>
.item {
  border: solid #ddd;
  border-width: 1px 1px 1px 0;
  padding: 0.5em 1em;
  text-align: center;
  box-sizing: border-box;
  background: white;
  min-width: 3em;
  color: #337ab7;
}

.item.prev-button {
  margin: 0 0 0 8px;
  border-width: 1px;
  border-radius: 4px 0 0 4px;
}

.item.next-button {
  border-radius: 0 4px 4px 0;
}

.item:hover {
  cursor: pointer;
  color: #23527c;
  background-color: #eee;
}

.item.active {
  color: white;
  cursor: default;
  pointer-events: none;
  background-color: #337ab7;
}

.item.hide {
  display: none;
}
</style>
