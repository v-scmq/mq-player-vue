<script lang="ts" setup>
import { reactive, ref } from 'vue';

import CButton from '@/components/CButton.vue';
import CModal from '@/components/CModal.vue';
import CCheckBox from '@/components/CCheckBox.vue';
import CInput from '@/components/CInput.vue';

import { Message } from '@/components/message';
import electron from '@/electron';

// 标记退出程序
const exit = reactive({ checked: false, hour: 0, minute: 0 });
// 标记关闭计算机
const shutdown = reactive({ checked: false, hour: 0, minute: 0, force: true });
// 已选择的标记数据
const data = reactive({ option: -1, hour: 0, minute: 0, second: 0 });

const visible = ref(false);

// 计时器
let timer: number | null = null;

const handleConfirm = () => {
  if (timer != null) {
    clearInterval(timer);
  }

  if (data.option !== -1) {
    timer = null;
    data.option = -1;
    return (visible.value = false);
  }

  const option = exit.checked ? 0 : shutdown.checked ? 1 : -1;

  if (option === -1) {
    timer = null;
    return (visible.value = false);
  }

  const { hour, minute, force } = (option === 0 ? exit : shutdown) as any;
  if (hour * 60 + minute < 1) {
    return Message.warning('时间必须在1分钟以上');
  }

  data.hour = hour;
  data.minute = minute;
  data.second = 0;
  data.option = option;

  timer = window.setInterval(() => {
    --data.second;
    if (data.second < 0) {
      --data.minute;
      data.second = 59;
    }

    if (data.minute < 0) {
      --data.hour;
      data.minute = 59;
    }

    if (data.hour < 1 && data.minute < 1 && data.second < 1) {
      timer && clearInterval(timer);
      if (data.option === 0) {
        window.close();
      } else {
        electron.shutdown(force);
      }
    }
  }, 1000);
};

const checkChanged = (option: number) => {
  if ((option ? shutdown : exit).checked) {
    const data = option ? exit : shutdown;
    data.checked = !!(data.hour = data.minute = 0); // 0 -> !!0 => false;
  }
};
</script>

<template>
  <div class="row" style="margin: 20px">
    <c-button @click="visible = true">定时设置</c-button>
  </div>

  <c-modal class="timer-modal" width="500px" height="300px" title="定时设置" v-model="visible">
    <div class="col" style="flex: 1; justify-content: space-evenly" v-if="data.option === -1">
      <div class="row">
        定时退出：
        <c-check-box v-model="exit.checked" @update:modelValue="checkChanged(0)" />
        <c-input type="number" v-model="exit.hour" />
        时
        <c-input type="number" v-model="exit.minute" />
        分
      </div>

      <div class="row">
        定时关机：
        <c-check-box v-model="shutdown.checked" @update:modelValue="checkChanged(1)" />
        <c-input type="number" v-model="shutdown.hour" />
        时
        <c-input type="number" v-model="shutdown.minute" />
        分&nbsp;&nbsp;&nbsp;&nbsp;强制关机：
        <c-check-box v-model="shutdown.force" />
      </div>
    </div>

    <div style="display: flex; align-items: center; flex: 1" v-else>
      将在 {{ data.hour }} 时{{ data.minute }} 分 {{ data.second }} 秒后{{ data.option === 0 ? '退出' : '关机' }}
    </div>

    <c-button @click="handleConfirm">{{ data.option === -1 ? '确定' : '取消' }}</c-button>
  </c-modal>
</template>
