<template>
  <div class='v-row list-view' v-for='(children, index) in tags' :key='index' @click='onListViewClicked'>
    <div class='item' v-for='tag in children' :key='tag.id' :data-tag='tag.value'
         :class='{active: tag.id === mvTagParam[tag.group]}'>{{ tag.name }}
    </div>
  </div>

  <grid-view class='arc-rect' style='margin-top:1em' cell-widths='repeat(auto-fit, 16em)' :data='mvList'
             :cell-height='206' @infinite-scroll='loadData'>
    <template v-slot='{item}'>
      <img alt class=cover :src='item.cover' loading='lazy'/>
      <div>
        <span class='link' v-for='(singer, index) in item.singer' :key='index' :data-mid='singer.mid'>
            {{ singer.name }}
       </span>
        -<span>{{ item.title }}</span>
      </div>
    </template>
  </grid-view>

</template>

<script lang='ts'>
import {getMvList} from '../api';
import {convertSinger} from '../../utils';
import Spinner from '../components/Spinner';

import {reactive, onMounted, defineComponent} from 'vue';
import {ComputedPage, Mv, MvTagsParam} from 'src/types';

/**
 * tag标签节点信息
 */
type TagItemNode = {
  /** 分类标签名称  */
  name: string;
  /** 分类标签id  */
  id: string | number;
  /** 所属分类组  */
  group: string;
  /** `${分类标签分类组}-${分类标签id}`  */
  value: string;
};

export default defineComponent({
  name: 'MVList',

  setup() {
    const tags = reactive<TagItemNode[][]>([]);
    const mvList = reactive<Mv[]>([]);
    const mvTagParam = reactive<MvTagsParam>({} as MvTagsParam);
    const page = {current: 1, size: 30} as ComputedPage;

    onMounted(() => {
      Spinner.open();

      getMvList(page, null).then(data => {
        // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
        data.page && Object.assign(page, data.page);

        const tagList:TagItemNode[][] = [];

        // 转换结构 => {a:[{id, name}], b:[{id, name}]} => [[{id, name, group:a, value:'a;${id}'}] , ...]
        Object.keys(data.tags).forEach(key => {
          const property = key as keyof typeof mvTagParam;
          const children = data.tags[property];
          //  {a:[{id:1,name:'A'}], b:[{}] } => {a:id, b:id}
          mvTagParam[property] = (children[0] && children[0].id) as string; // 1 && 0 => 0

          // {id, name} => {id, name, group:key, value:`${key};${id}`}
          children.forEach(item => item.value = `${item.group = key};${item.id}`);

          tagList.push(children as TagItemNode[]);
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
       * @param event 点击事件
       */
      onListViewClicked(event: PointerEvent) {
        const value = (event.target as HTMLElement).getAttribute('data-tag');
        if (!value) {
          return;
        }

        // 获取分类标签所属组 和 分类标签id
        const [group, id] = value.split(';');

        // @ts-ignore 若未改变, 则什么也不做
        if (mvTagParam[group] === id) {
          return;
        }

        // @ts-ignore 设定当前分类组对应的分类标签id
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
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadData() {
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          getMvList(page, mvTagParam).then(data => {
            Object.assign(page, data.page);

            // 转换歌手为Array类型
            data.list.forEach(convertSinger);
            mvList.push(...data.list);

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