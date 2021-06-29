<template>
  <div class='v-column'>
    <div class="v-row singer-info-container">
      <img alt class="cover" :src="singer.cover"/>
      <div class="v-column">
        <div>{{ singer.name || '-' }}</div>

        <div class="v-row base-info">
          <span class="count-info">单曲：{{ singer.songCount || '-' }}</span>
          <span class="count-info">专辑：{{ singer.albumCount || '-' }}</span>
          <span class="count-info">MV：{{ singer.mvCount || '-' }}</span>
          <span class="count-info">粉丝：{{ singer.fansCount || '-' }}</span>
        </div>

        <div class="v-row">
          <button-base text="播放全部"/>
          <button-base text="播放全部"/>
          <button-base text="播放全部"/>
          <button-base text="播放全部"/>
        </div>
      </div>
    </div>

    <div class='tab-pane v-column'>
      <div class='v-row tab-container' style='justify-content:center;'>

        <div class="tab" v-for='(item,index) in tabArray' :key='index'
             :class="tab===index?'active':null" @click='tab=index'>
          {{ item }}
        </div>
      </div>

      <div class="tab-content v-column">

        <table-view :columns="columns" :data='list' style="flex:auto;"
                    v-show="tab===0" @row-dblclick="onCellClick"/>

        <div v-show="tab===1">专辑</div>
        <div v-show="tab===2">MV</div>
        <div v-show="tab===3">{{ singer.introduce }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SingerView",

  props: {query: null},

  data: () => ({
    tab: 0,
    list: [],
    tabArray: ['歌曲', '专辑', 'MV', '详情'],
    page: {current: 1, size: 30, total: 1},
    singer: {mid: '', name: '', cover: '', songCount: '-', albumCount: '-', mvCount: '-', fansCount: '-'},
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', valueGetter: item => item.singer ? item.singer.name : null},
      {title: '专辑', valueGetter: item => item.album ? item.album.name : null},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ],
  }),

  mounted() {
    console.info(this.$route);
    this.setSinger(this.query);
  },

  watch: {
    query(newValue) {
      this.setSinger(newValue);
    }
  },

  methods: {
    setSinger(value) {
      if (this.singer.mid !== value.mid) {
        this.singer.mid = value.mid;
        this.singer.name = value.name;
        this.singer.cover = value.cover;
        this.singer.songCount = value.songCount;
        this.singer.albumCount = value.albumCount;
        this.singer.mvCount = value.mvCount;
        this.singer.fansCount = value.fansCount;

        this.tab = 0;
        this.$spinner.open();
        let api = this.$source.impl;
        api.handleSingerInfo(this.singer).then(success =>
            success ? api.singerSongList(this.singer, this.page) : null
        ).then(res => this.list = res || []).finally(this.$spinner.close);
      }
    },

    /**
     * 表格行单元格双击时的回调方法
     * @param row {Number} 行单元格索引
     */
    onCellClick(row) {
      let item = this.list[row];
      if (!item.path) {
        this.$spinner.open()
        this.$source.impl.handleMusicInfo(item).then(success => {
          if (success) {
            let player = this.$player, playList = player.playList;
            player.index = row;
            playList.splice(0, playList.length, ...this.list);
            if (player.prepare(item)) {
              player.play();
            }
          }

        }).finally(this.$spinner.close);
        return;
      }

      let player = this.$player, playList = player.playList;
      player.index = row;
      playList.splice(0, playList.length, ...this.list);
      if (player.prepare(item)) {
        player.play();
      }
    },
  }
}
</script>

<style scoped>
.cover {
  width: 13em;
  height: 13em;
  border-radius: 8em;
}
</style>