<template>
  <div class='v-row list-view' @click='onListViewClicked'>
    <div class='item' v-for='(tag, index) in visibleTags' :key='index' :data-tag='tag.id'>{{ tag.name }}</div>
    <div class="item" id="more">更多</div>
  </div>
  <div ref="el" class='v-row image-container' style='flex:1;flex-wrap:wrap;overflow:auto;justify-content:space-around;'>
    <div class='v-column content-box' v-for='(item,index) in list' :key='index'>
      <img class=cover :src='item.cover' loading="lazy" alt/>
      <div class='name'>{{ item.name }}</div>
    </div>
  </div>

  <modal modality title="全部分类" ref="tagModal" width="70%" height="60%">
    <template v-slot:content>
      <template v-for="(item, _index) in tags" :key='_index'>
        {{ item.title }}
        <div class='v-row list-view'>
          <div class='item' v-for='(tag, index) in item.items' :key='index' :data-index='index'>{{ tag.name }}</div>
        </div>
      </template>
    </template>
  </modal>
</template>

<script>
import {getCurrentInstance, nextTick, onMounted, reactive} from "vue";

export default {
  name: 'SpecialList',

  data: () => ({}),
  setup() {

    const /** @type {any} */ tags = reactive([]);
    const /** @type {any} */ list = reactive([]);
    const /** @type {any} */ visibleTags = reactive([]);
    const page = reactive({current: 1, size: 30});
    const tag = {};

    const vc = getCurrentInstance();
    const {$spinner, $source} = vc.appContext.config.globalProperties;

    onMounted(() => {
      let el = vc.refs.el;
      $spinner.open();
      $source.impl.specialList(null, page).then(res => {
        if (res instanceof Array) {
          list.splice(0, list.length, ...res);

        } else {
          tags.splice(0, tags.length, ...res.tags);
          list.splice(0, list.length, ...res.list);
          let random = Math.random();

          res.tags.forEach(item => {
            let items = item.items, size = items.length;
            let tag = size > 0 ? items[Math.floor(random * size)] : null;
            tag ? visibleTags.push(tag) : null;
          });

          nextTick(() => {
            let nodes = el.querySelectorAll('.list-view > .item:first-child');
            nodes.forEach(node => node.classList.add('active'));
          });
        }
      }).finally($spinner.close);

    });

    return {
      tags, list, visibleTags, page,
      onListViewClicked(event) {
        let node = event.target;
        if (node.id === 'more') {
          vc.refs.tagModal.open();
          return;
        }

        let attr = node.attributes.getNamedItem('custom-data');
        if (node.classList.contains('item')) {
          node.parentNode.childNodes.forEach(item => item.classList.remove('active'));
          node.classList.add('active');

          if ((tag.id = attr ? attr.value : null)) {
            $spinner.open();
            $source.impl.specialList(tag, page)
                .then(data => list.splice(0, list.length, ...data))
                .finally($spinner.close);
          }
        }
      }
    };

  }
}
</script>

<style scoped>
.image-container {
  padding: 1em 0 0 0;
  margin: 0.5em 0 0 0;
}

.image-container > .content-box {
  align-items: center;
  margin: 0 3em 3em 0;
}

.content-box .cover {
  width: 13em;
  height: 13em;
  cursor: pointer;
  border-radius: 8em;
  transition: transform .75s cubic-bezier(0, 1, .75, 1);
}

.content-box .name {
  max-width: 13em;
  /*默认换行white-space: normal;*/
}

.content-box:hover .cover {
  transform: scale(1.07);
}

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
