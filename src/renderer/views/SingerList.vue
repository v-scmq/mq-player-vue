<template>
  <div class='v-row list-view' v-for='(children, index) in tags' :key='index' @click='onListViewClicked'>
    <div class='item' v-for='tag in children' :key='tag.id' :data-tag='tag.value'
         :class='{active: tag.id === singerTagParam[tag.group]}'>{{ tag.name }}
    </div>
  </div>

  <div class='image-container' style='flex:1;'>
    <div class='cover-item' v-for='(singer, index) in singerList' :key='index' @click='navigateTo(singer)'>
      <img alt class=cover :src='singer.cover' loading='lazy'/>
      <div>{{ singer.name }}</div>
    </div>
  </div>
</template>

<script>
import Spinner from '../components/Spinner';

import {reactive, onMounted} from 'vue';
import {useRouter} from 'vue-router';

import {getSingerList} from '../api';

export default {
  name: 'SingerListView',

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
    const singerList = reactive(/** @type {Singer[]} */[]);
    const page = reactive(/** @type {Page}*/{current: 1, size: 30, total: 0});
    const singerTagParam = reactive( /** @type {SingerTagsParam} */{});

    const router = useRouter();

    onMounted(() => {
      Spinner.open();

      getSingerList(page, null).then(data => {
        // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
        Object.assign(page, data.page);

        const tagList = [];

        // 转换结构 => {a:[{id, name}], b:[{id, name}]} => [[{id, name, group:a, value:'a;${id}'}] , ...]
        Object.keys(data.tags).forEach(key => {
          const children = data.tags[key];
          //  {a:[{id:1,name:'A'}], b:[{}] } => {a:id, b:id}
          singerTagParam[key] = children && children[0] && children[0].id; // 1 && 0 => 0

          // {id, name} => {id, name, group:key, value:`${key};${id}`}
          children.forEach(item => item.value = `${item.group = key};${item.id}`);

          tagList.push(children);
        });

        // 添加歌手分类标签列表数据
        tags.splice(0, tags.length, ...tagList);
        // 添加歌手列表数据
        singerList.splice(0, singerList.length, ...data.list);

      }).finally(Spinner.close);
    });

    return {
      tags, singerList, singerTagParam,

      onListViewClicked(event) {
        const {value} = event.target.attributes.getNamedItem('data-tag') || {};
        if (!value) {
          return;
        }

        // 获取分类标签所属组 和 分类标签id
        const [group, id] = value.split(';');

        // 若未改变, 则什么也不做
        if (singerTagParam[group] === id) {
          return;
        }

        // 设定当前分类组对应的分类标签id
        singerTagParam[group] = id;
        // 重设为第一页
        page.current = 1;

        Spinner.open();
        getSingerList(page, singerTagParam).then(data => {
          page.total = data.page.total;
          singerList.splice(0, singerList.length, ...data.list);
        }).finally(Spinner.close);
      },

      navigateTo(singer) {
        router.push({path: '/singer-view', query: singer});
      }
    };
  },
}
</script>

<style scoped>
.list-view:nth-child(2n) {
  margin: 0.5em 0;
}

.list-view .item {
  cursor: pointer;
  border-radius: 1em;
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
  pointer-events: none;
  cursor: none;
}

</style>
