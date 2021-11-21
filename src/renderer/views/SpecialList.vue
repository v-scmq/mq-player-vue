<template>
  <div class='v-row list-view' @click='onListViewClicked'>
    <div class='item' v-for='tag in visibleTags' :key='tag.id' :data-id='tag.id'
         :class='{active: currentTagId === tag.id}'>{{ tag.name }}
    </div>
    <div class='item special-tag-more'>更多</div>
  </div>

  <div class='image-container' style='flex:1;'>
    <div class='cover-item' v-for='(item, index) in specialList' :key='index'>
      <img class=cover :src='item.cover' loading="lazy" alt/>
      <div class='name'>{{ item.name }}</div>
    </div>
  </div>

  <modal modality title='全部分类' width='70%' height='60%' v-model:visible='tagModal'>
    <template v-slot:content>
      <template v-for='(item, _index) in tags' :key='_index'>
        {{ item.title }}
        <div class='v-row list-view' @click='onListViewClicked'>
          <div class='item' v-for='(tag, index) in item.items' :key='index' :data-id='tag.id'
               :class='{active: currentTagId === tag.id}'>{{ tag.name }}
          </div>
        </div>
      </template>
    </template>
  </modal>
</template>

<script>
import {getSpecialList} from '../api';
import Spinner from '../components/Spinner';

import {onMounted, reactive, ref} from 'vue';

export default {
  name: 'SpecialList',

  setup() {
    // 所有歌单分类标签
    const tags = reactive(/** @type {SpecialTags[]} */[]);
    // 可见的歌单分类标签列表
    const visibleTags = reactive(/** @type {Tag[]} */[]);
    // 歌单列表
    const specialList = reactive(/** @type {Special[]} */[]);
    // 当前已选Tag的id
    const currentTagId = ref(/** @type {string | number} */0);
    // 分页信息
    const page = /** @type {Page} */ {current: 1, size: 30};

    // 显示分类标签的模态框显隐控制
    const tagModal = ref(false);

    onMounted(() => {
      Spinner.open();

      getSpecialList(page, null).then(data => {
        data.page && Object.assign(page, data.page);
        tags.splice(0, tags.length, ...data.tags);
        specialList.splice(0, specialList.length, ...data.list);

        const random = Math.random();

        data.tags.forEach(item => {
          const children = item.items;
          const tag = children[(random * children.length) ^ 0];
          tag && visibleTags.push(tag);
        });

      }).finally(Spinner.close);

    });

    return {
      tags, specialList, visibleTags, tagModal, currentTagId,

      /**
       * 若点击分类标签时,切换歌单数据;
       * 若点击更多分类时,则打开歌单详细分类标签模态框
       *
       * @param {MouseEvent} event 鼠标点击事件
       */
      onListViewClicked(event) {
        const node = event.target, classList = node.classList;
        if (classList.contains('special-tag-more')) {
          return tagModal.value = true;
        }

        if (classList.contains('item')) {
          const {value} = node.attributes.getNamedItem('data-id') || {};

          if (value && value !== currentTagId.value) {
            currentTagId.value = value;

            Spinner.open();
            page.current = 1;

            getSpecialList(page, {id: currentTagId.value, name: ''}).then(data => {
              data.page && Object.assign(page, data.page);
              specialList.splice(0, specialList.length, ...data.list);

            }).finally(Spinner.close);
          }
        }
      }
    };

  }
}
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
