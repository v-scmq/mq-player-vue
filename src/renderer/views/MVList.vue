<template>
  <div class='v-column'>
    <!--    <div class='v-row list-view' @click='onListViewClicked'>-->
    <!--      <div class='item' v-for='(tag,index) in tagType' :key='index'>{{ tag.name }}</div>-->
    <!--    </div>-->
    <div class='v-row list-view' v-for='(children,index) in tags' :key='index' @click='onListViewClicked'>
      <div class='item' v-for='tag in children' :key='tag.id' :custom-data='tag.value'>{{ tag.name }}</div>
    </div>
    <div class='v-row image-container' style='flex-wrap:wrap;overflow:auto;justify-content:space-around;'>
      <div class='v-column content-box' v-for='(item,index) in list' :key='index' :class='item.class'>
        <img class=cover :src='item.cover' loading="lazy" alt/>
        <div class='name'>{{ item.singer ? item.singer.name : null }} - {{ item.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MVList',

  data: () => ({
    tags: [],
    list: [],
    tag: {},
    page: {current: 1, size: 30},
  }),

  mounted() {
    this.$spinner.open();
    this.$source.impl.mvList(null, this.page).then(data => {
      if (data instanceof Array) {
        this.list = data;

      } else {
        let tagList = [];
        let array = Object.keys(data.tags);
        array.forEach(key => {
          //  {area:[{id:1,name:'A'}] .....]} => {en:id, ......}
          this.tag[key] = null;
          data.tags[key].forEach(item => item.value = `${key}-${item.id}`);
          //  {area:[{id:1,name:'A'}] .....]} => [[], []]
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
    /**
     * ListView被点击时,设置被点击的列表项的class
     * @param event {MouseEvent} 鼠标事件
     */
    onListViewClicked(event) {
      let node = event.target, value;
      let attr = node.attributes.getNamedItem('custom-data');

      if ((value = attr ? attr.value : null)) {
        let [group, id] = value.split('-');
        this.tag[group] = id;
        node.parentNode.childNodes.forEach(item => item.classList.remove('active'));
        node.classList.add('active');

        this.$spinner.open();
        this.$source.impl.mvList(this.tag, this.page)
            .then(data => this.list = data).finally(this.$spinner.close);
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
