<script lang="ts" setup>
import { db } from '@/database';
import { Message } from '@/components/message';
import { Spinner } from '@/components/spinner';

import CIcon from '@/components/CIcon.vue';
import CModal from '@/components/CModal.vue';
import CButton from '@/components/CButton.vue';
import CInput from '@/components/CInput.vue';

import WindowStateBar from '@/views/WindowStateBar.vue';

import { useRoute, useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { getLoginOption, login as loginApi, logout as logoutApi } from '@/api';

import electron from '@/electron';

import type { User } from '@/types';

// 用户相关记录存储表名称
const USER_TABLE = import.meta.env.VITE_TABLE_USER;

const backLength = ref(0);
const forwardLength = ref(0);
const searchInput = ref('');
const loginModal = ref(false);

// 用户基本信息
const user = reactive({} as User);

const router = useRouter();
const route = useRoute();

let navigation: boolean | null = null;

router.afterEach((/*to, from*/) => {
  if (!navigation) {
    navigation = true;
    return;
  }

  if (backLength.value === 0) {
    forwardLength.value = 0;
  }

  ++backLength.value;
});

/**
 * 开始登录
 *
 * @param event 点击事件,若事件为不存在,则认为主动调用
 */
const login = async (event?: Event) => {
  if (user.id) {
    loginModal.value = true;
    return;
  }

  Spinner.open();

  try {
    let cookies: Electron.Cookie[];
    let uid: string | number = '';

    if (event) {
      const { data, error } = await getLoginOption();

      if (error) {
        return Message.error('获取登录配置失败！');
      }

      cookies = await electron.openLoginView(data);

      if (!cookies || cookies.length < 1) {
        return Message.info('已取消登录！');
      }
    } else {
      // 目前正常情况下最多只有一条数据
      const [user] = await db.query<User>(USER_TABLE /*, void 0, 1*/);
      const { id, cookies: c } = user || {};

      if (!(uid = id) || !(cookies = c) || c.length < 1) {
        return;
      }
    }

    const { error, data } = await loginApi(cookies);

    if (error || !data) {
      // 若网络连接正常情况下, 仍然登录失败, 则删除已存储的用户信息
      // 删除indexDB中存储的用户信息
      navigator.onLine && uid && (await db.delete(USER_TABLE, uid));
    } else {
      // 将新的用户信息复制到视图展示的user对象上
      Object.assign(user, data);
      data.cookies = cookies;
      await db.put(USER_TABLE, data);
    }
  } catch (e: any) {
    Message.error(`登录失败： ${e.message} !`);
  } finally {
    Spinner.close();
  }
};

/** 后退 */
const back = () => {
  if (backLength.value) {
    navigation = false;
    router.back();
    ++forwardLength.value;
    --backLength.value;
  }
};

/** 前进 */
const forward = () => {
  if (forwardLength.value) {
    navigation = false;
    router.forward();
    --forwardLength.value;
    ++backLength.value;
  }
};

/** 刷新 */
const refresh = () => location.reload();

/** 退出登录 */
const logout = async () => {
  loginModal.value = false;

  if (user.id) {
    Spinner.open();
    // 删除indexDB中存储的用户信息
    // await db.delete(USER_TABLE, user.id);
    // 同时只允许单用户存在登录,所以退出后,直接全部清除
    await db.clear(USER_TABLE);
    // 调用退出登录API
    const { data } = await logoutApi();
    // 清除cookie
    electron?.clearCookie(data?.indexURL);
    // 移除user对象上所有属性
    Object.keys(user).forEach(key => delete user[key]);
    Spinner.close();
  }
};

/** 打开资源搜索页面 */
const openNetSearchView = () => {
  const { value } = searchInput;

  if (value) {
    const path = '/net-search-view';
    // 若当前路径相同且查询参数相同, 则什么也不做; 否则则跳转到搜索页面
    if (route.path !== path || route.query.value !== value) {
      router.push({ path, query: { value } });
    }
  }
};

const openSystemSetting = () => {
  const path = '/system-setting';
  route.path !== path && router.push({ path });
};

// 尝试登录
login();
</script>

<template>
  <div class="title-bar row drag">
    <div class="row side-left" style="padding: 10px 0 0 10px">
      <!--  用户头像图片 -->
      <img alt="" class="user-icon c-image" :src="user.avatar" v-if="user.id" @click="loginModal = true" />

      <!-- 用户未登录时,使用默认的SVG图标显示 -->
      <c-icon name="user-circle" class="user-icon" @click="login" v-else />

      <span class="user-name" :title="user.nickName" @click="login">
        {{ user.id ? user.nickName : '点击登录' }}
      </span>
    </div>

    <div class="row option-container">
      <!-- 后退 -->
      <c-icon class="back" name="back" :class="{ disabled: backLength === 0 }" style="margin-left: 0" @click="back" />
      <!-- 前进 -->
      <c-icon
        class="forward"
        name="back"
        style="transform: rotate(180deg)"
        @click="forward"
        :class="{ disabled: forwardLength === 0 }"
      />
      <!-- 刷新 -->
      <c-icon name="refresh" @click="refresh" />

      <c-input placeholder="在线搜索" v-model="searchInput" suffixIcon="search" @keyup.enter="openNetSearchView" />
    </div>

    <window-state-bar>
      <!-- 皮肤 -->
      <c-icon class="icon-menu skin viewer-hidden" name="skin" />
      <!-- 设置 -->
      <c-icon class="icon-menu setting viewer-hidden" name="setting" @click="openSystemSetting" />
    </window-state-bar>

    <c-modal title="个人信息" class="user-info-modal" width="600px" height="400px" v-model="loginModal">
      <span>用 户 账 号：</span>
      <span>{{ user.id }}</span>
      <span>用 户 昵 称：</span>
      <span>{{ user.nickName }}</span>

      <template v-if="user.level">
        <span>V I P 等 级：</span>
        <img alt="" class="c-image" style="margin: -0.5em 0 0 0" :src="user.levelIcon" />
        <span>会员开通时间：</span>
        <span>{{ user.startTime }}</span>
        <span>会员到期时间：</span>
        <span>{{ user.endTime }}</span>
        <span>续 费 状 态：</span>
        <span>{{ user.autoPay ? '已开启' : '未开启' }}</span>
      </template>

      <c-button @click="logout">退出</c-button>
    </c-modal>
  </div>
</template>
