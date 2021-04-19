<template>
  <div class='v-column'>
    <div class='v-row tag' @click='onListViewClicked'>
      <div class='item' v-for='(tag,index) in tagType' :key='index'>{{ tag.name }}</div>
    </div>
    <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'>
      <div class='v-column content-box' v-for='(item,index) in list' :key='index' :class='item.class'>
        <img class=cover :src='item.cover' alt/>
        <div class='name'>{{ item.fileName }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MVList',
  data: () => ({
    tagType: [],
    list: [],
    page: {current: 1, size: 30},
    area: 0,
    sex: null,
    en: null,
  }),
  created() {
    this.$source.impl.mvTagList().then(async res => {
      this.tagType = res;
      console.info('res=>', res)
      this.list = await this.$source.impl.mvList(this.tagType[0], this.page);
    });

    // this.$source.impl.singerList(this.page, this.area, this.sex, this.en).then(res => this.list = res);
  },
  mounted() {
    let nodes = this.$el.querySelectorAll('.list-view');
    nodes.forEach(node => node.childNodes[0].classList.add('active'));
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
.image-container {
  padding: 1em 0 0 0;
  margin: 0.5em 0 0 0;
}

.image-container > .content-box {
  align-items: center;
  margin: 0 3em 3em 0;
}

.content-box .cover {
  width: 15em;
  height: 10em;
  cursor: pointer;
  border-radius: 0.75em;
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

.tag .item {
  cursor: pointer;
  border-radius: 1em;
  white-space: nowrap;
  margin: 0 0 0 0.5em;
  padding: 0.25em 0.75em;
  color: var(--text-base);
}

.tag .item:hover {
  color: var(--text-hover);
}

.tag .item.active {
  background: var(--fill-base);
  color: var(--text-active);
}
</style>
