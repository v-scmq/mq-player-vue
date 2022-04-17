<template>
  <div class='v-row list-view' @click='onListViewClicked'>
    <div class='item' v-for='tag in visibleTags' :key='tag.id' :data-id='tag.id'
         :class='{active: specialTagParam.id === tag.id}'>{{ tag.name }}
    </div>
    <div class='item special-tag-more'>更多</div>
  </div>

  <grid-view style='margin-top:1em' :data='specialList' cell-widths='repeat(auto-fit, 13em)'
             :cell-height='234' @infinite-scroll='loadData'>
    <template v-slot='{item}'>
      <image-view v-model='item.cover' defaultValue='icon/special.png'/>
      <div class='name'>{{ item.name }}</div>
    </template>
  </grid-view>

  <modal modality title='全部分类' width='70%' height='60%' v-model:visible='tagModal'>
    <template v-slot:content>
      <template v-for='(item, _index) in tags' :key='_index'>
        {{ item.title }}
        <div class='v-row list-view' @click='onListViewClicked'>
          <div class='item' v-for='(tag, index) in item.items' :key='index' :data-id='tag.id'
               :class='{active: specialTagParam.id === tag.id}'>{{ tag.name }}
          </div>
        </div>
      </template>
    </template>
  </modal>
</template>

<script lang='ts'>
import {getSpecialList} from '../api';
import Spinner from '../components/Spinner';

import {ComputedPage, Special, SpecialTags, Tag} from 'src/types';

import {onMounted, reactive, ref, defineComponent} from 'vue';

export default defineComponent({
  name: 'SpecialList',

  setup() {
    // 所有歌单分类标签
    const tags = reactive<SpecialTags[]>([]);
    // 可见的歌单分类标签列表
    const visibleTags = reactive<Tag[]>([]);
    // 歌单列表
    const specialList = reactive<Special[]>([]);
    // 当前已选Tag的id
    const specialTagParam = reactive<Tag>({id: ''});
    // 分页信息
    const page = {current: 1, size: 30} as ComputedPage;

    // 显示分类标签的模态框显隐控制
    const tagModal = ref(false);

    onMounted(() => {
      Spinner.open();

      getSpecialList(page, null).then(data => {
        data.page && Object.assign(page, data.page);
        data.tags && tags.splice(0, tags.length, ...data.tags);
        specialList.splice(0, specialList.length, ...data.list);

        const random = Math.random();

        data.tags && data.tags.forEach(item => {
          const children = item.items;
          const tag = children[(random * children.length) ^ 0];
          tag && visibleTags.push(tag);
        });

        // 断言能够获得数据
        const [{items: [tag]}] = data.tags || [];
        tag && Object.assign(specialTagParam, tag);

      }).finally(Spinner.close);

    });

    return {
      tags, specialList, visibleTags, tagModal, specialTagParam,

      /**
       * 若点击分类标签时,切换歌单数据;
       * 若点击更多分类时,则打开歌单详细分类标签模态框
       *
       * @param event 点击事件
       */
      onListViewClicked(event: PointerEvent) {
        const node = event.target as HTMLElement, classList = node.classList;
        if (classList.contains('special-tag-more')) {
          return tagModal.value = true;
        }

        const value = node.getAttribute('data-id');

        if (value && value !== specialTagParam.id) {
          specialTagParam.id = value;

          Spinner.open();
          page.current = 1;

          getSpecialList(page, specialTagParam).then(data => {
            data.page && Object.assign(page, data.page);
            specialList.splice(0, specialList.length, ...data.list);

          }).finally(Spinner.close);
        }
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadData() {
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          getSpecialList(page, specialTagParam).then(data => {
            data.page && Object.assign(page, data.page);
            specialList.push(...data.list);

          }).catch(() => --page.current).finally(Spinner.close);
        }
      }

    };

  }

});
</script>

<style scoped>
.list-view:nth-child(2n) {
  margin: 0.5em 0;
}

.list-view .item {
  cursor: pointer;
  border-radius: 1em;
  white-space: nowrap;
  margin: 0 0 0 0.5em;
  padding: 0.25em 0.75em;
  color: var(--text-base);
}

.list-view .item:hover {
  color: var(--text-hover);
}

.list-view .item.active {
  background: var(--fill-base);
  color: var(--text-active);
}
</style>
