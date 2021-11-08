<template>
  <div ref='el' class='v-row list-view' v-for='(children,index) in tags' :key='index' @click='onListViewClicked'>
    <div class='item' v-for='tag in children' :key='tag.id' :data-tag='tag.value'>{{ tag.name }}</div>
  </div>
  <div ref="el" class='image-container arc-rect' style='flex:1;'>
    <div class='cover-item' v-for='(item,index) in list' :key='index'>
      <img class='cover' :src='item.cover' loading="lazy" alt/>
      <div class='name'>{{ item.singer }}{{ item.singer ? item.singer.name : null }} - {{ item.title }}</div>
    </div>
  </div>
</template>

<script>
import Spinner from '../components/Spinner';
import {reactive, nextTick, onMounted, getCurrentInstance} from "vue";

export default {
  name: 'MVList',

  setup() {
    const tags = reactive([]);
    /** @type {any} */
    const list = reactive([]);
    const page = reactive({current: 1, size: 30});
    const tag = {};

    // TODO 数据源API待修改
    const $source = {};

    onMounted(() => {
      let el = getCurrentInstance().refs.el;
      Spinner.open();
      $source.impl.mvList(null, page).then(data => {
        if (data instanceof Array) {
          this.list = data;

        } else {
          let tagList = [];
          let array = Object.keys(data.tags);
          array.forEach(key => {
            //  {area:[{id:1,name:'A'}] .....]} => {en:id, ......}
            tag[key] = null;
            data.tags[key].forEach(item => item.value = `${key}-${item.id}`);
            //  {area:[{id:1,name:'A'}] .....]} => [[], []]
            tagList.push(data.tags[key]);
          });
          tags.splice(0, tags.length, ...tagList);
          list.splice(0, list.length, ...data.list);

          nextTick(() => {
            let nodes = el.querySelectorAll('.list-view .item:first-child');
            nodes.forEach(node => node.classList.add('active'));
            el = null;
          });
        }

      }).finally(Spinner.close);
    });

    return {
      tags, list, tag, page,

      /**
       * ListView被点击时,设置被点击的列表项的class
       * @param event {MouseEvent} 鼠标事件
       */
      onListViewClicked(event) {
        let node = event.target, value;
        let attr = node.attributes.getNamedItem('data-tag');

        if ((value = attr ? attr.value : null)) {
          let [group, id] = value.split('-');
          tag[group] = id;
          node.parentNode.childNodes.forEach(item => item.classList.remove('active'));
          node.classList.add('active');

          Spinner.open();
          $source.impl.mvList(tag, page)
              .then(data => list.splice(0, list.length, ...data))
              .finally(Spinner.close);
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
