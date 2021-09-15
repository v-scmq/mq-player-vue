<template>
  <div class="v-row singer-info-container">
    <img alt class="cover" :src="album.cover"/>
    <div class="v-column">
      <div>{{ album.name || '-' }}</div>

      <div class="v-row base-info">
        <span class="count-info">流派：{{ album.genre || '-' }}</span>
        <span class="count-info">语种：{{ album.language || '-' }}</span>
        <span class="count-info">唱片公司：{{ album.company || '-' }}</span>
        <span class="count-info">发行时间：{{ album.year || '-' }}</span>
      </div>

      <div class="v-row">
        <button-base text="播放全部"/>
        <button-base text="播放全部"/>
        <button-base text="打印预览"/>
      </div>
    </div>
  </div>

  <div class="v-row" style="margin:1em 0 0 0;flex:auto;overflow:hidden;align-items:stretch;">
    <table-view style="flex:auto" :columns="columns" :data='songList' @row-dblclick="onCellClick"/>
    <div class="label" style="margin:0 0 0 1em;padding:0 1em 0 0;width:15em;">
      简介：{{ album.introduce }}
    </div>
  </div>
</template>

<script>
import {getCurrentInstance, reactive, watch} from "vue";

export default {
  name: "AlbumView",

  props: {query: Object},

  setup(props) {
    const songList = reactive([]);
    const page = reactive({current: 1, size: 30, total: 1});
    const /** @type {any} */ album = reactive({mid: '', name: '', cover: '', company: ''});
    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', valueGetter: item => item.singer ? item.singer.name : null},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ]);

    const {$player, $spinner, $source} = getCurrentInstance().appContext.config.globalProperties;

    watch(() => props.query, newQuery => {
      if (album.mid !== newQuery.mid) {
        $spinner.open();
        $source.impl.albumSongList(Object.assign(album, newQuery), page)
            .then(res => songList.splice(0, songList.length, ...res))
            .finally($spinner.close);
      }

    }, {immediate: true});

    return {
      songList, page, album, columns,

      /**
       * 表格行单元格双击时的回调方法
       * @param row {Number} 行单元格索引
       */
      onCellClick: row => $player.playMediaList(songList, row)
    };

  }
}
</script>

<style scoped>
.image-container {
  padding: 1em 0 0 0;
  margin: 0.5em 0 0 0;
}

.image-container > .content-box {
  align-items: center;
  margin: 0 3em 3em 0;
}

.cover, .content-box .cover {
  width: 13em;
  height: 13em;
  cursor: pointer;
  border-radius: 8em;
  transition: transform .75s cubic-bezier(0, 1, .75, 1);
}

.content-box .name {
  max-width: 13em;
  /*默认换行white-space: normal;*/
}

.content-box:hover .cover {
  transform: scale(1.07);
}
</style>