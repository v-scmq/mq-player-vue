<template>
  <div class='v-column music-viewer'>
    <image-view class='effect-cover' :model-value='cover' defaultValue='/icon/default_cover.jpg'/>

    <window-state-bar viewer style='flex:none;'>
      <!-- 关闭播放详情视图 -->
      <icon name='arrow-down' style='margin:0 auto 0 0.5em;' @click='$emit("close")'/>
    </window-state-bar>

    <div class='v-row' style='flex:1; align-items:stretch; overflow:hidden; margin:20px 0;'>
      <image-view class='cover--rect-inner' :model-value='cover' defaultValue='/icon/default_cover.jpg'/>
      <lyric-view style='flex:1;'/>
    </div>

    <!-- 注意必须为canvas元素提供width和height,否则绘制无效 -->
    <canvas height='200' style='flex:0 0 200px' ref='canvasRef'></canvas>
  </div>
</template>

<script lang='ts'>
import player from '../player';

import LyricView from './LyricView.vue';
import WindowStateBar from './WindowStateBar.vue';

import {ref, defineComponent, onMounted, onBeforeUnmount} from 'vue';

export default defineComponent({
  name: 'MusicViewer',

  components: {WindowStateBar, LyricView},

  props: {cover: String},

  emits: ['close'],

  setup() {
    // null值
    const nullValue: any = null;
    // canvas元素引用
    const canvasRef = ref<HTMLCanvasElement>(nullValue);

    // 画布宽度
    let canvasWidth = 0;
    // 画布高度
    let canvasHeight = 200;

    // 画笔渐变色
    let color: CanvasGradient;
    // 画笔
    let canvasContext: CanvasRenderingContext2D;

    // 画布resize观察者
    let canvasResizeObserver: ResizeObserver;

    /**
     * 矩形频谱渲染方法
     *
     * @param dataArray 音频频谱数据
     */
    const rectRenderFrame = (dataArray: Uint8Array) => {
      const canvas = canvasRef.value;

      if (!canvas) {
        return;
      }

      canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
      canvasContext.beginPath();

      // 设置画笔填充色
      canvasContext.fillStyle = color;

      const width = canvasWidth >> 1;
      const height = canvasHeight - 1;
      // => length:1024 / 128 = 8
      const step = dataArray.length >> 7;
      const max = 128;// 1 << 7;

      for (let i = 1; i <= max; ++i) {
        // => -dataArray[step * i] + 1
        const h = ~dataArray[step * i] + 2;

        // 绘制左边的矩形
        canvasContext.fillRect(width - (i - 1) * 10, height, 8, h);
        // 绘制右边的矩形
        canvasContext.fillRect(i * 10 + width, height, 8, h);
      }
    };

    /**
     * 圆形粒子频谱渲染方法
     *
     * @param dataArray 音频频谱数据
     */
    const circleRenderFrame = (dataArray: Uint8Array) => {
      const width = 200, height = 200;

      const du = 2; // 圆心到两条射线距离所成的角度
      const potInt = {x: 200, y: height >> 1}; // 起始坐标
      const R = height >> 1; // 半径
      const W = 3; // 射线的宽度
      const L = 35; // 射线的长度

      canvasContext.clearRect(0, 0, width, height);
      for (let i = 0; i < 360; ++i) {
        let value = dataArray[i + 100] >> 2;
        // let value = 20
        canvasContext.lineWidth = W;
        let Rv1 = R - value;
        let Rv2 = R + value;
        canvasContext.beginPath();

        let gradient = canvasContext.createLinearGradient(
            Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
            -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x,
            Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) +
            potInt.y,
            -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) +
            potInt.x
        );

        gradient.addColorStop(0, 'rgba(226, 225, 0, .4)');
        gradient.addColorStop(0.3, 'rgba(226, 225, 0, .4)');
        gradient.addColorStop(0.3, 'rgba(226, 225, 0, .4)');
        gradient.addColorStop(1, 'rgba(226, 225, 0, 0)');
        if (i < 360 / du) {
          canvasContext.moveTo(
              Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
          );
          canvasContext.lineTo(
              Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) +
              potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) +
              potInt.x
          );
        }

        canvasContext.lineCap = 'round';
        canvasContext.strokeStyle = gradient;
        canvasContext.stroke();
        canvasContext.closePath();

        canvasContext.beginPath();
        if (i < 360 / du / 3) {
          let diff = Rv1 + 20 > R ? R : Rv1 + 20;
          canvasContext.arc(
              Math.sin(((i * du * 3) / 180) * Math.PI) * diff +
              potInt.y,
              -Math.cos(((i * du * 3) / 180) * Math.PI) * diff +
              potInt.x,
              2,
              0,
              Math.PI * 2,
              false
          );
          canvasContext.fillStyle = 'rgba(226, 225, 0, .5)';
        }
        canvasContext.fill();
        canvasContext.closePath();

        canvasContext.beginPath();
        if (i < 360 / du) {
          canvasContext.moveTo(
              Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
          );
          canvasContext.lineTo(
              Math.sin(((i * du) / 180) * Math.PI) * Rv2 + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * Rv2 + potInt.x
          );
        }

        canvasContext.lineCap = 'round';
        canvasContext.strokeStyle = 'rgba(226, 225, 0, 1)';
        canvasContext.stroke();
        canvasContext.closePath();
      }
    };

    onMounted(() => {
      // 获取canvas
      const canvas = canvasRef.value;

      // 获取画笔
      canvasContext = canvas.getContext('2d') as any;

      // 绘制柱形频谱的画笔颜色
      color = canvasContext.createLinearGradient(0, canvasHeight, 0, 0);
      color.addColorStop(0, '#7ec0ee');
      color.addColorStop(0.2, '#9aff9a');
      color.addColorStop(0.4, '#ffa07a');
      color.addColorStop(0.6, '#ff86c1');
      color.addColorStop(0.8, '#e85ce8');
      color.addColorStop(1, '#9744e0');

      // 创建元素(节点)观察者对象
      canvasResizeObserver = new ResizeObserver(([{contentRect}]) =>
          void (canvas.width = canvasWidth = contentRect.width));

      // 开始观察canvas元素
      canvasResizeObserver.observe(canvas);

      // 异步执行音频频谱监听(若是第一次调用, AudioAnalyser相关的对象在创建时可能发生阻塞)
      setTimeout(() => {
        player.setAudioSpectrumListener(rectRenderFrame || circleRenderFrame)
      }, 1);

    });

    onBeforeUnmount(() => {
      // 移除频谱监听
      player.setAudioSpectrumListener(null);
      // 终止canvas元素的resize观察
      canvasResizeObserver && canvasResizeObserver.disconnect();
      // 解除引用
      canvasResizeObserver = color = canvasContext = canvasWidth = canvasHeight = nullValue;
    });

    return {canvasRef};
  }

});
</script>