<script lang="ts" setup>
import { reactive, ref } from 'vue';

import CGridView from '@/components/CGrid.vue';
import CImage from '@/components/CImage.vue';
import CModal from '@/components/CModal.vue';

import { Spinner } from '@/components/spinner';
import { getSpecials } from '@/api';

import type { ComputedPage, Special, SpecialTags, Tag } from '@/types';

// 所有歌单分类标签
const tags = reactive<SpecialTags>([]);
// 可见的歌单分类标签列表
const visibleTags = reactive<Tag[]>([]);
// 歌单列表
const specials = reactive<Special[]>([]);
// 当前已选Tag的id
const specialTag = ref<string>('');
// 分页信息
const page = { current: 1, size: 30 } as ComputedPage;

// 显示分类标签的模态框显隐控制
const tagModal = ref(false);

/**
 * 若点击分类标签时,切换歌单数据;
 * 若点击更多分类时,则打开歌单详细分类标签模态框
 */
const onListViewClicked = (id?: string) => {
  if (!id || id == specialTag.value) {
    return;
  }

  Spinner.open();
  specialTag.value = id;
  page.current = 1;

  getSpecials({ page, tag: id }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    data && Object.assign(page, data.page);
    data && specials.splice(0, specials.length, ...data.list);
  });
};

/** 加载数据到视图上(无限滚动触发点) */
const loadData = () => {
  if (page.pageCount < 2 || page.current >= page.pageCount) {
    return;
  }

  Spinner.open();
  ++page.current;

  // 若还有数据, 则发起网络请求加载歌曲数据列表
  getSpecials({ page, tag: specialTag.value }).then(({ data, error }) => {
    Spinner.close();

    error && --page.current;
    data && Object.assign(page, data.page);
    data && specials.push(...data.list);
  });
};

// 调用API获取数据
Spinner.open();
getSpecials({ page }).then(({ data, error }) => {
  Spinner.close();

  if (error || !data) {
    return;
  }

  const random = Math.random();
  const tagList = <SpecialTags>data.tags;

  tagList.forEach(item => {
    const children = item.items;
    const tag = children[(random * children.length) ^ 0];
    tag && visibleTags.push(tag);
  });

  Object.assign(page, data.page);
  tags.splice(0, tags.length, ...tagList);
  specials.splice(0, specials.length, ...data.list);

  // 断言能够获得数据
  specialTag.value = <string>tagList[0].items[0].id;
});
</script>

<template>
  <div class="row tag-lists">
    <div
      class="item"
      v-for="tag in visibleTags"
      :key="tag.id"
      :class="{ active: specialTag === tag.id }"
      @click="onListViewClicked(tag.id)"
    >
      {{ tag.name }}
    </div>
    <div class="item special-tag-more" @click="tagModal = true">更多</div>
  </div>

  <c-grid-view
    style="margin-top: 1em"
    :data="specials"
    cell-widths="repeat(auto-fit, 13em)"
    :cell-height="234"
    @infinite-scroll="loadData"
  >
    <template v-slot="{ item }">
      <c-image v-model="item.cover" error="image/special.png" />
      <div class="name">{{ item.name }}</div>
    </template>
  </c-grid-view>

  <c-modal class="content-left" modality title="全部分类" width="70%" height="60%" v-model="tagModal">
    <template v-for="(children, _index) in tags" :key="_index">
      {{ children.title }}
      <div class="row tag-lists">
        <div
          class="item"
          v-for="(tag, index) in children.items"
          :key="index"
          :class="{ active: specialTag === tag.id }"
          @click="onListViewClicked(tag.id)"
        >
          {{ tag.name }}
        </div>
      </div>
    </template>
  </c-modal>
</template>
