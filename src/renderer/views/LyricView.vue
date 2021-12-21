<template>
  <div class='lyric-view' ref='el'>
    <div class='lyric-item' :class='{active: activeIndex === index}'
         v-for='(line, index) in lyrics' :key='index'>
      {{ line.content }}
    </div>
    <div class='lyric-item' ref='fillItem'>&nbsp;</div>
  </div>
</template>

<script lang='ts'>
import {ref, computed, defineComponent, inject, onMounted, onBeforeUnmount} from 'vue'

import {LyricLine} from '../../types';

export default defineComponent({

  name: 'LyricView',

  setup() {
    const el = ref(null as unknown as HTMLElement);
    const fillItem = ref(null as unknown as HTMLElement);

    const lyrics = inject<LyricLine[]>('lyrics', []);
    const playedTime = inject<number>('playedTime', 0);

    let offsetHeight = 1, cellHeight = 1;
    let resizeObserver: ResizeObserver;

    const activeIndex = computed(() => {
      const second = playedTime;
      const max = lyrics.length - 1;
      let index = -1;

      if(max < 0) {
        return index;
      }

      for(; index < max; ++index) {
        const line = lyrics[index + 1];

        if(second < line.second) {
          break;
        }
      }

      // 可见单元格数量除以2
      const visibleCount = (offsetHeight / cellHeight) >> 1;

      el.value.scrollTo({
        behavior: 'smooth',
        top: index < visibleCount ? 0 : (index - visibleCount) * cellHeight
      });

      return index;
    });

    onMounted(() => {
      resizeObserver = new ResizeObserver(() => {
        offsetHeight = el.value.offsetHeight;
        cellHeight = fillItem.value.offsetHeight;
      });

      resizeObserver.observe(el.value);
    });

    onBeforeUnmount(() => {
      if(resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null as any;
      }

      offsetHeight = cellHeight = null as any;
    });

    return {el, fillItem, activeIndex, lyrics};
  },

})
</script>

<style scoped>
.lyric-view {
  display: flex;
  flex-direction: column;
  overflow: hidden auto;
}

.lyric-view .lyric-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  padding: 0 4px;
}

.lyric-view .lyric-item.active {
  color: rgb(226, 155, 208);
  transform: scale(1.5);
}
</style>