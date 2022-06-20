<template>
  <div class="tab-pane" :class="[tabPosition, alignment]">
    <template v-if="mode === 'router'">
      <div class="tab-container">
        <router-link custom v-for="tab in tabs" :key="tab.path"
                     v-slot="{ navigate, isActive }" :to="tab.path">
          <div @click="navigate" class="tab" :class="{ active: isActive }">
            <slot :name="tab.slot">
              <icon :name="tab.icon" v-if="tab.icon"/>
              {{ tab.title }}
            </slot>
          </div>
        </router-link>
      </div>

      <!-- 路由匹配到的组件将渲染在这里 -->
      <div class="tab-content" :class="[contentClass]">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component"/>
          </keep-alive>
        </router-view>
      </div>
    </template>

    <template v-else>
      <div class="tab-container">
        <div class="tab" :class="{ active: activeTabName === tab.name }" :key="index"
             v-for="(tab, index) in tabs" @click="onTabClick(tab)">
          <slot :name="tab.slot">{{ tab.title }}</slot>
        </div>
      </div>

      <div class="tab-content" :class="[contentClass]">
        <slot :name="activeTabName"/>
      </div>
    </template>
  </div>
</template>

<script lang='ts'>
import {useRoute} from 'vue-router';
import {computed, defineComponent, PropType} from "vue";

import {Tab, TabMode, TabPosition, TabAlignment} from './types';

export default defineComponent({
  name: "TabPane",

  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      default: [] as Tab[]
    },
    /** 已激活的选项卡 */
    activeTabName: String,
    mode: {
      type: String as PropType<TabMode>,
      default: "normal",
    },
    tabPosition: {
      type: String as PropType<TabPosition>,
      default: "top"
    }
  },

  emits: ['tabChange'],

  setup(props, {emit}) {
    const route = useRoute();

    return {
      /**
       * tab的排列方式(水平、垂直)
       */
      alignment: computed<TabAlignment>(() => {
        const {tabPosition: value} = props;
        return value === 'top' || value === 'bottom' ? 'horizontal' : 'vertical';
      }),

      /**
       * tab对应内容部分的class
       */
      contentClass: computed(() => {
        const {path} = route;
        const {mode, activeTabName, tabs} = props;

        if (mode === 'normal') {
          return activeTabName;
        }

        const tab = tabs.find(tab => tab.path === path);
        return tab ? tab.name : null;
      }),

      /**
       * 选项卡被点击时的回调
       *
       * @param tab 选项卡
       */
      onTabClick(tab: Tab) {
        props.activeTabName !== tab.name && emit('tabChange', tab);
      }
    };
  }
});
</script>