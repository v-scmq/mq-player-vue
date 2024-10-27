<script lang="ts" setup>
import electron, { isMaximized, isFullScreen, toggleFullScreen } from '@/electron';
import CIcon from '@/components/CIcon.vue';

defineProps({
  // 指定是否为viewer, 默认为false
  viewer: Boolean
});

const setState = electron.setWindowState;
</script>

<template>
  <div class="row right drag window-state-bar" :class="{ viewer, 'full-screen': isFullScreen }">
    <slot />

    <!-- 全屏/退出全屏(播放详情时可见) -->
    <c-icon
      class="full-screen-icon"
      v-if="viewer"
      :name="isFullScreen ? 'fulled-screen' : 'full-screen'"
      @click="toggleFullScreen"
    />

    <!-- 图标分割符 -->
    <span class="separator" v-else />

    <!-- 窗口最小化状态控制 -->
    <c-icon name="minimize" @click="setState('minimize')" />
    <!-- 窗口最大化/还原状态控制 -->
    <c-icon :name="isMaximized ? 'maximized' : 'maximize'" @click="setState('toggle')" />
    <!-- 窗口关闭控制  -->
    <c-icon class="close" name="close" @click="setState" />
  </div>
</template>
