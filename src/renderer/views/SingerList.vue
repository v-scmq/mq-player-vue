<template>
  <div class='v-row list-view' v-for='(children,index) in tags' :key='index' @click='onListViewClicked'>
    <div class='item' v-for='tag in children' :key='tag.id' :data-tag='tag.value'>{{ tag.name }}</div>
  </div>
  <div ref="el" class='v-row image-container' style='flex:1;flex-wrap:wrap;overflow:auto;justify-content:space-around;'>
    <div class='v-column singer-box' v-for='(item,index) in list' :key='index'>
      <img alt class=cover :src='item.cover' @click="navigateTo(item)"/>
      <div @click="navigateTo(item)">{{ item.name }}</div>
    </div>
  </div>
</template>

<script>
import {reactive, nextTick, getCurrentInstance, onMounted} from "vue";
import {useRouter} from "vue-router";

export default {
  name: 'SingerListView',

  setup() {
    const tags = reactive([]);
    /** @type {any} */
    const list = reactive([]);
    const page = reactive({current: 1, size: 30});
    const tag = reactive({en: null, area: null, sex: null, genre: null, group: null});

    const vc = getCurrentInstance();
    const {$spinner, $source} = vc.appContext.config.globalProperties;
    const router = useRouter();

    onMounted(() => {
      $spinner.open();
      $source.impl.singerList(null, page).then(data => {
        debugger;
        if (data instanceof Array) {
          list.splice(0, list.length, ...data);

        } else {
          let tagList = [];
          let array = Object.keys(data.tags);
          array.forEach(key => {
            //  {en:[{id:1,name:'A'}], area:[{}], sex:[{}]} => {en:id, area:id, sex:id}
            tag[key] = null;
            data.tags[key].forEach(item => item.value = `${key}-${item.id}`);
            //  {en:[{id:1,name:'A'}], area:[{}], sex:[{}]} => [[], [], []]
            tagList.push(data.tags[key]);
          });
          tags.splice(0, tags.length, ...tagList);
          list.splice(0, list.length, ...data.list);

          nextTick(() => {
            let el = vc.refs.el.parentNode;
            let nodes = el.querySelectorAll('.list-view .item:first-child');
            nodes.forEach(node => node.classList.add('active'));
          });
        }

      }).finally($spinner.close);
    });

    return {
      tags, list, page, tag,
      onListViewClicked(event) {
        let node = event.target, value;
        let attr = node.attributes.getNamedItem('data-tag');

        if ((value = attr ? attr.value : null)) {
          let [group, id] = value.split('-'), nodes = node.parentNode.childNodes;
          tag[group] = id;
          nodes.forEach(item => item.classList.remove('active'));
          node.classList.add('active');

          $spinner.open();
          $source.impl.singerList(tag, page)
              .then(data => list.splice(0, list.length, ...data))
              .finally($spinner.close);
        }
      },

      navigateTo(singer) {
        router.push({path: '/singer-view', query: singer});
      }
    };
  },
}
</script>

<style scoped>
.image-container > .singer-box {
  align-items: center;
  margin: 0 3em 3em 0;
}

.singer-box .cover {
  width: 13em;
  height: 13em;
  border-radius: 8em;
  cursor: pointer;
  transition: transform .75s cubic-bezier(0, 1, .75, 1);
}

.singer-box:hover .cover {
  transform: scale(1.07);
}

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
