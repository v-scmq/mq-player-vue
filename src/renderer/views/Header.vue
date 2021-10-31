<template>
  <div class="title-bar v-row" ref="el">
    <div class="v-row no-drag fixed-left-bar" style="padding:4px;">
      <!--  用户头像图片 -->
      <img alt draggable="false" class="user-icon image" :src="user.headURL" v-if="user.uin"
           @click='loginModal = true'/>

      <!-- 用户未登录时,使用默认的SVG图标显示 -->
      <div class="user-icon container" v-else>
        <icon name="user" @click="login"/>
      </div>

      <span class="user-name" :title="user.nickName" @click='user.uin ? (loginModal = true) : login($event)'>
        {{ user.uin ? user.nickName : '点击登录' }}
      </span>
    </div>

    <div class="v-row option-container no-drag" style="margin:0 4px 0 16px;">
      <!-- 后退 -->
      <icon class="back" name="back" :class="{disabled: backLength === 0}" style="margin-left:0" @click="back"/>
      <!-- 前进 -->
      <icon class="forward" name="back" style="transform:rotate(180deg)" @click="forward"
            :class="{disabled : forwardLength === 0}"/>
      <!-- 刷新 -->
      <icon name="refresh" @click="refresh" style="margin:0 8px 0 0"/>

      <text-field placeholder="请输入内容" v-model="searchInput" suffixIcon="search" @keyup.enter="openNetSearchView"/>
    </div>

    <div class="v-row window-tool no-drag" style="flex:1;justify-content:flex-end;">
      <!-- 皮肤 -->
      <icon class="icon-menu skin viewer-hidden" name="skin"/>
      <!-- 设置 -->
      <icon class="icon-menu setting viewer-hidden" name="setting" @click='openSystemSetting'/>
      <!-- 隐藏播放详情视图(播放详情时可见) -->
      <icon class="icon-menu viewer-show hide-viewer" name="arrow-down" style="margin:0 auto 0 0.5em;"/>

      <!-- 全屏/退出全屏(播放详情时可见) -->
      <icon class="icon-menu screen viewer-show" :name="isFullScreen ? 'fulled-screen' :'full-screen' "
            @click="setScreenState"/>
      <!-- 图标分割符 -->
      <span class="separator viewer-hidden"></span>

      <!-- 窗口最小化状态控制 -->
      <icon class="icon-menu state-icon" name="minimize" @click="minimize"/>

      <!-- 窗口最大化/还原状态控制 -->
      <icon class="icon-menu state-icon" :name="isMaximized ? 'maximized' : 'maximize' " @click="maximizeOrRestore"/>

      <!-- 窗口关闭控制  -->
      <icon class="icon-menu close state-icon" name="close" @click="closeWindow"/>
    </div>

    <modal title="QQ登录" id="login-modal" width="600px" height="400px" v-model:visible='loginModal'>
      <template v-slot:content>
        <div class="v-column" style="color:var(--text-base);font-size:18px;flex:1;justify-content:space-around;">
          <div>账号：{{ user.uin }}</div>
          <div>昵称：{{ user.nickName }}</div>
          <template v-if="user.greenDiamondLevel">
            <div class="v-row">
              豪华绿钻等级：<img alt style="margin:-0.5em 0 0 0;" :src="user.greenLevelCover"/>
            </div>
            <div>会员开通时间：{{ user.greenDiamondStartTime }}</div>
            <div>会员到期时间：{{ user.greenDiamondEndTime }}</div>
          </template>

          <template v-if="user.payBillLevel">
            <div class="v-row">
              付费包等级：<img alt style="margin:-0.5em 0 0 0;" :src="user.payBillLevelCover"/>
            </div>
            <div>会员开通时间：{{ user.payBillStartTime }}</div>
            <div>会员到期时间：{{ user.payBillEndTime }}</div>
          </template>
        </div>
        <Button text="退出" @click="logout"/>
      </template>
    </modal>
  </div>
</template>

<script>
import {nextTick, reactive, ref, getCurrentInstance} from "vue";
import {useRoute, useRouter} from "vue-router";

export default {
  name: "Header",

  setup() {
    const isMaximized = ref(false);
    const backLength = ref(0);
    const forwardLength = ref(0);
    const isFullScreen = ref(false);
    const searchInput = ref('');
    const loginModal = ref(false);

    /** @type {any} 用户基本信息 */
    const user = reactive({uin: '', nickName: '', headURL: ''});

    const vc = getCurrentInstance();
    const {$message, $spinner, $db, $source} = vc.appContext.config.globalProperties;

    const router = useRouter(), route = useRoute();

    let navigation = null;

    /**
     * 开始登录
     *
     * @param event {MouseEvent | null} 鼠标事件,若没有鼠标事件,则认为主动调用
     */
    const login = event => {
      let param = {
        db: $db,                                                   // indexDB
        isManual: event instanceof MouseEvent,                     // 是否是手动调用登录
      };

      $spinner.open();
      $source.impl.login(param)
          .then(userObj => userObj ? Object.assign(user, userObj) : null)
          .catch(reason => $message.error(reason.message))
          .finally($spinner.close);
    };

    if (window.electron) {
      window.electron.getWindowState().then(/** @param state {boolean}*/state => {
        isMaximized.value = state;
        vc.refs.el.classList.toggle('un-maximized', state);
      });

      // 当窗口最大化时,显示为已经最大化的图标
      window.electron.setOnWindowMaximized(() => {
        isMaximized.value = true;
        vc.refs.el.classList.toggle('un-maximized', false);
      });

      // 当窗口未最大化时,显示为需要最大化图标
      window.electron.setOnWindowRestore(() => {
        isMaximized.value = false;
        vc.refs.el.classList.toggle('un-maximized', true);
      });

    } else {
      // 当窗口最大化时,显示为已经最大化的图标
      isMaximized.value = !!document.fullscreenElement;
    }

    router.afterEach((to, from) => {
      if (from.path === '/' || !navigation) {
        navigation = true;
        return;
      }

      if (backLength.value === 0) {
        forwardLength.value = 0;
        // window.electron ? window.electron.clearHistory() : null;
      }
      ++backLength.value;
    });

    // 尝试登录
    nextTick(login);

    // 初始检测是否进入全屏状态
    isFullScreen.value = !!document.fullscreenElement;

    return {
      loginModal, isMaximized, backLength, forwardLength, isFullScreen, searchInput, user,
      /** 后退 */
      back() {
        if (backLength.value) {
          navigation = false;
          router.back();
          ++forwardLength.value;
          --backLength.value;
        }
      },

      /** 前进 */
      forward() {
        if (forwardLength.value) {
          navigation = false;
          router.forward();
          --forwardLength.value;
          ++backLength.value;
        }
      },

      /** 刷新 */
      refresh() {
        location.reload();
      },

      /** 最小化窗口 */
      minimize() {
        window.electron ? window.electron.setWindowMinimize() : null;
      },

      /** 最大化或还原窗口 */
      maximizeOrRestore() {
        if (window.electron) {
          window.electron.setWindowMaximizeOrRestore();
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
        let node = document.querySelector('#music-viewer');
        let state = !(document.fullscreenElement || !node);
        state ? node.requestFullscreen() : document.exitFullscreen();
        isFullScreen.value = state;
        vc.refs.el.classList.toggle('full-screen', state);
      },

      login,

      /**
       * 开始退出登录
       * @param event {MouseEvent | null} 鼠标事件,若没有鼠标事件,则认为主动调用
       */
      logout(event) {
        let uin = user ? user.uin : null;
        if (!uin) {
          return;
        }
        user.uin = '';

        let param = {
          uin,
          db: $db,                                                   // indexDB
          isManual: event instanceof MouseEvent,                     // 是否是手动调用退出登录
        };

        // 若是手动调用模式,则先关闭登录模态框
        param.isManual ? (loginModal.value = false) : null;
        $source.impl.logout(param);
      },

      /** 打开资源搜索页面 */
      openNetSearchView() {
        let value = searchInput.value;
        if (!value) {
          return;
        }

        const viewPath = '/net-search-view', {path, query} = route;

        // 若当前路径相同且查询参数相同, 则什么也不做; 否则则跳转到搜索页面
        return (path === viewPath && query.value === value) ? null :
            router.push({path: viewPath, query: {value}});
      },

      openSystemSetting() {
        const viewPath = '/system-setting', path = route.path;
        if (path !== viewPath) {
          router.push({path: viewPath});
        }
      }
    };
  }
}
</script>

<style scoped>
.title-bar {
  -webkit-app-region: drag;
}

.title-bar.un-maximized {
  margin: 2px 2px 0 2px; /* 设置间距,用以鼠标在窗口边沿操作(如缩放)*/
}

.title-bar .no-drag > * {
  -webkit-app-region: no-drag;
}

.title-bar .user-icon.image {
  width: 3em;
  height: 3em;
  background: none;
  border-radius: 3em;
}

.title-bar .user-icon.container {
  width: 3em;
  height: 3em;
  overflow: hidden;
  border-radius: 3em;
  box-sizing: border-box;
  background: rgb(188, 191, 193);
}

.title-bar .user-icon.container > .icon {
  width: 4em;
  height: 4em;
  margin: 0 0 0 -8px;
  fill: rgb(251, 251, 251);
}

.title-bar .user-name {
  margin: 0 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.title-bar .window-tool > .icon-menu {
  margin: 2px 8px;
  padding: 6px;
}

.title-bar .window-tool > .separator {
  height: 1em;
  display: flex;
  margin: 0 0.5em;
  border-left: 2px solid #222;
}

.title-bar:not(.viewer) > .window-tool > .icon-menu:hover {
  background: rgba(210, 212, 216, 0.8);
}

.title-bar:not(.viewer) > .window-tool > .icon-menu.close:hover {
  background: rgb(232, 17, 35);
  fill: white;
}

.title-bar.viewer > .window-tool > .icon-menu:hover {
  cursor: pointer;
  fill: #f56c6c;
  /*#eebe76*/
}

.title-bar .icon.disabled {
  opacity: 0.2;
  pointer-events: none;
}

.title-bar > .option-container > .icon {
  margin: 0 4px;
  padding: 6px;
  width: 1em;
  height: 1em;
}

.title-bar > .option-container > .icon:hover {
  background: rgba(210, 212, 216, 0.8);
}

.title-bar:not(.viewer) > .window-tool > .icon-menu {
  width: 1em;
  height: 1em;
}

.title-bar.viewer > .window-tool > .viewer-show {
  width: 1.75em;
  height: 1.75em;
}

.title-bar.viewer > .window-tool > .state-icon {
  width: 1.5em;
  height: 1.5em;
}

.title-bar.viewer > .window-tool .icon-menu {
  fill: rgb(210, 210, 210);
}

.title-bar:not(.viewer) > .window-tool > .viewer-show,
.title-bar.viewer > .fixed-left-bar,
.title-bar.viewer > .option-container,
.title-bar.viewer > .window-tool > .viewer-hidden,
.title-bar.viewer.full-screen > .window-tool > .state-icon {
  display: none;
}
</style>
