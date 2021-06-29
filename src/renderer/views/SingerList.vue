<template>
  <div class='v-column'>
    <div class='v-row list-view' v-for='(children,index) in tags' :key='index' @click='onListViewClicked'>
      <div class='item' v-for='tag in children' :key='tag.id' :custom-data='tag.value'>{{ tag.name }}</div>
    </div>
    <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'>
      <div class='v-column singer-box' v-for='(item,index) in list' :key='index' :class='item.class'>
        <img alt class=cover :src='item.cover' @click="navigateTo(item)"/>
        <div @click="navigateTo(item)">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SingerListView',

  data: () => ({
    tags: [],
    list: [],
    page: {current: 1, size: 30},
    tag: {en: null, area: null, sex: null, genre: null, group: null}
  }),

  mounted() {
    this.$spinner.open();
    this.$source.impl.singerList(null, this.page).then(data => {
      if (data instanceof Array) {
        this.list = data;

      } else {
        let tagList = [];
        let array = Object.keys(data.tags);
        array.forEach(key => {
          //  {en:[{id:1,name:'A'}], area:[{}], sex:[{}]} => {en:id, area:id, sex:id}
          this.tag[key] = null;
          data.tags[key].forEach(item => item.value = `${key}-${item.id}`);
          //  {en:[{id:1,name:'A'}], area:[{}], sex:[{}]} => [[], [], []]
          tagList.push(data.tags[key]);
        });
        this.tags = tagList;
        this.list = data.list;

        this.$nextTick(() => {
          let nodes = this.$el.querySelectorAll('.list-view .item:first-child');
          nodes.forEach(node => node.classList.add('active'));
        });
      }

    }).finally(this.$spinner.close);
  },
  methods: {
    onListViewClicked(event) {
      let node = event.target, value;
      let attr = node.attributes.getNamedItem('custom-data');

      if ((value = attr ? attr.value : null)) {
        let [group, id] = value.split('-');
        this.tag[group] = id;
        node.parentNode.childNodes.forEach(item => item.classList.remove('active'));
        node.classList.add('active');

        this.$spinner.open();
        this.$source.impl.singerList(this.tag, this.page)
            .then(data => this.list = data).finally(this.$spinner.close);
      }
    },

    navigateTo(singer) {
      this.$router.push({path: '/singer-view', query: singer});
    }
  }
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
