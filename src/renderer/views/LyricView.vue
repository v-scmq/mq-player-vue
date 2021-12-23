<template>
  <div class='lyric-view' :ref='element => void (elements[-1] = element)'>
    <div class='content-wrapper' :style='{transform: translate}'>

      <div class='lyric-item' v-for='(line, index) in lyrics.list' :key='index'
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

    let visibleHeight = 1, scrolledIndex = 0;
    let resizeObserver: ResizeObserver;

    /**
     * 滚动歌词内容到可见视图的中央
     *
     * @param newValue 歌词信息
     */
    const scrollLyric = (newValue: typeof lyrics) => {
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

      selectedIndex.value = active ? index : -1;

      if (active && scrolledIndex !== index) {
        scrolledIndex = index;
        const element = elements[index];

        //       ---------------------------  content-wrapper
        //    ↗ |                         |  ↖
        //       |                         |     translateY(所求值)
        //       |                         |  ↙
        //  top  ===========================  root-element
        //       |                         |  ↖
        //    ↘ |                         |  ↙ (rootElement.height - targetElement.height) / 2
        //       |+++++++++++++++++++++++++|  target-element(处于视图垂直居中的元素)
        //       |                         |
        //       |                         |
        //       ===========================

        if (element) {
          const {offsetHeight: height, offsetTop: top} = element;
          translate.value = `translateY(-${top - (visibleHeight - height) / 2}px)`;
        }
      }
    }

    onMounted(() => {
      resizeObserver = new ResizeObserver(([{contentRect}]) => {
        // 可见高度设定为组件根元素内容盒子的高度
        visibleHeight = contentRect.height;

        // 尝试滚动歌词, 因为 宽度 或 高度 发生了变化,
        // 但在这之前必须将标记的滚动位置重置, 才能重新滚动
        scrolledIndex = -1;
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

    return {elements, selectedIndex, lyrics, translate};
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