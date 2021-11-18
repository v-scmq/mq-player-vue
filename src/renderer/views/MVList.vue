<template>
  <div class='v-row list-view' v-for='(children, index) in tags' :key='index' @click='onListViewClicked'>
    <div class='item' v-for='tag in children' :key='tag.id' :data-tag='tag.value'
         :class='{active: tag.id === mvTagParam[tag.group]}'>{{ tag.name }}
    </div>
  </div>

  <div class='image-container arc-rect' style='flex:1;'>
    <div class='cover-item' v-for='(item, index) in mvList' :key='index'>
      <img class='cover' alt loading='lazy' :src='item.cover'/>

      <div class='name' v-if='item.singer instanceof Array'>
         <span class='link' v-for='(singer, index) in item.singer' :key='index' :data-mid='singer.mid'>
              {{ singer.name }}
          </span>
      </div>
      <div v-else>{{ item.singer && (item.singer.name || item.singer) }}</div>
    </div>
  </div>
</template>

<script>
import Spinner from '../components/Spinner';
import {getMvList} from '../api';

import {reactive, onMounted} from 'vue';

export default {
  name: 'MVList',

  setup() {
    /**
     * @typedef {Object} TagItemNode tag标签节点信息
     *
     * @property {string} name 分类标签名称
     * @property {string | number} id 分类标签id
     * @property {string} group 所属分类组
     * @property {string} value `${分类标签分类组}-${分类标签id}`
     */

    const tags = reactive(/** @type {TagItemNode[][]} */[]);
    const mvList = reactive(/** @type {Mv[]} */[]);
    const page = reactive(/** @type {Page} */{current: 1, size: 30});
    const mvTagParam = reactive(/** @type {MvTagsParam} */ {});

    onMounted(() => {
      Spinner.open();

      getMvList(page, null).then(data => {
        // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
        Object.assign(page, data.page);

        const tagList = [];

        // 转换结构 => {a:[{id, name}], b:[{id, name}]} => [[{id, name, group:a, value:'a;${id}'}] , ...]
        Object.keys(data.tags).forEach(key => {
          const children = data.tags[key];
          //  {a:[{id:1,name:'A'}], b:[{}] } => {a:id, b:id}
          mvTagParam[key] = children && children[0] && children[0].id; // 1 && 0 => 0

          // {id, name} => {id, name, group:key, value:`${key};${id}`}
          children.forEach(item => item.value = `${item.group = key};${item.id}`);

          tagList.push(children);
        });

        tags.splice(0, tags.length, ...tagList);
        mvList.splice(0, mvList.length, ...data.list);

      }).finally(Spinner.close);
    });

    return {
      tags, mvList, mvTagParam, page,

      /**
       * ListView被点击时,设置被点击的列表项的class
       * @param event {MouseEvent} 鼠标事件
       */
      onListViewClicked(event) {
        const {value} = event.target.attributes.getNamedItem('data-tag') || {};
        if (!value) {
          return;
        }

        // 获取分类标签所属组 和 分类标签id
        const [group, id] = value.split(';');

        // 若未改变, 则什么也不做
        if (mvTagParam[group] === id) {
          return;
        }

        // 设定当前分类组对应的分类标签id
        mvTagParam[group] = id;
        // 重设为第一页
        page.current = 1;

        Spinner.open();

        getMvList(page, mvTagParam).then(data => {
          page.total = data.page.total;
          mvList.splice(0, mvList.length, ...data.list);

        }).finally(Spinner.close);
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
