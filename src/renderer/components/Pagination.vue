<template>
  <div class='pagination' @click='handleClick' v-show='!hideOnSinglePage || pageCount > 1'>

    <!-- 上一页按钮 -->
    <div class='item prev-button' :class='{disabled: currentPage === 1}'>❮</div>
    <!-- 第一页 -->
    <div class='item page' v-if='pageCount > 0' :class='{active: currentPage === 1}'>1</div>
    <!-- 前一个更多 -->
    <div class='item more prev-more-button' v-if='showPrevMore' style='width:2.2em'></div>

    <div class='item page' v-for='pager of pagers' :key='pager'
         :class='{active: currentPage === pager}'>{{ pager }}
    </div>

    <!-- 后一个更多 -->
    <div class='item more next-more-button' v-if='showNextMore' style='width:2.2em'></div>
    <!-- 最后一页 -->
    <div class='item page' v-if='pageCount > 1' :class='{active: currentPage === pageCount}'>{{ pageCount }}</div>
    <!-- 下一页按钮 -->
    <div class='item next-button' :class='{disabled: currentPage === pageCount}'>❯</div>
  </div>
</template>

<script>
import {computed} from 'vue';

export default {
  name: 'Pagination',

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

  setup(props, {attrs, emit}) {
    // 总页数
    const pageCount = computed(() => Math.ceil(props.total / props.pageSize));

    // 以当前页为基准,向左边移动{pageButtonCount / 2}个按钮位置,若在第一页的右边,那么需要显示...(前一个更多按钮)
    const showPrevMore = computed(() => pageCount.value > props.pageButtonCount
        && props.currentPage - (props.pageButtonCount >> 1) > 1);

    // 以当前页为基准,向右边移动{pageButtonCount / 2}个按钮位置,若在总页数的左边,那么需要显示...(后一个更多按钮)
    const showNextMore = computed(() => pageCount.value > props.pageButtonCount
        && props.currentPage + (props.pageButtonCount >> 1) < pageCount.value);

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
        if (showNextMore.value) {
          //  若上一个更多按钮 和 下一个更多按钮都显示
          // 偏移量 = 分页按钮总数 / 2 - 1
          const offset = (pageButtonCount >> 1) - 1;
          // 开始页编号 = 当前页 - 偏移量
          start = currentPage - offset;
          // 结束页编号 = 当前页 + 偏移量 + 1 (当前页也占用1个位置)
          end = currentPage + offset + 1;

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

      return array;
    });

    return {
      showPrevMore, showNextMore, pagers, pageCount,

      /**
       * 处理分页按钮点击事件
       *
       * @param {MouseEvent} event 鼠标点击事件
       */
      handleClick(event) {
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
          newPage = element.textContent - 0;
        }

        newPage = Math.min(Math.max(1, newPage), pageCount.value);
        if (newPage !== currentPage) {
          emit('update:currentPage', newPage);
          attrs.onChange ? emit('change', newPage) : null;
        }
      }
    };
  }
}
</script>