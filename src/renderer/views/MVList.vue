<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { getMvList } from '@/api';
import { Spinner } from '@/components/spinner';
import CGrid from '@/components/CGrid.vue';
import CImage from '@/components/CImage.vue';

import type { ComputedPage, Mv, Tag } from '@/types';

const tags = reactive<Tag[][]>([]);
const mvs = reactive<Mv[]>([]);
const mvTags = reactive<string[]>([]);
const page = { current: 1, size: 30 } as ComputedPage;

const mvURI = ref('');

/**
 * Mv分类标签被点击时, 加载最新的Mv数据列表
 */
const onListViewClicked = (group: number, id?: string) => {
  mvURI.value = '';

  // 若未改变, 则什么也不做
  if (!id || mvTags[group] === id) {
    return;
  }

  Spinner.open();
  // 设定当前分类组对应的分类标签id
  mvTags[group] = id;
  // 重设为第一页
  page.current = 1;

  getMvList({ page, tags: mvTags }).then(({ data }) => {
    Spinner.close();
    data && Object.assign(page, data.page);
    data && mvs.splice(0, mvs.length, ...data.list);
  });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadData = () => {
  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  Spinner.open();
  ++page.current;

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  getMvList({ page, tags: mvTags }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    // 重设分页信息
    data && Object.assign(page, data.page);
    // 添加MV数据
    data && mvs.push(...data.list);
  });
};

// =========== 调用API获取数据 ============
Spinner.open();
getMvList({ page }).then(({ data, error }) => {
  Spinner.close();

  if (error || !data) {
    return;
  }

  const tagList = data.tags;

  if (tagList) {
    const list = tagList.map(c => <string>c[0].id);
    // 添加MV分类标签信息
    tags.push(...tagList);
    // 设置初始选择的分类标签
    mvTags.push(...list);
  }

  // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
  Object.assign(page, data.page);
  // 添加Mv数据
  mvs.splice(0, mvs.length, ...data.list);
});
</script>

<template>
  <div class="row tag-lists" v-for="(children, group) in tags" :key="group">
    <div
      class="item"
      v-for="tag in children"
      :key="tag.id"
      :class="{ active: tag.id === mvTags[group] }"
      @click="onListViewClicked(group, tag.id)"
    >
      {{ tag.name }}
    </div>
  </div>

  <c-grid
    class="arc-rect"
    cell-widths="repeat(auto-fit, 16em)"
    :data="mvs"
    :cell-height="206"
    @infinite-scroll="loadData"
    v-show="!mvURI"
  >
    <template v-slot="{ item }">
      <c-image v-model="item.cover" error="image/mv.png" @click="mvURI = item.path" />
      <div>
        <span
          class="link"
          v-if="item.singer"
          v-for="(singer, index) in item.singer"
          :key="index"
          :data-mid="singer.mid"
        >
          {{ singer.name }}
          <span>-</span>
        </span>
        <span>{{ item.title }}</span>
      </div>
    </template>
  </c-grid>

  <video class="mv-control" controls :src="mvURI" v-if="mvURI" />
</template>
