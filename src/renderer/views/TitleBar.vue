<template>
  <div class='title-bar v-row'>
    <div class='v-row fixed-left-bar' style='padding:4px;'>
      <!--  用户头像图片 -->
      <img alt class='user-icon cover' :src='user.headURI' v-if='user.uin'
           @click='loginModal = true'/>

      <!-- 用户未登录时,使用默认的SVG图标显示 -->
      <icon name='user-circle' class='user-icon' @click='login' v-else/>

      <span class='user-name' :title='user.nickName' @click='user.uin ? (loginModal = true) : login($event)'>
        {{ user.uin ? user.nickName : '点击登录' }}
      </span>
    </div>

    <div class='v-row option-container' style='margin:0 4px 0 16px;'>
      <!-- 后退 -->
      <icon class='back' name='back' :class='{disabled: backLength === 0}' style='margin-left:0' @click='back'/>
      <!-- 前进 -->
      <icon class='forward' name='back' style='transform:rotate(180deg)' @click='forward'
            :class='{disabled : forwardLength === 0}'/>
      <!-- 刷新 -->
      <icon name='refresh' @click='refresh' style='margin:0 8px 0 0'/>

      <text-field placeholder='请输入内容' v-model='searchInput' suffixIcon='search' @keyup.enter='openNetSearchView'/>
    </div>

    <window-state-bar>
      <!-- 皮肤 -->
      <icon class='icon-menu skin viewer-hidden' name='skin'/>
      <!-- 设置 -->
      <icon class='icon-menu setting viewer-hidden' name='setting' @click='openSystemSetting'/>
    </window-state-bar>

    <modal title='QQ登录' id='login-modal' width='600px' height='400px' v-model:visible='loginModal'>
      <template v-slot:content>
        <div class='v-column' style='color:var(--text-base);font-size:18px;flex:1;justify-content:space-around;'>
          <div>账号：{{ user.uin }}</div>
          <div>昵称：{{ user.nickName }}</div>
          <template v-if='user.level'>
            <div class='v-row'>
              VIP等级：<img alt class='cover' style='margin:-0.5em 0 0 0;' :src='user.levelIconURI'/>
            </div>
            <span>会员开通时间：{{ user.startTime }}</span>
            <span>会员到期时间：{{ user.endTime }}</span>
            <span v-if='user.autoPay'>已开启自动续费</span>
          </template>
        </div>
        <Button text='退出' @click='logout'/>
      </template>
    </modal>
  </div>
</template>

<script lang='ts'>
import db from '../database';
import Message from '../components/Message';
import Spinner from '../components/Spinner';

import WindowStateBar from './WindowStateBar.vue';

import {useRoute, useRouter} from 'vue-router';
import {nextTick, reactive, ref, defineComponent} from 'vue';
import {login as loginApi, logout as logoutApi} from '../api';

import {User} from 'src/types';

export default defineComponent({
  name: 'TitleBar',

  components: {WindowStateBar},

  setup() {
    const backLength = ref(0);
    const forwardLength = ref(0);
    const searchInput = ref('');
    const loginModal = ref(false);

    // 用户基本信息
    const user = reactive<User>({} as User);

    const router = useRouter(), route = useRoute();

    let navigation: boolean | null = null;

    router.afterEach((to, from) => {
      if (from.path === '/' || !navigation) {
        navigation = true;
        return;
      }

      if (backLength.value === 0) {
        forwardLength.value = 0;
        // const {electron: electronApi} = window as any;
        // electronApi ? electronApi.clearHistory() : null;
      }
      ++backLength.value;
    });

    /**
     * 开始登录
     *
     * @param event 点击事件,若事件为不存在,则认为主动调用
     */
    const login = async (event: PointerEvent | void) => {
      Spinner.open();

      try {
        /** @type {Electron.Cookie[]} */
        let cookies;

        if (event) {
          const data = await loginApi(null);
          const {option} = data || {};

          if (!option || !option.url) {
            return Message.error('登录失败！');
          }

          const {electron: electronApi} = window as any;
          cookies = electronApi && JSON.parse(await electronApi.openModal(option));

          if (!cookies || cookies.length < 1) {
            return Message.info('已取消登录！');
          }

        } else {
          // 从数据库获取用户信息
          await db.open();
          const usersInfo = await db.queryAll(db.tables.user.name);
          const [{uin = '', cookies: cookieArray = []} = {}] = usersInfo || [];

          cookies = uin && cookieArray;

          if (!cookies || cookies.length < 1) {
            // 中断且不提示任何消息
            return;
          }
        }

        const data = await loginApi(cookies);
        const {user: userInfo, reason} = data;

        if (!userInfo || !userInfo.uin) {
          return Message.error(reason || '未知错误！');
        }

        // 删除indexDB中存储的用户信息
        await db.delete(db.tables.user.name, userInfo.uin);
        // 添加新的用户信息到indexDB中
        await db.insert(db.tables.user.name, userInfo);
        // 将新的用户信息复制到视图展示的user对象上
        Object.assign(user, userInfo);

      } catch (e: any) {
        Message.error(`登录失败： ${e.message} !`);
      } finally {
        Spinner.close();
      }
    };

    // 尝试登录
    nextTick(login);

    return {
      loginModal, backLength, forwardLength, searchInput, user,

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

      login,

      /** 退出登录 */
      logout() {
        if (user.uin) {
          // 删除indexDB中存储的用户信息
          db.delete(db.tables.user.name, user.uin).then(logoutApi).then(data => {
            if (data && data.cookieURL) {
              const {electron: electronApi} = window as any;
              electronApi.removeAllCookie(data.cookieURL);
            }
          });
        }
      },

      /** 打开资源搜索页面 */
      openNetSearchView() {
        const value = searchInput.value;

        if (value) {
          const viewPath = '/net-search-view', {path, query} = route;

          // 若当前路径相同且查询参数相同, 则什么也不做; 否则则跳转到搜索页面
          if ((path !== viewPath || query.value !== value)) {
            router.push({path: viewPath, query: {value}});
          }
        }
      },

      openSystemSetting() {
        const viewPath = '/system-setting', path = route.path;

        if (path !== viewPath) {
          router.push({path: viewPath});
        }
      }
    };
  }

});
</script>