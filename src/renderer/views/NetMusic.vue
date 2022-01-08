<template>
  <div class='tab-pane v-column'>
    <div class='v-row tab-container' style='justify-content:center;'>

      <router-link custom v-slot='{navigate, isActive}' v-for='(tab, index) in tabs' :key='index' :to='tab.path'>
        <div class='tab' :class='{active: isActive}' @click='navigate'>{{ tab.meta.title }}</div>
      </router-link>
    </div>

    <div class='v-column tab-content'>
      <router-view v-slot='{Component}'>
        <keep-alive>
          <component :is='Component'/>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';
import {useRoute} from 'vue-router';

export default defineComponent({
  name: 'NetMusic',

  setup() {
    return {
      tabs: (useRoute().matched[0].children as unknown as
          Array<{ path: string, meta: { title: string } }>)
          .filter(route => route.meta)
    };
  }

});
</script>
