<template>
  <div class='lyric-view' :ref='element => void (elements[-1] = element)' @pointerdown='onDragStart'>
    <div class='content-wrapper' :style='{transform: translate}'>

      <div class='lyric-item' v-for='(line, index) in list' :key='index'
           :ref='element => void (elements[index] = element)'
           :class='{active: selectedIndex === index}'>
        {{ line.content }}
      </div>

    </div>
  </div>
</template>

<script lang='ts'>
import {ref, watch, defineComponent, inject, onMounted, onUnmounted} from 'vue';

import {LyricLine} from '../../types';

export default defineComponent({

  name: 'LyricView',

  setup() {
    // 已选定的歌词索引
    const selectedIndex = ref(-1);
    // 包裹所有歌词的内容元素在y轴方向上的平移
    const translate = ref('translateY(0px)');

    // 组件根元素 和 所有的歌词内容元素
    let elements: HTMLElement[] = [];

    // 注入歌词信息
    const lyrics = inject('lyrics') as { list: LyricLine[], playedTime: number };

    // 组件根元素可见高度
    let visibleHeight = 1;
    // 已滚动的歌词内容索引
    let scrolledIndex = 0;
    // 是否可滚动歌词内容
    let scrollable = true;

    let translateY = 0;

    // 指针设备在节点上按下时的y偏移量
    let offsetY = 0;
    // 滚动计时器
    let scrollTimer: number | null = null;

    let resizeObserver: ResizeObserver;

    /**
     * 滚动歌词内容到可见视图的中央
     *
     * @param newValue 歌词信息
     */
    const scrollLyric = (newValue: typeof lyrics) => {
      if (!scrollable) {
        return;
      }

      const {list, playedTime} = newValue;
      const max = list.length;
      let active = false, index = 0;

      for (; index < max; ++index) {
        const line = list[index];

        if (playedTime < line.start) {
          active = false;
          break;
        }

        if (playedTime <= line.end) {
          active = true;
          break;
        }
      }

      // 若播放时间处于某一行歌词,那么高亮它, 否则取消高亮
      const newSelectedIndex = active ? index : -1;

      // 若标记的选择歌词索引发生了变化了, 则更新选择索引标记
      if (selectedIndex.value !== newSelectedIndex) {
        selectedIndex.value = newSelectedIndex;
      }

      // 若需要滚动, 那么将指定索引的歌词内容滚动到可视区域的中央
      if (scrolledIndex !== (active ? index : --index)) {
        scrolledIndex = index;

        const element = elements[index];

        //       ---------------------------  content-wrapper
        //     + |                         |  ↖
        //     + |                         |     translateY(所求值)
        //     + |                         |  ↙
        // top + ===========================  root-element
        //     + |                         |  ↖
        //     + |                         |  ↙ (rootElement.height - targetElement.height) / 2
        //       |*************************|  target-element(处于视图垂直居中的元素)
        //       |                         |
        //       |                         |
        //       ===========================
        //
        // 注: top右侧 +号等价于{符号 , 它指示目标元素到它的父元素content-wrapper的上偏移量
        //     translateY = - (top - (组件可见高度 - 目标元素高度) / 2)
        //                =   -top + (组件可见高度 - 目标元素高度) / 2

        if (element) {
          const {offsetHeight: height, offsetTop: top} = element;
          translateY = -top + (visibleHeight - height) / 2;
          translate.value = `translateY(${translateY}px)`;
        }
      }
    };

    onMounted(() => {
      resizeObserver = new ResizeObserver(([{contentRect}]) => {
        // 可见高度设定为组件根元素内容盒子的高度
        visibleHeight = contentRect.height;

        // 因为 宽度 或 高度 发生了变化, 重置滚动索引,使其能够重新滚动
        scrolledIndex = -1;
        // 尝试滚动歌词内容
        scrollLyric(lyrics);
      });

      // 开始观察组件根元素的 宽度 或 高度 变化
      resizeObserver.observe(elements[-1]);
    });

    onUnmounted(() => {
      // 取消和结束目标对象上所有对element的观察
      resizeObserver.disconnect();

      // 断开所有引用
      for (let index = elements.length - 1; index >= -1; --index) {
        elements[index] = null as any;
      }

      visibleHeight = resizeObserver = elements = null as any;
    });

    // 开始监听 歌词内容 和 播放时间 的变化
    watch(lyrics, scrollLyric);

    // onBeforeUpdate(() => {
    //   elements.value = [];
    // })

    /**
     * 开始拖动(指针设备在滑块上按下)时触发, 此时并还未开始拖动,仅仅是准备好拖动.
     * 需要注意检测中断拖动不能依靠滑块(div)元素本身,需要借助document对象 或 window对象
     * 因为元素本身在鼠标移动后,所监听的鼠标释放事件并不会触发,但是document或window一定会触发
     *
     * @param {PointerEvent} event 指针事件
     */
    const onDragStart = (event: PointerEvent) => {
      event.preventDefault();

      // 关闭歌词滚动
      scrollable = false;
      // 清除计时器
      scrollTimer && window.clearTimeout(scrollTimer);
      scrollTimer = null as any;

      offsetY = event.pageY;

      document.onpointermove = onDragging;
      document.onpointerup = onDragEnd;
    };

    /**
     * 滑块被拖动时触发.在此过程中,只会提交input事件以修改value属性值
     * @param {PointerEvent} event 指针事件
     */
    const onDragging = (event: PointerEvent) => {
      event.preventDefault();

      translateY = -(offsetY - event.pageY) - translateY;
      translate.value = `translateY(${translateY}px)`;
    };

    /**
     * 鼠标停止拖动(鼠标在页面开始按下后,然后释放)时触发.
     * 此时只会提交change事件,并且传出的第2个参数boolean值true以方便侦测滑块拖动结束
     */
    const onDragEnd = () => {
      document.onpointermove = document.onpointerup = null;

      scrollTimer = window.setTimeout(() => void (scrollable = true), 3500);
    };

    return {elements, selectedIndex, list: lyrics.list, translate, onDragStart};
  },

})
</script>

<style scoped>
.lyric-view {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: grab;

  mask-image: linear-gradient(180deg,
  hsla(0, 0%, 100%, 0) 0,
  hsla(0, 0%, 100%, .6) 15%, #fff 25%,
  #fff 75%, hsla(0, 0%, 100%, .6) 85%,
  hsla(0, 0%, 100%, 0));
}

.lyric-view .content-wrapper {
  transition: transform 0.1s ease-out 0s;
  /** transform: translateY(0); */
}

.lyric-view .lyric-item {
  /*display: flex;
  align-items: center;
  justify-content: center;*/
  text-align: center;
  font-size: 18px;
  color: white;
  padding: 8px 0;
  white-space: pre-wrap;
}

.lyric-view .lyric-item.active {
  color: rgb(226, 155, 208);
  transform: scale(1.5);
}
</style>