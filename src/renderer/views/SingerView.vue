<template>
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
        <button-base text="下载"/>
        <button-base text="批量操作"/>
        <button-base text="打印预览" @click="print"/>
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

      <table-view :columns="columns" :data='songList' style="flex:auto;"
                  v-show="tab===0" @row-dblclick="onCellClick">
        <template v-slot:title="{item}">
          {{ item.title }}
          <svg class="icon mv-icon" v-if="item.vid" width="1em" height="1em" viewBox="0 0 16 16">
            <path
                d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
          </svg>
        </template>

        <template v-slot:singer="{item}">
            <span class="link" v-for="(singer,index) in item.singer" :key="index" :data="singer.mid">
              {{ singer.name }}
            </span>
        </template>

        <template v-slot:album="{item}">
            <span class="link" v-if="item.album" :data="item.album.mid">
              {{ singer.name }}
            </span>
        </template>
      </table-view>

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show="tab===1" @click="onAlbumItemClicked">
        <div class='v-column content-box' v-for='(item,index) in albumList' :key='index' :custom-data="index">
          <img class=cover :src='item.cover' loading="lazy" alt/>
          <div class='name'>{{ item.name }}</div>
        </div>
      </div>

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show="tab===2">
        <div class='v-column content-box' v-for='(item,index) in mvList' :key='index' :class='item.class'>
          <img class=cover :src='item.cover' loading="lazy" alt/>
          <div class='name'>{{ item.singer ? item.singer.name : null }} - {{ item.title }}</div>
        </div>
      </div>

      <div v-show="tab===3" class="label">{{ singer.introduce }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SingerView",

  props: {query: null},

  data: () => ({
    tab: 0,
    songList: [],
    albumList: [],
    mvList: [],
    tabArray: ['歌曲', '专辑', 'MV', '详情'],
    page: {current: 1, size: 30, total: 1},
    singer: {mid: '', name: '', cover: '', songCount: '-', albumCount: '-', mvCount: '-', fansCount: '-'},
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer',},
      {title: '专辑', valueGetter: item => item.album ? item.album.name : null},
      {title: '时长', property: 'duration', width: 100}
    ]
  }),

  mounted() {
    if (this.singer.mid !== this.query.mid) {
      this.songUpdatable = this.albumUpdatable = this.mvUpdatable = true;
      this.setSinger(this.query);
    }
  },

  watch: {
    query(newValue) {
      if (this.singer.mid !== newValue.mid) {
        this.songUpdatable = this.albumUpdatable = this.mvUpdatable = true;
        this.setSinger(newValue);
      }
    },

    tab(newTab) {
      if (newTab === 0) {
        if (!this.songUpdatable) {
          return;
        }

        this.$spinner.open();
        this.songUpdatable = false;

        return this.$source.impl.handleSingerInfo(this.singer).then(success =>
            success ? this.$source.impl.singerSongList(this.singer, this.page) : null
        ).then(res => this.songList = res || []).finally(this.$spinner.close);
      }

      if (newTab === 1) {
        if (!this.albumUpdatable) {
          return;
        }

        this.$spinner.open();
        this.albumUpdatable = false;

        return this.$source.impl.singerAlbumList(this.singer, this.page)
            .then(res => this.albumList = res || []).finally(this.$spinner.close);
      }

      if (newTab === 2) {
        if (!this.mvUpdatable) {
          return;
        }

        this.$spinner.open();
        this.mvUpdatable = false;

        return this.$source.impl.singerMvList(this.singer, this.page)
            .then(res => this.mvList = res || []).finally(this.$spinner.close);
      }
    }
  },

  methods: {
    setSinger(value) {
      this.singer.mid = value.mid;
      this.singer.name = value.name;
      this.singer.cover = value.cover;
      this.singer.songCount = value.songCount;
      this.singer.albumCount = value.albumCount;
      this.singer.mvCount = value.mvCount;
      this.singer.fansCount = value.fansCount;

      this.tab = -1;
      this.$nextTick(() => this.tab = 0);
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

    print: () => print(),

    /**
     * 专辑列表项点击
     * @param event {MouseEvent} 鼠标点击事件
     */
    onAlbumItemClicked(event) {
      let node = event.target, classList = node.classList;
      if (classList.contains('cover') || classList.contains('name')) {
        let attr = node.parentNode.attributes.getNamedItem('custom-data');
        let index = attr.value - 0, album = index >= 0 ? this.albumList[index] : null;
        return album ? this.$router.push({path: '/album-view', query: album}) : null;
      }
    }
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