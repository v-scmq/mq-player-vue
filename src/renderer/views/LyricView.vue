<template>
  <div class='lyric-view'>
    <div class='lyric-item' :class='{active: second === line.second}'
         v-for='(line, index) in lyrics' :key='index'>
      {{ line.content }}
    </div>
  </div>
</template>

<script lang='ts'>
import {reactive, ref, defineComponent, onMounted} from 'vue'

import {LyricLine} from '../../types';
import {getLyric} from '../api';

export default defineComponent({

  setup() {
    const lyrics = reactive<LyricLine[]>([]);

    const second = ref(15);

    onMounted(() => {
      getLyric({mid: 'vq12342'}).then(data => {
        lyrics.splice(0, lyrics.length, ...data);
      })
    });

    return {lyrics, second};
  },

})
</script>

<style scoped>
.lyric-view {
  display: flex;
  flex-direction: column;
  overflow: hidden auto;
  gap: 20px 0;
}

.lyric-view .lyric-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.lyric-view .lyric-item.active {
  color: rgb(226, 155, 208);
  transform: scale(1.5);
}
</style>