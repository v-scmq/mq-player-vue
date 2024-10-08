<template>
  <div class="v-row" style="margin:20px;">
    <hl-button @click='timerModal = true'>定时设置</hl-button>
  </div>

  <modal width="50%" height="50%" title="定时设置" id='timer-modal' v-model:visible='timerModal'>
    <div class='v-column' style="justify-content:space-evenly;flex:1;text-indent:4px" v-if='data.option === -1'>
      <div class='v-row'>
        定时退出：
        <check-box v-model="dataOfExit.checked" @update:modelValue='checkChanged(0)'/>
        <text-field type='number' v-model='dataOfExit.hour'/>
        时
        <text-field type='number' v-model='dataOfExit.minute'/>
        分
      </div>

      <div class='v-row'>
        定时关机：
        <check-box v-model="dataOfShutdown.checked" @update:modelValue='checkChanged(1)'/>
        <text-field type='number' v-model='dataOfShutdown.hour'/>
        时
        <text-field type='number' v-model='dataOfShutdown.minute'/>
        分&nbsp;&nbsp;&nbsp;&nbsp;强制关机：
        <check-box v-model="dataOfShutdown.force"/>
      </div>
    </div>

    <div style='display:flex;align-items:center;flex:1;' v-else>
      将在 {{ data.hour }} 时{{ data.minute }} 分 {{ data.second }} 秒后{{ data.option === 0 ? '退出' : '关机' }}
    </div>

    <hl-button @click='handleConfirm'>{{ data.option === -1 ? '确定' : '取消' }}</hl-button>
  </modal>
</template>

<script lang='ts'>
import {Message} from '@/components/Message';

import {reactive, ref, defineComponent} from "vue";

export default defineComponent({
  name: "SystemSetting",

  setup() {
    // 标记退出程序
    const dataOfExit = reactive({checked: false, hour: 0, minute: 0});
    // 标记关闭计算机
    const dataOfShutdown = reactive({checked: false, hour: 0, minute: 0, force: true});
    // 已选择的标记数据
    const data = reactive({option: -1, hour: 0, minute: 0, second: 0,});

    const timerModal = ref(false);

    // 计时器
    let timer: number | null = null;

    return {
      timerModal, dataOfExit, dataOfShutdown, data,

      handleConfirm() {
        if (timer != null) {
          clearInterval(timer);
        }

        if (data.option !== -1) {
          timer = null;
          data.option = -1;
          return timerModal.value = false;
        }

        const option = dataOfExit.checked ? 0 : dataOfShutdown.checked ? 1 : -1;

        if (option === -1) {
          timer = null;
          return timerModal.value = false;
        }

        const {hour, minute, force} = (option === 0 ? dataOfExit : dataOfShutdown) as any;
        if ((hour * 60 + minute) < 1) {
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
              window.close()
            } else {
              (window as any).electron.shutdown(force);
            }
          }
        }, 1000);

      },

      checkChanged(option: number) {
        if ((option ? dataOfShutdown : dataOfExit).checked) {
          const data = option ? dataOfExit : dataOfShutdown;
          data.checked = !!(data.hour = data.minute = 0); // 0 -> !!0 => false;
        }
      }
    };
  }

});
</script>