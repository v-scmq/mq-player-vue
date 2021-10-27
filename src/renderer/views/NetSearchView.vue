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

      <div class="tab" v-for='(tab,index) in tabMap.tabList' :key='index'
           :class="tabMap.value===tab?'active':null" @click='tabMap.value=tab'>
        {{ tab.title }}
      </div>
    </div>

    <div class="tab-content v-column">

      <table-view :columns="columns" :data='songList' style="flex:auto;"
                  v-show="tabMap.value===tabMap.SONG_TAB" @row-dblclick="onCellClick">
        <template v-slot:title="{item}">
          {{ item.title }}
          <icon class="mv-icon" name="mv" v-if="item.vid"/>
        </template>

        <template v-slot:singer="{item}">
            <span class="link" v-for="(singer,index) in item.singer" :key="index" :data-mid="singer.mid">
              {{ singer.name }}
            </span>
        </template>
      </table-view>

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show="tabMap.value===tabMap.ALBUM_TAB" @click="onAlbumItemClicked">
        <div class='v-column content-box' v-for='(item,index) in albumList' :key='index' :data-index="index">
          <img class=cover :src='item.cover' loading="lazy" alt/>
          <div class='name'>{{ item.name }}</div>
        </div>
      </div>

      <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'
           v-show="tabMap.value===tabMap.MV_TAB">
        <div class='v-column content-box' v-for='(item,index) in mvList' :key='index'>
          <img class=cover :src='item.cover' loading="lazy" alt/>
          <div class='name'>{{ item.singer ? item.singer.name : null }} - {{ item.title }}</div>
        </div>
      </div>

      <div v-show="tabMap.value===tabMap.SPECIAL_TAB" class="label">歌单list</div>
    </div>
  </div>
</template>

<script>
import {reactive, watch, getCurrentInstance} from "vue";
import {useRouter} from "vue-router";

export default {
  name: "NetSearchView",

  props: {query: Object},

  setup(props) {
    /** @type {{mid, name, cover, songCount, albumCount, mvCount, fansCount} | any} */
    const singer = reactive({});
    const songList = reactive([]);
    const /** @type {any} */ mvList = reactive([]);
    const /** @type {any} */  albumList = reactive([]);
    const /** @type {any} */  specialList = reactive([]);

    const MV_TAB = {title: 'MV', update: true, error: null};
    const SONG_TAB = {title: '歌曲', update: true, error: null};
    const ALBUM_TAB = {title: '专辑', update: true, error: null};
    const SPECIAL_TAB = {title: '歌单', update: true, error: null};
    const tabList = [SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB];
    const tabMap = reactive({value: SONG_TAB, SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB, tabList});

    const page = reactive({current: 1, size: 30, total: 1});
    const columns = reactive([
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer'},
      {title: '专辑', valueGetter: item => item.album ? item.album.name : null},
      {title: '时长', property: 'duration', width: 100}
    ]);

    const {$spinner, $source, $player} = getCurrentInstance().appContext.config.globalProperties;
    const router = useRouter();
    let $query = null;

    /**
     *  处理并获取歌手信息
     * @param list {Array} 歌手信息列表
     */
    const handleSingerInfo = list => {
      if (list && list[0] && list[0].mid) {
        $source.impl.handleSingerInfo(Object.assign(singer, list[0]), true);
      }
    };

    /**
     *  处理选项卡改变事件
     *  @param newTab { UnwrapRef<{update: boolean, title: string, error: null}>} 新选定的选项卡
     *  @return {any} 任意值
     */
    const handleTabChanged = newTab => {
      // 若未选定任何一个选项卡 或 当前选项卡无需更新数据, 则什么也不做
      if (!newTab || !newTab.update) return;
      // 立刻重置为无需更新状态
      newTab.update = false;

      // 打开进度指示器
      $spinner.open();
      let api = $source.impl;

      // 若选定歌曲选项卡
      if (newTab === tabMap.SONG_TAB) {
        // 搜索歌手 => 处理歌手基本数据 => 捕捉异常 => 歌曲搜索 => 显示歌曲数据 => 关闭进度指示器
        api.singerSearch($query)
            .then(handleSingerInfo)
            .catch(() => singer.mid = null)
            .then(() => api.songSearch($query, page))
            .then(list => songList.splice(0, songList.length, ...list))
            .finally($spinner.close);
      }

      if (newTab === tabMap.ALBUM_TAB) {
        $source.impl.albumSearch($query, page)
            .then(list => albumList.splice(0, albumList.length, ...list))
            .finally($spinner.close);
      }

      if (newTab === tabMap.MV_TAB) {
        $source.impl.mvSearch($query, page)
            .then(list => mvList.splice(0, mvList.length, ...list))
            .finally($spinner.close);
      }

      if (newTab === tabMap.SPECIAL_TAB) {
        $source.impl.specialSearch($query, page)
            .then(list => specialList.splice(0, specialList.length, ...list))
            .finally($spinner.close);
      }
    };

    watch(() => tabMap.value, handleTabChanged);

    watch(() => props.query, newQuery => {
      // 若不相等 且 新的查询参数是有效的(不能null或undefined)
      if ($query !== newQuery.value && newQuery.value) {
        $query = newQuery.value;
        tabMap.tabList.forEach(tab => tab.error = !(tab.update = true));

        // 若当前是歌曲选项卡,则手动调用handleChange方法处理
        if (tabMap.value === tabMap.SONG_TAB) {
          handleTabChanged(tabMap.SONG_TAB);
        } else {
          // 否则通过改变选项卡 触发handleChange方法
          tabMap.value = tabMap.SONG_TAB;
        }
      }
    }, {immediate: true});

    return {
      tabMap, singer, mvList, songList, albumList, specialList, page, columns,

      /**
       * 表格行单元格双击时的回调方法
       * @param row {Number} 行单元格索引
       */
      onCellClick: row => $player.playMediaList(songList, row),

      print: () => print(),

      /**
       * 专辑列表项点击
       * @param event {MouseEvent} 鼠标点击事件
       */
      onAlbumItemClicked(event) {
        let node = event.target, classList = node.classList;
        if (classList.contains('cover') || classList.contains('name')) {
          let attr = node.parentNode.attributes.getNamedItem('data-index');
          let index = attr.value - 0, album = index >= 0 ? albumList[index] : null;
          return album ? router.push({path: '/album-view', query: album}) : null;
        }
      }
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