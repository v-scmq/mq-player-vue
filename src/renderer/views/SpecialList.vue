<template>
  <div class='v-row list-view' @click='onListViewClicked'>
    <div class='item' v-for='(tag, index) in visibleTags' :key='index' :custom-data='tag.id'>{{ tag.name }}</div>
    <div class="item" id="more">更多</div>
  </div>
  <div ref="el" class='v-row image-container' style='flex:1;flex-wrap:wrap;overflow:auto;justify-content:space-around;'>
    <div class='v-column content-box' v-for='(item,index) in list' :key='index'>
      <img class=cover :src='item.cover' loading="lazy" alt/>
      <div class='name'>{{ item.name }}</div>
    </div>
  </div>

  <teleport to="body">
    <modal modality title="全部分类" ref="tagModal" width="90%" height="80%">
      <template v-slot:content>
        <template v-for="(item, _index) in tags" :key='_index'>
          {{ item.title }}
          <div class='v-row list-view'>
            <div class='item' v-for='(tag, index) in item.items' :key='index' :custom-data='index'>{{ tag.name }}</div>
          </div>
        </template>
      </template>
    </modal>
  </teleport>
</template>

<script>
export default {
  name: 'SpecialList',
  data: () => ({
    tags: [],
    list: [],
    tag: {},
    visibleTags: [],
    page: {current: 1, size: 30},
  }),

  mounted() {
    this.$spinner.open();
    this.$source.impl.specialList(null, this.page).then(res => {
      if (res instanceof Array) {
        this.list = res;
      } else {
        this.tags = res.tags;
        this.list = res.list;
        let random = Math.random();
        res.tags.forEach(item => {
          let items = item.items, size = items.length;
          let tag = size > 0 ? items[Math.floor(random * size)] : null;
          tag ? this.visibleTags.push(tag) : null;
        });
        this.$nextTick(() => {
          let el = this.$refs.el.parentNode;
          let nodes = el.querySelectorAll('.list-view > .item:first-child');
          nodes.forEach(node => node.classList.add('active'));
        });
      }
    }).finally(this.$spinner.close);
  },

  methods: {
    onListViewClicked(event) {
      let node = event.target;
      if (node.id === 'more') {
        this.$refs.tagModal.open();
        return;
      }

      let attr = node.attributes.getNamedItem('custom-data');
      if (node.classList.contains('item')) {
        node.parentNode.childNodes.forEach(item => item.classList.remove('active'));
        node.classList.add('active');

        if ((this.tag.id = attr ? attr.value : null)) {
          this.$spinner.open();
          this.$source.impl.specialList(this.tag, this.page)
              .then(data => this.list = data).finally(this.$spinner.close);
        }
      }
    }
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
