<template>
  <div class='pagination v-row' ref='el' @click="onClick">

    <!-- 上一页按钮 -->
    <div class="item prev-button">❮</div>

    <!-- 第一页 -->
    <div class="item page" v-if="pageCount > 0" :class="{active: currentPage === 1}">1</div>
    <!-- 前一个更多 -->
    <div class="item prev-more-button" v-if="showPrevMore"></div>

    <div class="item page" v-for="(item, index) in pagers" :key="index"
          :class="{active: currentPage === item}">
        {{ item }}
    </div>

    <!-- 后一个更多 -->
    <div class="item next-more-button" v-if="showNextMore"></div>
    <!-- 最后一页 -->
    <div class="item page" v-if="pageCount > 1" :class="{active: currentPage === pageCount}">{{pageCount}}</div>

    <!-- 下一页按钮 -->
    <div class="item next-button">❯</div>
  </div>
</template>

<script>
import {ref, watchEffect, computed} from "vue";

export default {
  name: "Pagination",

  props: {
    // 每页数据量
    pageSize: {type: Number, default: 30},
    // 当前页编号
    currentPage: {type: Number, default: 1},
    // 数据总量
    total: Number,
    // 每页分页按钮数量
    pageButtonCount: {type: Number, default: 7}
  },

  // change 和 用于更新双向绑定的当前页 事件
  emits: ['change', 'update:currentPage'],

  setup(props, {emit}) {
    // 总页数
    const pageCount = computed(() => Math.ceil(props.total / props.pageSize));

    // 控制显示前一个更多分页按钮
    const showPrevMore = ref(false);
    // 控制显示后一个更多分页按钮
    const showNextMore = ref(false);

    // 分页按钮数组(通过计算属性获得)
    const pagers = computed(() => {
      // 分页按钮数量、当前页
      const {pageButtonCount, currentPage} = props;
      // 总页数
      const pageCountValue = pageCount.value;
      // 半页计数
      const halfPagerCount = (pageButtonCount - 1) / 2;
      // 分页按钮编号
      const array = [];

      // 是否显示前一个更多按钮
      let showPrevMore = false;
      // 是否显示前一个更多按钮
      let showNextMore = false;

      // 若 总页数 > 分页按钮数量
      if (pageCountValue > pageButtonCount) {
        // 若 当前页 > (分页按钮数量 - 半页计数值)
        if (currentPage > pageButtonCount - halfPagerCount) {
          // 则前一个更多按钮显示
          showPrevMore = true;
        }

        if (currentPage < pageCountValue - halfPagerCount) {
          showNextMore = true;
        }
      }

      if (showPrevMore && !showNextMore) {
        const startPage = pageCountValue - (pageButtonCount - 2)
        for (let i = startPage; i < pageCountValue; i++) {
          array.push(i)
        }
      } else if (!showPrevMore && showNextMore) {
        for (let i = 2; i < pageButtonCount; i++) {
          array.push(i)
        }
      } else if (showPrevMore && showNextMore) {
        const offset = Math.floor(pageButtonCount / 2) - 1
        for (let i = currentPage - offset; i <= currentPage + offset; i++) {
          array.push(i)
        }
      } else {
        for (let i = 2; i < pageCountValue; i++) {
          array.push(i)
        }
      }

      return array;
    });

    watchEffect(() => {
      const halfPagerCount = (props.pageButtonCount - 1) / 2;

      showPrevMore.value = false;
      showNextMore.value = false;

      if (pageCount.value > props.pageButtonCount) {
        if (props.currentPage > props.pageButtonCount - halfPagerCount) {
          showPrevMore.value = true
        }
        if (props.currentPage <  pageCount.value - halfPagerCount) {
          showNextMore.value = true
        }
      }
    });

    return {
      showPrevMore, showNextMore, pagers, pageCount,

      /**
       * @param event {MouseEvent} 鼠标点击事件
       *
       */
      onClick(event){
        const element = event.target, classList = element.classList;
        if(classList.contains('pagination')) {
          return;
        }

        const currentPage = props.currentPage;
        const offset = props.pageButtonCount - 2;

        let newPage;

        if(classList.contains('prev-button')) {
          newPage =currentPage - 1;
        } else if(classList.contains('next-button')) {
          newPage = currentPage + 1;
        } else if(classList.contains('prev-more-button')) {
          newPage = currentPage - offset;
        } else if(classList.contains('next-more-button')) {
          newPage = currentPage + offset;
        }

        else {
          // newPage = Number(element.textContent);
          newPage = element.textContent - 0;
        }

        newPage = Math.min(Math.max(1, newPage), pageCount.value);
        console.info('newPage => ', newPage);
        if(newPage !== currentPage){
          emit('update:currentPage', newPage);
        }
      }
    };
  }
}
</script>

<style scoped>
.pagination .item {
  width: 3em;
  padding: 8px 0;
  border: solid #ddd;
  border-width: 1px 1px 1px 0;
  box-sizing: border-box;
  background: white;
  color: #337ab7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination .item.prev-button {
  margin: 0 0 0 8px;
  border-width: 1px;
  border-radius: 4px 0 0 4px;
}

.pagination .item.next-button {
  border-radius: 0 4px 4px 0;
}

.pagination .item:hover {
  cursor: pointer;
  color: #23527c;
  background-color: #eee;
}

.pagination .item.active {
  color: white;
  cursor: default;
  pointer-events: none;
  background-color: #337ab7;
}

.pagination .item.prev-more-button::after, .pagination .item.next-more-button::after{
  content: '∙∙∙'; /* ••• */
}

.pagination .item.prev-more-button:hover::after{ content:'❮❮';}
.pagination .item.next-more-button:hover::after{ content:'❯❯';}

</style>
