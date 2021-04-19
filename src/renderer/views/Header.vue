<template>
  <div class="title-bar v-row" :class="{'margin-top' : icon===$data.$maximizeIcon }">
    <div class="v-row no-drag fixed-left-bar" style="padding:4px;">
      <!-- 在后期会使用用户头像图片 -->
      <!-- <img class="user-icon" src="" alt/> -->

      <div class="user-icon container">
        <svg class="icon" viewBox="0 0 16 16"> <!-- 用户未登录时,使用默认的SVG图标显示 -->
          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        </svg>
      </div>

      <span style="white-space:nowrap;margin:0 8px">未登录</span>
    </div>

    <div class="v-row option-container no-drag">
      <svg class="icon back" viewBox="0 0 1024 1024" style="margin-left:0" @click="back"
           :class="{'disabled':backLength===0}">
        <path d="M736.256 1024 224.256 512 736.256 0 799.744 63.744 351.488 512 799.744 960.512Z"/>
      </svg>
      <svg class="icon forward" viewBox="0 0 1024 1024" style="transform:rotate(180deg)" @click="forward"
           :class="{'disabled':forwardLength===0}">
        <path d="M736.256 1024 224.256 512 736.256 0 799.744 63.744 351.488 512 799.744 960.512Z"/>
      </svg>

      <svg class="icon" viewBox="0 0 1024 1024" @click="refresh">
        <path
            d="M911.40249 607.60166c-21.244813-4.248963-46.738589 8.497925-50.987552 29.742738-42.489627 174.207469-195.452282 293.178423-373.908714 293.178424-212.448133 0-386.655602-174.207469-386.655602-386.655602s174.207469-386.655602 386.655602-386.655602c97.726141 0 195.452282 38.240664 263.435685 106.224067h-178.456432c-21.244813 0-42.489627 16.995851-42.489626 42.489626 0 21.244813 16.995851 42.489627 42.489626 42.489627h263.435685c21.244813 0 42.489627-16.995851 42.489626-42.489627v-263.435684c0-21.244813-16.995851-42.489627-42.489626-42.489627-21.244813 0-42.489627 16.995851-42.489627 42.489627v148.713693c-84.979253-76.481328-195.452282-118.970954-310.174274-118.970955-259.186722 0-471.634855 212.448133-471.634854 471.634855s212.448133 471.634855 471.634854 471.634855c216.697095 0 403.651452-148.713693 458.887967-356.912863 4.248963-21.244813-8.497925-42.489627-29.742738-50.987552z"/>
      </svg>
      <text-field style="margin:0 0 0 8px" placeholder="请输入内容" v-model="searchInput"/>
    </div>

    <div class="v-row window-tool no-drag">
      <svg class="icon-menu skin" viewBox="64 64 896 896" width="1em" height="1em">
        <path
            d="M870 126H663.8c-17.4 0-32.9 11.9-37 29.3C614.3 208.1 567 246 512 246s-102.3-37.9-114.8-90.7a37.93 37.93 0 0 0-37-29.3H154a44 44 0 0 0-44 44v252a44 44 0 0 0 44 44h75v388a44 44 0 0 0 44 44h478a44 44 0 0 0 44-44V466h75a44 44 0 0 0 44-44V170a44 44 0 0 0-44-44zm-28 268H723v432H301V394H182V198h153.3c28.2 71.2 97.5 120 176.7 120s148.5-48.8 176.7-120H842v196z"></path>
      </svg>

      <svg class="icon-menu" viewBox="64 64 896 896" width="1em" height="1em">
        <path
            d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1 0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1 74.7 63.9a370.03 370.03 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5 0-15.3 1.2-30.6 3.7-45.5l6.5-40-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2 31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3 17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97 38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8 92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2z"></path>
      </svg>

      <span style="display:flex;height:18px;border-left:2px solid #222;margin:0 12px"></span>

      <svg class="icon-menu minimize" viewBox="64 64 896 896" width="1em" height="1em" @click="minimize">
        <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path>
      </svg>
      <svg class="icon-menu" width="1em" height="1em" viewBox="0 0 1024 1024" @click="maximizeOrRestore">
        <path :d="icon"/>
      </svg>

      <svg class="icon-menu close" viewBox="0 0 1024 1024" width="1em" height="1em" @click="closeWindow">
        <path
            d="M566.97558594 521.09667969L856.8828125 231.18945312c14.63378906-14.63378906 14.63378906-38.75976563 0-53.39355468l-1.58203125-1.58203125c-14.63378906-14.63378906-38.75976563-14.63378906-53.39355469 0L512 466.51660156 222.09277344 176.21386719c-14.63378906-14.63378906-38.75976563-14.63378906-53.39355469 0l-1.58203125 1.58203125c-15.02929688 14.63378906-15.02929688 38.75976563 0 53.39355469l289.90722656 289.90722656L167.1171875 811.00390625c-14.63378906 14.63378906-14.63378906 38.75976563 0 53.39355469l1.58203125 1.58203125c14.63378906 14.63378906 38.75976563 14.63378906 53.39355469 0L512 576.07226563 801.90722656 865.97949219c14.63378906 14.63378906 38.75976563 14.63378906 53.39355469 0l1.58203125-1.58203125c14.63378906-14.63378906 14.63378906-38.75976563 0-53.39355469L566.97558594 521.09667969z"></path>
      </svg>

    </div>
  </div>

</template>

<script>
export default {
  name: "Header",

  data: () => ({
    searchInput: "",
    $maximizeIcon: 'M209.37187512 209.37187512v605.25624975h605.25624975V209.37187512H209.37187512zM133.71484392 133.71484392h756.57031216v756.57031216H133.71484392V133.71484392z',
    $maximizedIcon: 'M865 107H341.5c-27.8 0-50.3 22.5-50.3 50.3v100.6H160.6c-27.8 0-50.3 22.5-50.3 50.3v553.4c0 27.8 22.5 50.3 50.3 50.3H714c27.8 0 50.3-22.5 50.3-50.3V730.4H865c27.8 0 50.3-22.5 50.3-50.3V157.3c0-27.8-22.5-50.3-50.3-50.3zM704.1 680.1v171.6H170.6V319.3H704v360.8z m149.9-9l-89.6-1V308.3c0-27.8-22.5-50.3-50.3-50.3H351.5v-90.6H856l-2 503.7z m9-1',
    icon: null,
    backLength: 0,
    forwardLength: 0
  }),

  created() {
    let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
    if (ipcRender) {
      ipcRender.invoke('request-window-state').then(state =>
          this.icon = state ? this.$data.$maximizedIcon : this.$data.$maximizeIcon);

      // 当窗口最大化时,显示为已经最大化的图标
      ipcRender.on('maximized', () => this.icon = this.$data.$maximizedIcon);
      // 当窗口未最大化时,显示为需要最大化图标
      ipcRender.on('restored', () => this.icon = this.$data.$maximizeIcon);

    } else {
      this.icon = this.$data.$maximizeIcon;
    }

    this._routeable = null;
    this.$router.afterEach((to, from) => {
      if (from.path === '/' || !this._routeable) {
        this._routeable = true;
        return;
      }

      if (this.backLength === 0) {
        this.forwardLength = 0;
        let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
        ipcRender ? ipcRender.send('request-clear-history') : null;
      }
      ++this.backLength;
    });
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
      let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
      ipcRender ? ipcRender.send('request-reload') : null;
    },

    /** 最小化窗口 */
    minimize() {
      let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
      ipcRender ? ipcRender.send('window-minimize') : null;
    },

    /** 最大化或还原窗口 */
    maximizeOrRestore() {
      let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
      ipcRender ? ipcRender.send('window-maximize-restore') : null;
      // document.fullscreen ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    },

    /** 关闭窗口 */
    closeWindow() {
      // let ipcRender = this.$electron ? this.$electron.ipcRenderer : null;
      // ipcRender ? ipcRender.send('window-close') : window.close();
      // window.close();
      window.open("about:blank", "_top").close();
      window.opener = null;
      window.close();
    }
  }
}
</script>

<style scoped>
.title-bar {
  -webkit-app-region: drag;
}

.title-bar.margin-top {
  margin: 2px 2px 0 2px; /* 设置间距,用以鼠标在窗口边沿操作(如缩放)*/
}

.title-bar .no-drag > * {
  -webkit-app-region: no-drag;
}

img.user-icon {
  width: 3em;
  height: 3em;
  background: none;
  border-radius: 3em;
}

.container.user-icon {
  width: 3em;
  height: 3em;
  overflow: hidden;
  border-radius: 3em;
  box-sizing: border-box;
  background: rgb(188, 191, 193);
}

.container.user-icon > .icon {
  width: 4em;
  height: 4em;
  margin: 0 0 0 -8px;
  fill: rgb(251, 251, 251);
}

.window-tool.v-row > .icon-menu {
  margin: 2px 8px;
  padding: 6px;
}

.window-tool.v-row > .icon-menu:hover {
  background: rgba(210, 212, 216, 0.8);
}

.window-tool > .icon-menu.close:hover {
  background: rgb(232, 17, 35);
  fill: white;
}

.option-container {
  margin: 0 auto 0 0;
  padding: 0 0 0 16px;
}

.icon.disabled {
  opacity: 0.2;
  pointer-events: none;
}

.option-container > .icon {
  margin: 0 4px;
  padding: 6px;
  width: 1em;
  height: 1em;
}

.option-container > .icon:hover {
  background: rgba(210, 212, 216, 0.8);
}
</style>
