<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CIcon from '@/components/CIcon.vue';

import type { PropType } from 'vue';
import type { Tab, TabMode, TabPosition, TabAlignment } from './types';

const props = defineProps({
  /** 所有展示的选项卡 */
  tabs: { type: Array as PropType<Tab[]>, default: [] as Tab[] },
  /** 已激活的选项卡 */
  activeTabName: String,
  /** 选项卡模式 */
  mode: { type: String as PropType<TabMode>, default: 'normal' },
  /** 选项卡呈现位置 */
  tabPosition: { type: String as PropType<TabPosition>, default: 'top' }
});

const emit = defineEmits(['tabChange']);

const route = useRoute();

/**
 * tab的排列方式(水平、垂直)
 */
const alignment = computed<TabAlignment>(() => {
  const { tabPosition: value } = props;
  return value === 'top' || value === 'bottom' ? 'horizontal' : 'vertical';
});

/**
 * tab对应内容部分的class
 */
const contentClass = computed(() => {
  const { path } = route;
  const { mode, activeTabName, tabs } = props;
  return mode === 'normal' ? activeTabName : tabs.find(tab => tab.path === path)?.name;
});

/**
 * 选项卡被点击时的回调
 *
 * @param tab 选项卡
 */
const onTabClick = (tab: Tab) => {
  props.activeTabName !== tab.name && emit('tabChange', tab);
};
</script>

<template>
  <div class="c-tab-pane" :class="[tabPosition, alignment]">
    <template v-if="mode === 'router'">
      <div class="tab-container">
        <router-link
          custom
          v-for="tab in tabs"
          :key="tab.path"
          v-slot="{ navigate, isActive }"
          :to="tab.path as string"
        >
          <div @click="navigate" class="tab" :class="{ active: isActive }">
            <slot :name="tab.slot">
              <c-icon :name="tab.icon" v-if="tab.icon" />
              {{ tab.title }}
            </slot>
          </div>
        </router-link>
      </div>

      <!-- 路由匹配到的组件将渲染在这里 -->
      <div class="tab-content" :class="[contentClass]">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </template>

    <template v-else>
      <div class="tab-container">
        <div
          class="tab"
          :class="{ active: activeTabName === tab.name }"
          :key="index"
          v-for="(tab, index) in tabs"
          @click="onTabClick(tab)"
        >
          <slot :name="tab.slot">{{ tab.title }}</slot>
        </div>
      </div>

      <div class="tab-content" :class="[contentClass]">
        <slot :name="activeTabName" />
      </div>
    </template>
  </div>
</template>
