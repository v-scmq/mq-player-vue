<template>
  <div class="title-bar v-row">
    <div class="v-row no-drag fixed-left-bar" style="padding:4px;">
      <!--  用户头像图片 -->
      <img alt draggable="false" class="user-icon image" :src="user.headURL" v-if="user.uin" @click="openLoginModal"/>

      <!-- 用户未登录时,使用默认的SVG图标显示 -->
      <div class="user-icon container" v-else>
        <svg class="icon" viewBox="0 0 16 16" @click="login">
          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        </svg>
      </div>

      <span class="user-name" :title="user.nickName" @click="user.uin ? openLoginModal() : login($event)">
        {{ user.uin ? user.nickName : '点击登录' }}
      </span>
    </div>

    <div class="v-row option-container no-drag" style="margin:0 4px 0 16px;">
      <!-- 后退 -->
      <svg class="icon back" viewBox="0 0 1024 1024" style="margin-left:0" @click="back"
           :class="{'disabled':backLength===0}">
        <path d="M736.256 1024 224.256 512 736.256 0 799.744 63.744 351.488 512 799.744 960.512Z"/>
      </svg>

      <!-- 前进 -->
      <svg class="icon forward" viewBox="0 0 1024 1024" style="transform:rotate(180deg)" @click="forward"
           :class="{'disabled':forwardLength===0}">
        <path d="M736.256 1024 224.256 512 736.256 0 799.744 63.744 351.488 512 799.744 960.512Z"/>
      </svg>

      <!-- 刷新 -->
      <svg class="icon" viewBox="0 0 1024 1024" @click="refresh">
        <path
            d="M911.40249 607.60166c-21.244813-4.248963-46.738589 8.497925-50.987552 29.742738-42.489627 174.207469-195.452282 293.178423-373.908714 293.178424-212.448133 0-386.655602-174.207469-386.655602-386.655602s174.207469-386.655602 386.655602-386.655602c97.726141 0 195.452282 38.240664 263.435685 106.224067h-178.456432c-21.244813 0-42.489627 16.995851-42.489626 42.489626 0 21.244813 16.995851 42.489627 42.489626 42.489627h263.435685c21.244813 0 42.489627-16.995851 42.489626-42.489627v-263.435684c0-21.244813-16.995851-42.489627-42.489626-42.489627-21.244813 0-42.489627 16.995851-42.489627 42.489627v148.713693c-84.979253-76.481328-195.452282-118.970954-310.174274-118.970955-259.186722 0-471.634855 212.448133-471.634854 471.634855s212.448133 471.634855 471.634854 471.634855c216.697095 0 403.651452-148.713693 458.887967-356.912863 4.248963-21.244813-8.497925-42.489627-29.742738-50.987552z"/>
      </svg>

      <text-field style="margin:0 0 0 8px" placeholder="请输入内容" v-model="searchInput"
                  @keyup.native.enter="openNetSearchView"/>
    </div>

    <div class="v-row window-tool no-drag" style="flex:1;justify-content:flex-end;">
      <!-- 皮肤 -->
      <svg class="icon-menu skin viewer-hidden" viewBox="64 64 896 896" width="1em" height="1em">
        <path
            d="M870 126H663.8c-17.4 0-32.9 11.9-37 29.3C614.3 208.1 567 246 512 246s-102.3-37.9-114.8-90.7a37.93 37.93 0 0 0-37-29.3H154a44 44 0 0 0-44 44v252a44 44 0 0 0 44 44h75v388a44 44 0 0 0 44 44h478a44 44 0 0 0 44-44V466h75a44 44 0 0 0 44-44V170a44 44 0 0 0-44-44zm-28 268H723v432H301V394H182V198h153.3c28.2 71.2 97.5 120 176.7 120s148.5-48.8 176.7-120H842v196z"></path>
      </svg>

      <!-- 设置 -->
      <svg class="icon-menu setting viewer-hidden" viewBox="64 64 896 896" width="1em" height="1em">
        <path
            d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1 0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1 74.7 63.9a370.03 370.03 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5 0-15.3 1.2-30.6 3.7-45.5l6.5-40-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2 31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3 17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97 38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8 92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2z"></path>
      </svg>

      <!-- 隐藏播放详情视图(播放详情时可见) -->
      <svg class="icon-menu viewer-show hide-viewer" viewBox="0 0 16 16" style="margin:0 auto 0 0.5em;">
        <path
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
      </svg>

      <!-- 全屏/退出全屏(播放详情时可见) -->
      <svg class="icon-menu screen viewer-show" viewBox="0 0 30 30" @click="setScreenState">
        <path :d="screenStateIcon"/>
      </svg>

      <!-- 图标分割符 -->
      <span class="separator viewer-hidden"></span>

      <!-- 窗口最小化状态控制 -->
      <svg class="icon-menu state-icon" viewBox="64 64 896 896" @click="minimize">
        <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path>
      </svg>

      <!-- 窗口最大化/还原状态控制 -->
      <svg class="icon-menu state-icon" viewBox="0 0 1024 1024" @click="maximizeOrRestore">
        <path :d="icon"/>
      </svg>

      <!-- 窗口关闭控制  -->
      <svg class="icon-menu close state-icon" viewBox="0 0 1024 1024" @click="closeWindow">
        <path
            d="M566.97558594 521.09667969L856.8828125 231.18945312c14.63378906-14.63378906 14.63378906-38.75976563 0-53.39355468l-1.58203125-1.58203125c-14.63378906-14.63378906-38.75976563-14.63378906-53.39355469 0L512 466.51660156 222.09277344 176.21386719c-14.63378906-14.63378906-38.75976563-14.63378906-53.39355469 0l-1.58203125 1.58203125c-15.02929688 14.63378906-15.02929688 38.75976563 0 53.39355469l289.90722656 289.90722656L167.1171875 811.00390625c-14.63378906 14.63378906-14.63378906 38.75976563 0 53.39355469l1.58203125 1.58203125c14.63378906 14.63378906 38.75976563 14.63378906 53.39355469 0L512 576.07226563 801.90722656 865.97949219c14.63378906 14.63378906 38.75976563 14.63378906 53.39355469 0l1.58203125-1.58203125c14.63378906-14.63378906 14.63378906-38.75976563 0-53.39355469L566.97558594 521.09667969z"></path>
      </svg>
    </div>

    <modal title="QQ登录" ref="loginModal" id="login-modal" width="600px" height="400px">
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
        <button-base text="退出" @click="logout"/>
      </template>
    </modal>
  </div>
</template>

<script>
// 未最大化时的图标
const MAXIMIZE_ICON = 'M209.37187512 209.37187512v605.25624975h605.25624975V209.37187512H209.37187512zM133.71484392 133.71484392h756.57031216v756.57031216H133.71484392V133.71484392z';
// 已最大化是的图标
const MAXIMIZED_ICON = 'M865 107H341.5c-27.8 0-50.3 22.5-50.3 50.3v100.6H160.6c-27.8 0-50.3 22.5-50.3 50.3v553.4c0 27.8 22.5 50.3 50.3 50.3H714c27.8 0 50.3-22.5 50.3-50.3V730.4H865c27.8 0 50.3-22.5 50.3-50.3V157.3c0-27.8-22.5-50.3-50.3-50.3zM704.1 680.1v171.6H170.6V319.3H704v360.8z m149.9-9l-89.6-1V308.3c0-27.8-22.5-50.3-50.3-50.3H351.5v-90.6H856l-2 503.7z m9-1';

// 未全屏时的图标
const FULL_SCREEN_ICON = 'M23 25h-4v-2h2.63l-5.753-5.658 1.354-1.331 5.769 5.674v-2.685h2v6h-2zm0-15.669l-5.658 5.658-1.331-1.331 5.658-5.658h-2.669v-2h6v6h-2v-2.669zm-15.027 15.669h4.027v-2h-2.676l5.676-5.658-1.335-1.331-5.692 5.674v-2.685h-1.973v6h1.973zm0-15.669l5.581 5.658 1.313-1.331-5.582-5.658h2.715v-2h-6v6h1.973v-2.669z';
// 已全屏时的图标
const FULLED_SCREEN_ICON = 'M22 12v2h-6v-6h2v2.669l5.658-5.658 1.331 1.331-5.658 5.658h2.669zm-10 7.331l-5.658 5.658-1.331-1.331 5.658-5.658h-2.669v-2h6v6h-2v-2.669zm-4-7.331h2.669l-5.658-5.658 1.331-1.331 5.658 5.658v-2.669h2v6h-6v-2zm14 6h-2.669l5.658 5.658-1.331 1.331-5.658-5.658v2.669h-2v-6h6v2z';
export default {
  name: "Header",

  data: () => ({
    icon: null,
    backLength: 0,
    forwardLength: 0,
    screenStateIcon: null,
    searchInput: '',
    // 用户基本信息
    user: {uin: '', headURL: '', nickName: ''}
  }),

  created() {
    let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
    if (ipcRender) {
      ipcRender.invoke('get-window-state').then(state => {
        this.icon = state ? MAXIMIZED_ICON : MAXIMIZE_ICON;
        this.$el.classList.toggle('un-maximized', state);
      });

      // 当窗口最大化时,显示为已经最大化的图标
      ipcRender.on('maximized', () => {
        this.icon = MAXIMIZED_ICON;
        this.$el.classList.toggle('un-maximized', false);
      });

      // 当窗口未最大化时,显示为需要最大化图标
      ipcRender.on('restored', () => {
        this.icon = MAXIMIZE_ICON;
        this.$el.classList.toggle('un-maximized', true);
      });

    } else {
      // 当窗口最大化时,显示为已经最大化的图标
      this.icon = document.fullscreenElement ? MAXIMIZED_ICON : MAXIMIZE_ICON;
    }

    // 初始检测是否进入全屏状态
    this.screenStateIcon = document.fullscreenElement ? FULLED_SCREEN_ICON : FULL_SCREEN_ICON;

    this._routeable = null;
    this.$router.afterEach((to, from) => {
      if (from.path === '/' || !this._routeable) {
        this._routeable = true;
        return;
      }

      if (this.backLength === 0) {
        this.forwardLength = 0;
        let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
        ipcRender ? ipcRender.invoke('clear-history') : null;
      }
      ++this.backLength;
    });

    // 尝试登录
    this.$nextTick(this.login);
  },

  methods: {
    /** 后退 */
    back() {
      if (this.backLength) {
        this._routeable = false;
        this.$router.back();
        ++this.forwardLength;
        --this.backLength;
      }
    },

    /** 前进 */
    forward() {
      if (this.forwardLength) {
        this._routeable = false;
        this.$router.forward();
        --this.forwardLength;
        ++this.backLength;
      }
    },

    /** 刷新 */
    refresh() {
      location.reload();
    },

    /** 最小化窗口 */
    minimize() {
      let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
      ipcRender ? ipcRender.invoke('window-minimize') : null;
    },

    /** 最大化或还原窗口 */
    maximizeOrRestore() {
      let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
      if (ipcRender) {
        ipcRender.invoke('window-maximize-restore');

      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          // 当窗口未最大化时,显示为需要最大化图标
          this.icon = MAXIMIZE_ICON;
        } else {
          document.documentElement.requestFullscreen();
          // 当窗口最大化时,显示为已经最大化的图标
          this.icon = MAXIMIZED_ICON;
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
      this.screenStateIcon = state ? FULLED_SCREEN_ICON : FULL_SCREEN_ICON;
      this.$el.classList.toggle('full-screen', state);
    },

    /** 打开登录模态框 */
    openLoginModal() {
      this.$refs.loginModal.open();
    },

    /**
     * 开始登录
     *
     * @param event {MouseEvent | null} 鼠标事件,若没有鼠标事件,则认为主动调用
     */
    login(event) {
      let param = {
        db: this.$db,                                                   // indexDB
        channel: 'open-modal',                                          // ipc通信标记
        isManual: event instanceof MouseEvent,                          // 是否是手动调用登录
        ipcRender: this.$electron ? this.$electron.ipcRenderer : null,  // ipc渲染进程通信API
      };

      this.$spinner.open();
      this.$source.impl.login(param)
          .then(user => this.user = user || {})
          .catch(reason => this.$message.error(reason.message))
          .finally(this.$spinner.close);
    },

    /**
     * 开始退出登录
     * @param event {MouseEvent | null} 鼠标事件,若没有鼠标事件,则认为主动调用
     */
    logout(event) {
      let uin = this.user ? this.user.uin : null;
      this.user = {};

      if (!uin) {
        return;
      }

      let param = {
        uin,
        db: this.$db,                                                   // indexDB
        channel: 'remove-all-cookie',                                   // ipc通信标记
        isManual: event instanceof MouseEvent,                          // 是否是手动调用退出登录
        ipcRender: this.$electron ? this.$electron.ipcRenderer : null   // ipc渲染进程通信API
      };

      // 若是手动调用模式,则先关闭登录模态框
      param.isManual ? this.$refs.loginModal.close() : null;
      this.$source.impl.logout(param);
    },

    /** 打开资源搜索页面 */
    openNetSearchView() {
      let value = this.searchInput;
      if (!value) {
        return;
      }

      const viewPath = '/net-search-view', {path, query} = this.$route;

      // 若当前路径相同且查询参数相同, 则什么也不做; 否则则跳转到搜索页面
      return (path === viewPath && query.value === value) ? null :
          this.$router.push({path: viewPath, query: {value}});
    }
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
