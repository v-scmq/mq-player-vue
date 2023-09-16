<template>
  <tab-pane :tabs="tabs" :activeTabName="activeTabName" @tabChange="handleTabChanged">
    <template #song>
      <div class="v-row" style="gap: 8px; margin: 0 0 1em 0; --button-icon-size: 1.5em">
        <hl-button icon="play-select">播放全部</hl-button>

        <popover content-class="dropdown">
          <hl-button icon="plus" @click="loadProfileSpecial">添加到</hl-button>
          <template v-slot:content>
            <div class="dropdown-item separator first">我的收藏</div>
            <div
              class="dropdown-item"
              :class="{ separator: index + 1 === userSpecials.length }"
              :data-index="index"
              v-for="(item, index) in userSpecials"
              :key="index"
            >
              {{ item.name }}
            </div>
            <div class="dropdown-item last">添加到新歌单</div>
          </template>
        </popover>

        <hl-button icon="my-download">下载</hl-button>
        <hl-button icon="trash">删除</hl-button>
        <hl-button icon="multiple" @click="multiple = !multiple">{{
          multiple ? '退出批量操作' : '批量操作'
        }}</hl-button>
      </div>

      <table-view
        style="flex: auto"
        :selection="multiple"
        :columns="columns"
        :data="songList"
        @row-dblclick="playMediaList"
        @infinite-scroll="loadDataList"
      >
        <template v-slot:title="{ item }">
          <span class="cell-text">{{ item.title }}</span>
          <icon class="vip-icon" name="vip" width="1em" height="1em" v-if="item.vip" />
          <icon class="mv-icon" name="mv" width="1em" height="1em" v-if="item.vid" />
        </template>

        <template v-slot:singer="{ item: { singer: singers = [] } }">
          <span class="link cell-text" v-for="(singer, index) in singers" :key="index" :data-mid="singer.mid">{{
            singer.name
          }}</span>
        </template>

        <template v-slot:album="{ item: { album } }">
          <span class="link cell-text" :data-mid="album.mid" v-if="album">{{ album.name }}</span>
        </template>
      </table-view>
    </template>

    <template #album>
      <grid-view
        cell-widths="repeat(auto-fit, 13em)"
        :cell-height="234"
        :data="albumList"
        @infinite-scroll="loadAlbumData"
        @cell-click="onAlbumItemClicked"
      >
        <template v-slot="{ item }">
          <image-view v-model="item.cover" defaultValue="icon/album.png" />
          <div class="name">{{ item.name }}</div>
        </template>
      </grid-view>
    </template>

    <template #mv>
      <grid-view
        class="arc-rect"
        cell-widths="repeat(auto-fit, 16em)"
        :data="mvList"
        :cell-height="206"
        @infinite-scroll="loadMvData"
      >
        <template v-slot="{ item }">
          <image-view v-model="item.cover" defaultValue="icon/mv.png" />
          <div>
            <span class="link" v-for="(singer, index) in item.singer" :key="index" :data-mid="singer.mid">
              {{ singer.name }}
            </span>
            -<span>{{ item.title }}</span>
          </div>
        </template>
      </grid-view>
    </template>

    <template #special>
      <grid-view
        style="margin-top: 1em"
        cell-widths="repeat(auto-fit, 13em)"
        :cell-height="234"
        :data="specialList"
        @infinite-scroll="loadSpecialData"
      >
        <template v-slot="{ item }">
          <image-view v-model="item.cover" defaultValue="icon/special.png" />
          <div class="name">{{ item.name }}</div>
        </template>
      </grid-view>
    </template>
  </tab-pane>
</template>

<script lang="ts">
import { playMediaList } from '@/player/hooks';
import Spinner from '../components/Spinner';

import { TableColumn, Tab as BaseTab } from '../components/types';
import { Album, Mv, Song, ComputedPage, Special } from '@/types';
import { getLikeSongs, getLikeAlbums, getLikeMvs, getLikeSpecials, getProfileSpecials } from '@/api';

import { reactive, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

type TabName = 'song' | 'album' | 'mv' | 'special';

/**
 * 选项卡信息
 */
type Tab = BaseTab & {
  /** 选项卡标题 */
  title: string;
  name: TabName;
  /** 数据是否需要更新 */
  update: boolean;
  /** 选项卡对应的视图是分页信息 */
  page: ComputedPage;
};

export default defineComponent({
  name: 'Favorite',

  setup() {
    const songList = reactive<Song[]>([]);
    const mvList = reactive<Mv[]>([]);
    const albumList = reactive<Album[]>([]);
    const specialList = reactive<Special[]>([]);

    const MV_TAB = { title: 'MV', name: 'mv', update: true, page: { current: 1, size: 30 } } as Tab;
    const SONG_TAB = { title: '歌曲', name: 'song', update: true, page: { current: 1, size: 30 } } as Tab;
    const ALBUM_TAB = { title: '专辑', name: 'album', update: true, page: { current: 1, size: 30 } } as Tab;
    const SPECIAL_TAB = { title: '歌单', name: 'special', update: true, page: { current: 1, size: 30 } } as Tab;

    const tabs = [SONG_TAB, ALBUM_TAB, MV_TAB, SPECIAL_TAB];
    const activeTabName = ref<TabName>('song');

    const columns: TableColumn[] = [
      { type: 'index', width: '100px' },
      { title: '歌曲', property: 'title', flex: true },
      { title: '歌手', property: 'singer' },
      { title: '专辑', property: 'album' },
      { title: '时长', property: 'duration', width: '100px' }
    ];

    const multiple = ref(false);

    // 当前登录的用户歌单
    const userSpecials = reactive<Special[]>([]);

    const router = useRouter();

    /**
     * 处理选项卡改变事件
     *
     * @param newTab 新选定的选项卡
     */
    const handleTabChanged = (newTab: Tab) => {
      activeTabName.value = newTab.name;

      // 若未选定任何一个选项卡 或 当前选项卡无需更新数据, 则什么也不做
      if (!newTab.update) {
        return;
      }

      // 立刻重置为无需更新状态
      newTab.update = false;

      // 打开进度指示器
      Spinner.open();

      // 分页信息
      const page = newTab.page as ComputedPage;

      // 若选定歌曲选项卡
      if (newTab.name === SONG_TAB.name) {
        // 获取收藏的歌曲列表
        getLikeSongs(page)
          .then((data) => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);
            // 添加歌曲
            songList.splice(0, songList.length, ...data.list);
          })
          .catch(() => (newTab.update = true))
          .finally(Spinner.close);
      }

      if (newTab.name === ALBUM_TAB.name) {
        // 获取收藏的专辑列表
        getLikeAlbums(page)
          .then((data) => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);
            // 添加专辑
            albumList.splice(0, albumList.length, ...data.list);
          })
          .finally(Spinner.close);
      }

      if (newTab.name === MV_TAB.name) {
        // 获取收藏的mv列表
        getLikeMvs(page)
          .then((data) => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);

            // 添加Mv
            mvList.splice(0, mvList.length, ...data.list);
          })
          .catch(() => (newTab.update = true))
          .finally(Spinner.close);
      }

      if (newTab.name === 'special') {
        // 获取收藏的歌单
        getLikeSpecials(page)
          .then((data) => {
            // 修改分页信息
            data.page && Object.assign(page, data.page);

            // 添加歌单
            specialList.splice(0, specialList.length, ...data.list);
          })
          .catch(() => (newTab.update = true))
          .finally(Spinner.close);
      }
    };

    // 主动调用tab改变处理器方法
    handleTabChanged(SONG_TAB);

    return {
      tabs,
      activeTabName,
      columns,
      songList,
      albumList,
      mvList,
      specialList,
      multiple,
      userSpecials,

      handleTabChanged,

      playMediaList,

      /**
       * 当专辑列表项点击时,跳转到专辑视图
       *
       * @param event 点击事件
       */
      onAlbumItemClicked(event: PointerEvent) {
        const node = event.target as HTMLElement,
          classList = node.classList;
        if (classList.contains('cover') || classList.contains('name')) {
          // 获取数据索引
          const value = (node.parentNode as HTMLElement).getAttribute('data-index');
          const index = value ? Number(value) : -1;
          // 提取专辑信息
          const album = albumList[index] && { ...albumList[index], singer: null };
          // 若存在专辑信息, 则跳转到专辑视图
          album && router.push({ path: '/album-view', query: album });
        }
      },

      loadDataList() {
        const page = SONG_TAB.page;

        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          ++page.current;
          Spinner.open();

          // 获取收藏的歌曲列表
          getLikeSongs(page)
            .then((data) => {
              // 重设置分页信息
              data.page && Object.assign(page, data.page);
              // 添加歌曲
              songList.push(...data.list);
            })
            .catch(() => --page.current)
            .finally(Spinner.close);
        }
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadAlbumData() {
        const page = MV_TAB.page;
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          // 获取收藏的专辑列表
          getLikeAlbums(page)
            .then((data) => {
              // 修改分页信息
              data.page && Object.assign(page, data.page);
              // 添加专辑
              albumList.push(...data.list);
            })
            .catch(() => --page.current)
            .finally(Spinner.close);
        }
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadMvData() {
        const page = MV_TAB.page;

        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          getLikeMvs(page)
            .then((data) => {
              // 修改分页信息
              data.page && Object.assign(page, data.page);

              // 添加Mv
              mvList.push(...data.list);
            })
            .catch(() => --page.current)
            .finally(Spinner.close);
        }
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadSpecialData() {
        const page = SPECIAL_TAB.page;

        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          getLikeSpecials(page)
            .then((data) => {
              // 修改分页信息
              data.page && Object.assign(page, data.page);

              // 添加歌单
              specialList.push(...data.list);
            })
            .catch(() => --page.current)
            .finally(Spinner.close);
        }
      },

      loadProfileSpecial() {
        const updatable = userSpecials as any;

        const millis = new Date().getTime();
        // 若时间差不到15秒, 则不获取更新
        if (millis - (updatable.$time || 0) < 15000) {
          return;
        }

        updatable.$time = millis;

        Spinner.open();

        getProfileSpecials()
          .then((data) => void (data && userSpecials.push(...data.list)))
          .finally(Spinner.close);
      }
    };
  }
});
</script>
