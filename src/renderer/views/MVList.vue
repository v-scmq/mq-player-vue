<template>
  <div class='v-row list-view' v-for='(children, index) in tags' :key='index' @click='onListViewClicked'>
    <div class='item' v-for='tag in children' :key='tag.id' :data-tag='tag.value'
         :class='{active: tag.id === mvTagParam[tag.group]}'>{{ tag.name }}
    </div>
  </div>

  <div class='image-container arc-rect' style='flex:1;'>
    <div class='cover-item' v-for='(item, index) in mvList' :key='index'>
      <img class='cover' alt loading='lazy' :src='item.cover'/>
      <div class='name'>
       <span class='link' v-for='(singer, _index) in item.singer' :key='_index' :data-mid='singer.mid'>
            {{ singer.name }}
       </span>
        -<span>{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {getMvList} from '../api';
import {convertSinger} from '../../utils';
import Spinner from '../components/Spinner';

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
    const mvTagParam = reactive(/** @type {MvTagsParam} */ {});
    const page =  /** @type {Page} */{current: 1, size: 30};

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

        // 添加Mv分类标签信息
        tags.splice(0, tags.length, ...tagList);

        // 添加Mv数据
        data.list.forEach(convertSinger);
        mvList.splice(0, mvList.length, ...data.list);

      }).finally(Spinner.close);
    });

    return {
      tags, mvList, mvTagParam,

      /**
       * Mv分类标签被点击时, 加载最新的Mv数据列表
       *
       * @param {NamedNodeMap} attributes HTML节点属性(原参数{@link PointerEvent})
       */
      onListViewClicked({target: {attributes}}) {
        const {value} = attributes.getNamedItem('data-tag') || {};
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
          Object.assign(page, data.page);

          // 转换歌手为Array类型
          data.list.forEach(convertSinger);
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
