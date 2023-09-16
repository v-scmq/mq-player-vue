<template>
  <div class='v-row window-state-bar' :class='{viewer}'>
    <slot></slot>

    <!-- 全屏/退出全屏(播放详情时可见) -->
    <template v-if="viewer">
      <icon class="full-screen-icon" name='full-screen' @click='setScreenState'/>
      <icon class="fulled-screen-icon" name='fulled-screen' @click='setScreenState'/>
    </template>

    <!-- 图标分割符 -->
    <span class='separator' v-else></span>

    <!-- 窗口最小化状态控制 -->
    <icon class="fulled-screen-hidden" name='minimize' @click='minimize'/>

    <!-- 窗口最大化/还原状态控制 -->
    <icon class="fulled-screen-hidden" :name='isMaximized ? "maximized" : "maximize" ' @click='maximizeOrRestore'/>

    <!-- 窗口关闭控制  -->
    <icon class='close fulled-screen-hidden' name='close' @click='closeWindow'/>
  </div>
</template>

<script lang='ts'>
import {ref, defineComponent} from 'vue';

// 所有此组件实例都共享此对象(状态、方法)
const api = {
  initialized: false,
  isMaximized: ref(false),

  /** 最小化窗口 */
  minimize() {
    const {electron: electronApi} = window as any;
    electronApi && electronApi.setWindowMinimize();
  },

  /** 最大化或还原窗口 */
  maximizeOrRestore() {
    const {electron: electronApi} = window as any;
    electronApi && electronApi.setWindowMaximizeOrRestore();
  },

  /** 关闭窗口 */
  closeWindow() {
    window.close();
  },

  /** 设置全屏或退出全屏 */
  setScreenState() {
    const state = !document.fullscreenElement;
    state ? document.documentElement.requestFullscreen() : document.exitFullscreen();
  },
};

export default defineComponent({
  name: 'WindowStateBar',

  props: {
    // 指定是否为viewer, 默认为false
    viewer: {type: Boolean, default: false}
  },

  setup() {
    if (api.initialized) {
      return api;
    }

    api.initialized = true;

    const {electron: electronApi} = window as any;

    // 若是electron环境
    if (electronApi) {
      // 添加窗口状态监听
      electronApi.onWindowStateChange((event: any, isMaximize: boolean) =>
          void (api.isMaximized.value = isMaximize));

      // 监听可视窗口大小, 以检测是否处于窗口最大化状态
      window.addEventListener('resize', () => {
        electronApi.getWindowState().then((isMaximize: boolean) =>
            void (api.isMaximized.value = isMaximize));
      });

      // 主动获取一次窗口是否最大化
      electronApi.getWindowState().then((isMaximize: boolean) =>
          void (api.isMaximized.value = isMaximize));
    }

    return api;
  }

});
</script>