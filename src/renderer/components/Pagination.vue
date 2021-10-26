<template>
  <div class='pagination v-row' @click="onClick" style="justify-content:center;"
      v-show="!hideOnSinglePage || pageCount > 1">

    <!-- 上一页按钮 -->
    <div class="item prev-button" :class='{disabled: currentPage === 1}'>❮</div>
    <!-- 第一页 -->
    <div class="item page" v-if="pageCount > 0" :class="{active: currentPage === 1}">1</div>
    <!-- 前一个更多 -->
    <div class="item prev-more-button" v-if="showPrevMore"></div>

    <div class="item page" v-for="(item, index) in pagers" :key="index"
         :class="{active: currentPage === item}">{{ item }}
    </div>

    <!-- 后一个更多 -->
    <div class="item next-more-button" v-if="showNextMore"></div>
    <!-- 最后一页 -->
    <div class="item page" v-if="pageCount > 1" :class="{active: currentPage === pageCount}">{{ pageCount }}</div>
    <!-- 下一页按钮 -->
    <div class="item next-button" :class='{disabled: currentPage === pageCount}'>❯</div>
  </div>
</template>

<script>
import {computed} from "vue";

export default {
  name: "Pagination",

  props: {
    // 总条目数量
    total: Number,
    // 每页数据量
    pageSize: {type: Number, default: 30},
    // 当前页编号
    currentPage: {type: Number, default: 1},
    // 每页分页按钮数量
    pageButtonCount: {type: Number, default: 7},
    // 只有一页时是否隐藏
    hideOnSinglePage: {type: Boolean, default: true},
  },

  // change 和 用于更新双向绑定的当前页 事件
  emits: ['change', 'update:currentPage'],

  setup(props, {emit}) {
    // 总页数
    const pageCount = computed(() => Math.ceil(props.total / props.pageSize));

    // 以当前页为基准,向左边移动3个按钮位置,若在第一页的右边,那么需要显示...(前一个更多按钮)
    const showPrevMore = computed(() => props.currentPage - 3 > 1);

    // 以当前页为基准,向右边移动3个按钮位置,若在总页数的左边,那么需要显示...(后一个更多按钮)
    const showNextMore = computed(() => props.currentPage + 3 < pageCount.value);

    // 分页按钮数组(通过计算属性获得)
    const pagers = computed(() => {
      // 分页按钮数量、当前页
      const {pageButtonCount, currentPage} = props;

      // 分页按钮编号; 对于array中的任一元素x, x在区间 [ start , end ) 内
      const array = [];

      // 开始的页编号、结束的页编号
      let start, end;

      // 若显示上一个更多按钮
      if (showPrevMore.value) {

        // 若显示下一个更多按钮
        if(showNextMore.value) {
          //  若上一个更多按钮 和 下一个更多按钮都显示
          // 偏移量 = 分页按钮总数 / 2 - 1
          const offset = (pageButtonCount >> 1) - 1;
          // 开始页编号 = 当前页 - 偏移量
          start = currentPage - offset;
          // 结束页编号 = 当前页 + 偏移量
          end = currentPage + offset;

        } else {
          // 若不显示下一个更多按钮
          // 结束页编号 = 总页数; 开始页编号 = 总页数 - 分页按钮总数 + 2
          start = (end = pageCount.value) - pageButtonCount + 2;
        }

      } else {
        // 若不显示上一个更多按钮, 显示或不显示下一个更多按钮
        // 开始页编号 = 2
        start = 2;
        // 结束页编号 = 分页按钮总数 和 总页数 中最小的一个
        end = Math.min(pageButtonCount, pageCount.value);
      }

      for (; start < end; ++start) {
        array.push(start);
      }

      // 半页计数
      // const halfPagerCount = (pageButtonCount - 1) / 2;
      // 是否显示前一个更多按钮
      // let showPrevMore = false;
      // // 是否显示前一个更多按钮
      // let showNextMore = false;

      // 若 总页数 > 分页按钮数量
      // if (pageCountValue > pageButtonCount) {
      //   // 若 当前页 > (分页按钮数量 - 半页计数值)
      //   if (currentPage > pageButtonCount - halfPagerCount) {
      //     // 则前一个更多按钮显示
      //     showPrevMore = true;
      //   }
      //
      //   if (currentPage < pageCountValue - halfPagerCount) {
      //     showNextMore = true;
      //   }
      // }

      // if (showPrevMore && !showNextMore) {
      //   const startPage = pageCountValue - (pageButtonCount - 2)
      //   for (let i = startPage; i < pageCountValue; i++) {
      //     array.push(i)
      //   }
      // } else if (!showPrevMore && showNextMore) {
      //   for (let i = 2; i < pageButtonCount; i++) {
      //     array.push(i)
      //   }
      // } else if (showPrevMore && showNextMore) {
      //   const offset = Math.floor(pageButtonCount / 2) - 1
      //   for (let i = currentPage - offset; i <= currentPage + offset; i++) {
      //     array.push(i)
      //   }
      // } else {
      //   for (let i = 2; i < pageCountValue; i++) {
      //     array.push(i)
      //   }
      // }

      return array;
    });

    return {
      showPrevMore, showNextMore, pagers, pageCount,

      /**
       * @param event {MouseEvent} 鼠标点击事件
       *
       */
      onClick(event) {
        const element = event.target, classList = element.classList;
        if (classList.contains('pagination')) {
          return;
        }

        const currentPage = props.currentPage;
        const offset = props.pageButtonCount - 2;

        let newPage;

        if (classList.contains('prev-button')) {
          newPage = currentPage - 1;
        } else if (classList.contains('next-button')) {
          newPage = currentPage + 1;
        } else if (classList.contains('prev-more-button')) {
          newPage = currentPage - offset;
        } else if (classList.contains('next-more-button')) {
          newPage = currentPage + offset;
        } else {
          // newPage = Number(element.textContent);
          newPage = element.textContent - 0;
        }

        newPage = Math.min(Math.max(1, newPage), pageCount.value);
        if (newPage !== currentPage) {
          emit('update:currentPage', newPage);
          emit('change', newPage);
        }
      }
    };
  }
}
</script>

<style scoped>
.pagination .item {
  width: 2.5em;
  padding: 4px 0;
  border: solid #ddd;
  border-width: 1px 1px 1px 0;
  box-sizing: border-box;
  background: white;
  color: #337ab7;
  text-align: center;
}

.pagination .item.prev-button {
  border-width: 1px;
  border-radius: 4px 0 0 4px;
}

.pagination .item.next-button {
  border-radius: 0 4px 4px 0;
}

.pagination .item:hover {
  cursor: pointer;
  color: #23527c;
  background: #eee;
}

.pagination .item.active {
  color: white;
  cursor: default;
  pointer-events: none;
  background: #337ab7;
}

.pagination .item.disabled{
  opacity: 0.5;
  color: #777;
  cursor: not-allowed;
}

.pagination .item.prev-more-button::after, .pagination .item.next-more-button::after {
  content: '∙∙∙'; /* ••• */
}

.pagination .item.prev-more-button:hover::after {
  content: '❮❮';
}

.pagination .item.next-more-button:hover::after {
  content: '❯❯';
}
</style>
