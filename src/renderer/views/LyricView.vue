<template>
  <div class='lyric-view' ref='el'>
    <div class='content-wrapper' :style='{transform: translated}'>

      <div class='lyric-item' :class='{active: activeIndex === index}'
           v-for='(line, index) in lyrics.list' :key='index'>
        {{ line.content }}
      </div>

    </div>
  </div>
</template>

<script lang='ts'>
import {ref, computed, watch, defineComponent, inject, onMounted, onBeforeUnmount} from 'vue'

import {LyricLine} from '../../types';

export default defineComponent({

  name: 'LyricView',

  setup() {
    // 组件根元素引用
    const el = ref(null as unknown as HTMLElement);

    // 注入歌词信息
    const lyrics = inject('lyrics') as { list: LyricLine[], playedTime: number };

    let offsetHeight = 1, cellHeight = 1;
    let resizeObserver: ResizeObserver;

    const active = ref(false);
    const selectedIndex = ref(-1);

    watch(lyrics, () =>{
      const {list, playedTime} = lyrics;

      const max = list.length - 1;
      let activated = false, index = 0;

      for (let max = list.length - 1, index = 0; index < max; ++index) {
        const line = list[index + 1];

        if (playedTime > line.start && playedTime < line.end) {
          active.value = true;
          selectedIndex.value = index;
          return;
        }

        if(playedTime < line.start){
          active.value = false;
          selectedIndex.value = index;
          return;
        }
      }

      active.value = false;
      selectedIndex.value = -1;
    });

    const translated = computed(() => {
      const index = selectedIndex.value;
      // 可见单元格数量除以2
      const visibleCount = (offsetHeight / cellHeight) >> 1;
      const value = index < visibleCount ? 0 : (index - visibleCount) * cellHeight;
      return `translateY(-${value}px)`;
    });

    onMounted(() => {
      resizeObserver = new ResizeObserver(() => {
        offsetHeight = el.value.offsetHeight;
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

    return {el, active, selectedIndex, lyrics, translated};
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