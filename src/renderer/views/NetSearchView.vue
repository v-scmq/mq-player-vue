<template>
  <div class="v-row singer-info-container" v-if="singer">
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
        <button-base text="打印预览" @click="print"/>
      </div>
    </div>
  </div>

  <div class='tab-pane v-column'>
    <div class='v-row tab-container' style='justify-content:center;'>

      <div class="tab" v-for='(tabItem,index) in tabList' :key='index'
           :class="tab===tabItem?'active':null" @click='tab=tabItem'>
        {{ tabItem.title }}
      </div>
    </div>

    <div class="tab-content v-column">

      <table-view :columns="columns" :data='songList' style="flex:auto;"
                  v-show="tab===songTab" @row-dblclick="onCellClick">
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
      </table-view>

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show="tab===albumTab" @click="onAlbumItemClicked">
        <div class='v-column content-box' v-for='(item,index) in albumList' :key='index' :custom-data="index">
          <img class=cover :src='item.cover' loading="lazy" alt/>
          <div class='name'>{{ item.name }}</div>
        </div>
      </div>

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show="tab===mvTab">
        <div class='v-column content-box' v-for='(item,index) in mvList' :key='index' :class='item.class'>
          <img class=cover :src='item.cover' loading="lazy" alt/>
          <div class='name'>{{ item.singer ? item.singer.name : null }} - {{ item.title }}</div>
        </div>
      </div>

      <div v-show="tab===specialTab" class="label">歌单list</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NetSearchView",

  props: {query: null},

  data: () => ({
    singer: null,
    mvList: [],
    songList: [],
    albumList: [],
    specialList: [],

    tab: null,
    tabList: [],
    mvTab: {title: 'MV', update: true, error: null},
    songTab: {title: '歌曲', update: true, error: null},
    albumTab: {title: '专辑', update: true, error: null},
    specialTab: {title: '歌单', update: true, error: null},

    page: {current: 1, size: 30, total: 1},

    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', valueGetter: item => item.album ? item.album.name : null},
      {title: '时长', property: 'duration', width: 100}
    ]
  }),

  created() {
    this.tabList = [this.songTab, this.albumTab, this.mvTab, this.specialTab];
    this['$query'] = this.query.value;
    this.tab = this.songTab;
  },

  watch: {
    query() {
      if (this.$query !== this.query.value) {
        this.tab = null;
        this['$query'] = this.query.value;
        this.tabList.forEach(tab => tab.update = true);
        this.$nextTick(() => this.tab = this.songTab);
      }
    },

    tab(newTab) {
      // 若未选定任何一个选项卡 或 当前选项卡无需更新数据, 则什么也不做
      if (!newTab || !newTab.update) {
        return;
      }

      // 打开进度指示器
      this.$spinner.open();
      // 立刻重置为无需更新状态
      newTab.update = false;

      let api = this.$source.impl;

      // 若选定歌曲选项卡
      if (newTab === this.songTab) {
        // 搜索歌手 => 处理歌手基本数据 => 捕捉异常 => 歌曲搜索 => 显示歌曲数据 => 关闭进度指示器
        api.singerSearch(this.$query)
            .then(this.handleSingerInfo)
            .catch(() => this.singer = null)
            .then(() => api.songSearch(this.$query, this.page))
            .then(list => this.songList = list)
            .finally(this.$spinner.close);
      }

      if (newTab === this.albumTab) {
        this.$source.impl.albumSearch(this.$query, this.page)
            .then(list => this.albumList = list)
            .finally(this.$spinner.close);
      }

      if (newTab === this.mvTab) {
        this.$source.impl.mvSearch(this.$query, this.page)
            .then(list => this.mvList = list)
            .finally(this.$spinner.close);
      }

      if (newTab === this.specialTab) {
        this.$source.impl.specialSearch(this.$query, this.page)
            .then(list => this.specialList = list)
            .finally(this.$spinner.close);
      }
    }
  },

  methods: {
    handleSingerInfo(list) {
      this.singer = list && list[0] ? list[0] : null;
      return this.singer ? this.$source.impl.handleSingerInfo(this.singer) : null;
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