<template>
  <div class='pagination v-row' ref='el'>
    <div>共{{total}}页</div>

    <div class="item prev-button" @click="$emit('update:current', current > 1 ? current - 1 : 1)">❮</div>
    <div class="item page" v-for="(item, index) in items" :key="index"
         :class="{active: item.active, hide:item.hide}" @click="$emit('update:current', item.value)">{{item.value}}</div>
    <div class="item next-button" @click="$emit('update:current', current < total ? current + 1 : total)">❯</div>
  </div>
</template>

<script>
import {reactive, watchEffect, computed} from "vue";

export default {
  name: "Pagination",
  props: {
    size: {type:Number, default: 30},
    current: {type: Number, default: 1},
    dataCount: {type: Number, default: 1},
  },
  emits: ['change', 'update:current'],

  setup(props, context) {

    const items = reactive([
      {active:true , value:1, hide:true},
      {active:false, value:2, hide:true},
      {active:false, value:3, hide:true},
      {active:false, value:4, hide:true},
      {active:false, value:5, hide:true}
    ]);

    const total = computed(() => Math.ceil(props.dataCount / props.size));

    // const vc = getCurrentInstance();

    // onMounted(() => {
    // });

    // onBeforeUnmount(() => {

    // });

    watchEffect(() => {
      console.info('watchEffect-current-total', props.current);

       // 左边起始页编号, 右边结束页编号
        let left = props.current - 2, right = props.current + 2;

        // 如果左边页编号小于1,使其为1,同时右边结束页编号同时增加
        for (; left < 1; left++, right++) ;
        // 如果右边结束页编号超过总页数时,使其置为总页数
        if (right > total.value) {
            right = total.value;
        }

        // 如果从起始编号到结束编号没有5页,且左边页编号大于1,则左边页编号左移(逐减)
        for (; left > 1 && right - left < 4; left--) ;

        let index = 0;

        for (; left <= right; left++, index++) {
            items[index].hide = false;
            items[index].value = left;
            items[index].active = props.current === left ;
            // items[index].getStyleClass().set(0, current == left ? SELECTED_CLASS : STYLE_CLASS);
            // items[index].setText(Integer.toString(left));
        }
        // 总页数不超过5页时,多余部分不显示(不受布局容器约束,会自动不显示,且不占用有空间)
        for (; index < 5; index++) {
          items [index].hide = true;
            // buttons[index].setManaged(false);
            // buttons[index].setVisible(false);
        }
    });

    /** 当数据发生变化时 */
    // watch(props.list, () => nextTick(expandDefault));

    return {
      items, total,
    };
  }
}
</script>

<style scoped>
  .item{
    border: solid #ddd;
    border-width: 1px 1px 1px 0;
    padding: 0.5em 1em;
    text-align: center;
    box-sizing: border-box;
    background: white;
    min-width: 3em;
    color: #337ab7;
  }

  .item.prev-button{
    margin: 0 0 0 8px;
    border-width: 1px;
    border-radius:4px 0 0 4px;
  }

  .item.next-button{
    border-radius:0 4px 4px 0;
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

  .item.hide{display: none;}
</style>
