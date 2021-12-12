<template>
  <div class='v-row list-view' v-for='(children, index) in tags' :key='index' @click='onListViewClicked'>
    <div class='item' v-for='tag in children' :key='tag.id' :data-tag='tag.value'
         :class='{active: tag.id === singerTagParam[tag.group]}'>{{ tag.name }}
    </div>
  </div>

  <grid-view style='margin-top:1em' :data='singerList' cell-widths='repeat(auto-fit, 13em)'
             :cell-height='234' @cell-click='navigateTo' @infinite-scroll='loadData'>
    <template v-slot='{item}'>
      <image-view v-model='item.cover' defaultValue='/icon/singer.png'/>
      <div>{{ item.name }}</div>
    </template>
  </grid-view>
</template>

<script lang='ts'>
import {getSingerList} from '../api';
import Spinner from '../components/Spinner';

import {reactive, onMounted, defineComponent} from 'vue';
import {useRouter} from 'vue-router';

import {ComputedPage, Singer, SingerTags, SingerTagsParam} from 'src/types';

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
  name: 'SingerListView',

  setup() {
    const tags = reactive<TagItemNode[][]>([]);
    const singerList = reactive<Singer[]>([]);
    const singerTagParam = reactive<SingerTagsParam>({} as SingerTagsParam);
    // 无限滚动 + 列表虚拟滚动
    const page = {current: 1, size: 30, total: 0} as ComputedPage;

    const router = useRouter();

    onMounted(() => {
      Spinner.open();

      getSingerList(page, null).then(data => {
        // 获取 total(总数据条数) 和 size(每页数据量,有可能会被重设为其他值)
        data.page && Object.assign(page, data.page);

        const tagList:TagItemNode[][] = [];
        const singerTags = data.tags as SingerTags;

        // 转换结构 => {a:[{id, name}], b:[{id, name}]} => [[{id, name, group:a, value:'a;${id}'}] , ...]
        Object.keys(singerTags).forEach(key => {
          const property = key as keyof typeof singerTags;
          const children = singerTags[property];
          //  {a:[{id:1,name:'A'}], b:[{}] } => {a:id, b:id}
          singerTagParam[property] = (children[0] && children[0].id) as string; // 1 && 0 => 0

          // {id, name} => {id, name, group:key, value:`${key};${id}`}
          children.forEach(item => item.value = `${item.group = key};${item.id}`);

          tagList.push(children as TagItemNode[]);
        });

        // 添加歌手分类标签列表数据
        tags.splice(0, tags.length, ...tagList);
        // 添加歌手列表数据
        singerList.splice(0, singerList.length, ...data.list);

      }).finally(Spinner.close);
    });

    return {
      tags, singerList, singerTagParam,

      /**
       * 歌手分类标签被点击时, 加载最新的歌手数据列表
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
        if (singerTagParam[group] === id || !group) {
          return;
        }

        // @ts-ignore 设定当前分类组对应的分类标签id
        singerTagParam[group] = id;
        // 重设为第一页
        page.current = 1;

        Spinner.open();
        getSingerList(page, singerTagParam).then(data => {
          // 重设分页信息
          data.page && Object.assign(page, data.page);
          // 添加歌手数据
          singerList.splice(0, singerList.length, ...data.list);

        }).catch(() => --page.current).finally(Spinner.close);
      },

      /**
       * 跳转到歌手视图
       *
       * @param singer 歌手信息
       */
      navigateTo(singer: Singer) {
        router.push({path: '/singer-view', query: singer});
      },

      /** 加载数据到视图上(无限滚动触发点) */
      loadData() {
        // 若还有数据, 则发起网络请求加载歌曲数据列表
        if (page.current >= 1 && page.current < page.pageCount) {
          Spinner.open();

          ++page.current;

          getSingerList(page, singerTagParam).then(data => {
            // 重设分页信息
            data.page && Object.assign(page, data.page);
            // 添加歌手数据
            singerList.push(...data.list);

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
