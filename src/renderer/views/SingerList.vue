<template>
  <div class='v-column'>
    <div class='v-row list-view' v-for='(tagList,index) in tagType' :key='index' @click='onListViewClicked'>
      <div class='item' v-for='tag in tagList' :key='tag.id' :data='tag.id'>{{ tag.name }}</div>
    </div>
    <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'>
      <div class='v-column singer-box' v-for='(item,index) in list' :key='index' :class='item.class'>
        <img class=cover :src='item.cover' alt/>
        <div>{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SingerListView',
  data: () => ({
    tagType: [],
    list: [],
    page: {current: 1, size: 30},
    area: 0,
    sex: null,
    en: null,
  }),
  created() {
    this.tagType = this.$source.impl.singerTagList();

    // this.$source.impl.singerList(this.page, this.area, this.sex, this.en).then(res => this.list = res);
  },
  mounted() {
    let nodes = this.$el.querySelectorAll('.list-view .item:first-child');
    nodes.forEach(node => node.classList.add('active'));
  },
  methods: {
    onListViewClicked(event) {
      let node = event.target;
      if (node.classList.contains('item')) {
        node.parentNode.childNodes.forEach(item => item.classList.remove('active'));
        node.classList.add('active');
      }
    },
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
}

</style>
