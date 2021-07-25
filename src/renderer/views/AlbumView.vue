<template>
  <div class="v-column">
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

  </div>
</template>

<script>
export default {
  name: "AlbumView",

  props: {query: null},

  data: () => ({
    tab: 0,
    songList: [],
    page: {current: 1, size: 30, total: 1},
    album: {mid: '', name: '', cover: ''},
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', valueGetter: item => item.singer ? item.singer.name : null},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ]
  }),

  mounted() {
    let value = this.query, album = this.album;
    album.mid !== value.mid ? this.onAlbumChanged(value) : null;
  },

  watch: {
    query(value) {
      this.album.mid !== value.mid ? this.onAlbumChanged(value) : null;
    }
  },

  methods: {
    onAlbumChanged(album) {
      this.album = {...album};
      this.$spinner.open();
      this.$source.impl.albumSongList(this.album, this.page)
          .then(res => this.songList = res).finally(this.$spinner.close);
    },

    /**
     * 表格行单元格双击时的回调方法
     * @param row {Number} 行单元格索引
     */
    onCellClick(row) {
      let item = this.songList[row];

      if (item.path) {
        let player = this.$player, playList = player.playList;
        player.index = row;
        playList.splice(0, playList.length, ...this.songList);
        return player.prepare(item) ? player.play() : null;
      }

      this.$spinner.open();
      this.$source.impl.handleMusicInfo(item).then(success => {
        if (success) {
          let player = this.$player, playList = player.playList;
          player.index = row;
          playList.splice(0, playList.length, ...this.songList);
          if (player.prepare(item)) {
            player.play();
          } else {
            this.$message.warning('媒体资源加载失败！');
          }
        } else {
          this.$message.warning('网络资源获取失败！');
        }

      }).finally(this.$spinner.close);
    },
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