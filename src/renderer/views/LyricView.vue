<template>
  <div class='lyric-view' ref='el'>
    <div class='content-wrapper' :style='{transform: translate}'>

      <div class='lyric-item' v-for='(line, index) in lyrics.list' :key='index'
           :ref='element => {if(children && element) children[index] = element}'
           :class='{active: selectedIndex === index}'>
        {{ line.content }}
      </div>

    </div>
  </div>
</template>

<script lang='ts'>
import {ref, watch, defineComponent, inject, onMounted, onBeforeUnmount} from 'vue'

import {LyricLine} from '../../types';

export default defineComponent({

  name: 'LyricView',

  setup() {
    // 已选定的歌词索引
    const selectedIndex = ref(-1);
    // 包裹所有歌词的内容元素在y轴方向上的平移
    const translate = ref('translateY(0px)');

    // 组件根元素引用
    const el = ref(null as unknown as HTMLElement);
    // 所有的歌词内容元素引用
    const children = ref<HTMLElement[]>([]);

    // 注入歌词信息
    const lyrics = inject('lyrics') as { list: LyricLine[], playedTime: number };

    let visibleHeight = 1, scrolledIndex = 0;
    let resizeObserver: ResizeObserver;

    watch(lyrics, () => {
      const {list, playedTime} = lyrics;

      const max = list.length;
      let active = false, index = 0;

      for (; index < max; ++index) {
        const line = list[index];

        if (playedTime < line.start) {
          active = false;
          break;
        }

        if (playedTime < line.end) {
          active = true;
          break;
        }
      }

      selectedIndex.value = active ? index : -1;

      if (active && scrolledIndex !== index) {
        scrolledIndex = index;
        const element = children.value[index];

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
    });

    onMounted(() => {
      resizeObserver = new ResizeObserver(() => {
        visibleHeight = el.value.offsetHeight;
      });

      resizeObserver.observe(el.value);
    });

    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null as any;
      }

      children.value = null as any;
      visibleHeight = null as any;
    });

    // onBeforeUpdate(() => {
    //   children.value = [];
    // })

    return {el, children, selectedIndex, lyrics, translate};
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