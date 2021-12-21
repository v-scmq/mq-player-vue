<template>
  <div class='lyric-view' ref='el'>
    <div class='content-wrapper' :style='{transform: translated}'>

      <template v-for='(line, index) in lyricList' :key='index'>
        <div class='lyric-item' :class='{active: activeIndex === index}'>
          {{ line.content }}
        </div>
      </template>

      <div class='lyric-item' ref='fillItem'>&nbsp;</div>
    </div>
  </div>
</template>

<script lang='ts'>
import {ref, computed, defineComponent, inject, onMounted, onBeforeUnmount} from 'vue'

import {LyricLine} from '../../types';

export default defineComponent({

  name: 'LyricView',

  setup() {
    // 组件根元素引用
    const el = ref(null as unknown as HTMLElement);
    const fillItem = ref(null as unknown as HTMLElement);

    // 注入歌词信息
    const lyrics = inject('lyrics') as { list: LyricLine[], playedTime: number };

    // 获取有效歌词列表
    const lyricList = computed(() =>
        lyrics.list.filter(lyricLine => !!lyricLine.content));

    let offsetHeight = 1, cellHeight = 1;
    let resizeObserver: ResizeObserver;

    const activeIndex = computed(() => {
      const {list, playedTime} = lyrics;
      const second = playedTime;
      const max = list.length - 1;
      let index = -1;

      if (max < 0) {
        return index;
      }

      for (; index < max; ++index) {
        const line = list[index + 1];

        if (second < line.second) {
          break;
        }
      }
      return index;
    });

    const translated = computed(() => {
      const index = activeIndex.value;
      // 可见单元格数量除以2
      const visibleCount = (offsetHeight / cellHeight) >> 1;
      const value = index < visibleCount ? 0 : (index - visibleCount) * cellHeight;
      return `translateY(-${value}px)`;
    });

    onMounted(() => {
      resizeObserver = new ResizeObserver(() => {
        offsetHeight = el.value.offsetHeight;
        cellHeight = fillItem.value.offsetHeight;
      });

      resizeObserver.observe(el.value);
    });

    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null as any;
      }

      offsetHeight = cellHeight = null as any;
    });

    return {el, fillItem, activeIndex, lyricList, translated};
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
  /*transform: translateY(0);*/
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