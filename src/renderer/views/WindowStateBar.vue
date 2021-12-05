<template>
  <div class='v-row window-state-bar' :class='{viewer}'>
    <slot></slot>

    <!-- 全屏/退出全屏(播放详情时可见) -->
    <icon class='screen' :name='isFullScreen ? "fulled-screen" :"full-screen" '
          @click='setScreenState' v-if='viewer'/>

    <!-- 图标分割符 -->
    <span class='separator' v-else></span>

    <!-- 窗口最小化状态控制 -->
    <icon name='minimize' @click='minimize'/>

    <!-- 窗口最大化/还原状态控制 -->
    <icon :name='isMaximized ? "maximized" : "maximize" ' @click='maximizeOrRestore'/>

    <!-- 窗口关闭控制  -->
    <icon class='close' name='close' @click='closeWindow'/>
  </div>
</template>

<script lang='ts'>
import {ref, onBeforeUnmount, defineComponent} from 'vue';

export default defineComponent({
  name: 'WindowStateBar',

  props: {
    // 指定是否为viewer, 默认为false
    viewer: {type: Boolean, default: false}
  },

  setup() {
    const isMaximized = ref(false);
    // 初始检测是否进入全屏状态
    const isFullScreen = ref(!!document.fullscreenElement);

    const {electron: electronApi} = window as any;

    // 若是electron环境
    if (electronApi) {
      /**
       * 监听窗口状态变化
       *
       * @param {Electron.IpcRendererEvent | null} event IPC渲染器事件
       * @param {boolean} isMaximize true:窗口已最大化, false:窗口已被还原
       */
      const onWindowStateChange = (event: any, isMaximize: boolean) => {
        // 当窗口最大化时,显示为已经最大化的图标
        isMaximized.value = isMaximize;
      };

      // 获取窗口状态
      electronApi.getWindowState().then((isMaximize: boolean) => onWindowStateChange(null, isMaximize));

      // 生成随机的id, 用于关联回调方法
      const callbackId = `${Math.random()}-${new Date().getTime()}`;

      // 添加窗口状态监听
      electronApi.onWindowStateChange(onWindowStateChange, callbackId);
      // 当组件将被解除卸载前, 移除窗口状态监听
      onBeforeUnmount(() => electronApi.onWindowStateChange(null, callbackId));

    } else {
      // 当窗口最大化时,显示为已经最大化的图标
      isMaximized.value = !!document.fullscreenElement;
    }

    return {
      isMaximized, isFullScreen,

      /** 最小化窗口 */
      minimize() {
        electronApi && electronApi.setWindowMinimize();
      },

      /** 最大化或还原窗口 */
      maximizeOrRestore() {
        if (electronApi) {
          electronApi.setWindowMaximizeOrRestore();
        } else {
          if (document.fullscreenElement) {
            document.exitFullscreen();
            // 当窗口未最大化时,显示为需要最大化图标
            isMaximized.value = false;
          } else {
            document.documentElement.requestFullscreen();
            // 当窗口最大化时,显示为已经最大化的图标
            isMaximized.value = true;
          }
        }
      },

      /** 关闭窗口 */
      closeWindow() {
        window.close();
      },

      /** 设置全屏或退出全屏 */
      setScreenState() {
        const state = !document.fullscreenElement;
        state ? document.body.requestFullscreen() : document.exitFullscreen();
      },
    };
  }

});
</script>