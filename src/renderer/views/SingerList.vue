<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { getSingers } from '@/api';

import { Spinner } from '@/components/spinner';

import CImage from '@/components/CImage.vue';
import CGrid from '@/components/CGrid.vue';

import type { ComputedPage, Singer, Tag } from '@/types';

const tags = reactive<Tag[][]>([]);
const singerTags = reactive<string[]>([]);
const singers = reactive<Singer[]>([]);

// 分页信息(控制=>无限滚动 + 列表虚拟滚动)
const page = { current: 1, size: 30, total: 0 } as ComputedPage;
const router = useRouter();

/**
 * 歌手分类标签被点击时, 加载最新的歌手数据列表
 *
 */
const onListViewClicked = (group: number, id?: string) => {
  // 若未改变, 则什么也不做
  if (!id || singerTags[group] === id) {
    return;
  }

  Spinner.open();
  // 设定当前分类组对应的分类标签id
  singerTags[group] = id;
  // 重设为第一页
  page.current = 1;

  getSingers({ page, tags: singerTags }).then(({ data }) => {
    Spinner.close();

    // 重设分页信息
    data && Object.assign(page, data.page);
    // 添加歌手数据
    data && singers.splice(0, singers.length, ...data.list);
  });
};

/**
 * 跳转到歌手视图
 *
 * @param singer 歌手信息
 */
const navigateTo = (singer: Singer) => {
  router.push({ path: '/singer-view', query: singer });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadData = () => {
  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  getSingers({ page, tags: singerTags }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    // 重设分页信息
    data && Object.assign(page, data.page);
    // 添加歌手数据
    data && singers.push(...data.list);
  });
};

// =========== 调用API获取数据 ============
Spinner.open();
getSingers({ page }).then(({ data, error }) => {
  Spinner.close();

  if (error || !data) {
    return;
  }

  const tagList = data.tags;

  if (tagList) {
    const list = tagList.map(c => <string>c[0].id);
    // 添加歌手分类标签列表数据
    tags.push(...tagList);
    // 设置初始选择的分类标签
    singerTags.push(...list);
  }

  // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
  Object.assign(page, data.page);
  // 添加歌手列表数据
  singers.splice(0, singers.length, ...data.list);
});
</script>

<template>
  <div class="row tag-lists" v-for="(children, group) in tags" :key="group">
    <div
      class="item"
      v-for="tag in children"
      :key="tag.id"
      :class="{ active: tag.id === singerTags[group] }"
      @click="onListViewClicked(group, tag.id)"
    >
      {{ tag.name }}
    </div>
  </div>

  <c-grid
    style="margin-top: 1em"
    :data="singers"
    cell-widths="repeat(auto-fit, 13em)"
    :cell-height="234"
    @cell-click="navigateTo"
    @infinite-scroll="loadData"
  >
    <template v-slot="{ item }">
      <c-image v-model="item.cover" error="image/singer.png" />
      <div>{{ item.name }}</div>
    </template>
  </c-grid>
</template>
