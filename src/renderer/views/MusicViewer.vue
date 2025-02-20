<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

import CImage from '@/components/CImage.vue';
import CIcon from '@/components/CIcon.vue';
import LyricView from './LyricView.vue';
import WindowStateBar from './WindowStateBar.vue';

import { toggleFullScreen } from '@/electron';
import player from '@/player';

defineProps({ cover: String });
const emit = defineEmits(['close']);

// null值
const NULL_REF: any = null;
// canvas元素引用
const canvasRef = ref<HTMLCanvasElement>(NULL_REF);

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
  const step = dataArray.length >> 7; // => length:1024 / 128 = 8
  const rectWidth = 6;
  const gapWidth = 4;

  let leftX = width - (rectWidth >> 1);
  let rightX = leftX;

  for (let i = 1; leftX >= 8; ++i) {
    // => -dataArray[step * i] + 1
    const rectHeight = ~dataArray[step * i] + 2;

    if (i === 1) {
      // 绘制最中央的矩形
      canvasContext.fillRect(leftX, height, rectWidth, rectHeight);
    } else {
      // 绘制左边的矩形
      canvasContext.fillRect(leftX, height, rectWidth, rectHeight);
      // 绘制右边的矩形
      canvasContext.fillRect(rightX, height, rectWidth, rectHeight);
    }

    leftX -= gapWidth + rectWidth;
    rightX += gapWidth + rectWidth;
  }
};

// /**
//  * 圆形粒子频谱渲染方法
//  *
//  * @param dataArray 音频频谱数据
//  */
// const circleRenderFrame = (dataArray: Uint8Array) => {
//   const width = canvasWidth;
//   const height = canvasHeight;
//
//   const du = 2; // 圆心到两条射线距离所成的角度
//   const potInt = { x: 200, y: height >> 1 }; // 起始坐标
//   const R = height >> 1; // 半径
//   const W = 3; // 射线的宽度
//   const L = 35; // 射线的长度
//
//   canvasContext.clearRect(0, 0, width, height);
//
//   for (let i = 0; i < 360; ++i) {
//     let value = dataArray[i + 100] >> 2;
//     // let value = 20
//     canvasContext.lineWidth = W;
//     let Rv1 = R - value;
//     let Rv2 = R + value;
//     canvasContext.beginPath();
//
//     let gradient = canvasContext.createLinearGradient(
//       Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
//       -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x,
//       Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) + potInt.y,
//       -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) + potInt.x
//     );
//
//     gradient.addColorStop(0, 'rgba(226, 225, 0, .4)');
//     gradient.addColorStop(0.3, 'rgba(226, 225, 0, .4)');
//     gradient.addColorStop(0.3, 'rgba(226, 225, 0, .4)');
//     gradient.addColorStop(1, 'rgba(226, 225, 0, 0)');
//     if (i < 360 / du) {
//       canvasContext.moveTo(
//         Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
//         -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
//       );
//       canvasContext.lineTo(
//         Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) + potInt.y,
//         -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) + potInt.x
//       );
//     }
//
//     canvasContext.lineCap = 'round';
//     canvasContext.strokeStyle = gradient;
//     canvasContext.stroke();
//     canvasContext.closePath();
//
//     canvasContext.beginPath();
//     if (i < 360 / du / 3) {
//       let diff = Rv1 + 20 > R ? R : Rv1 + 20;
//       canvasContext.arc(
//         Math.sin(((i * du * 3) / 180) * Math.PI) * diff + potInt.y,
//         -Math.cos(((i * du * 3) / 180) * Math.PI) * diff + potInt.x,
//         2,
//         0,
//         Math.PI * 2,
//         false
//       );
//       canvasContext.fillStyle = 'rgba(226, 225, 0, .5)';
//     }
//     canvasContext.fill();
//     canvasContext.closePath();
//
//     canvasContext.beginPath();
//     if (i < 360 / du) {
//       canvasContext.moveTo(
//         Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
//         -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
//       );
//       canvasContext.lineTo(
//         Math.sin(((i * du) / 180) * Math.PI) * Rv2 + potInt.y,
//         -Math.cos(((i * du) / 180) * Math.PI) * Rv2 + potInt.x
//       );
//     }
//
//     canvasContext.lineCap = 'round';
//     canvasContext.strokeStyle = 'rgba(226, 225, 0, 1)';
//     canvasContext.stroke();
//     canvasContext.closePath();
//   }
// };

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
  canvasResizeObserver = new ResizeObserver(
    ([{ contentRect }]) => void (canvas.width = canvasWidth = contentRect.width)
  );

  // 开始观察canvas元素
  canvasResizeObserver.observe(canvas);

  // 异步执行音频频谱监听(若是第一次调用, AudioAnalyser相关的对象在创建时可能发生阻塞)
  requestAnimationFrame(() => {
    player.setAudioSpectrumListener(rectRenderFrame /*circleRenderFrame*/);
  });
});

onBeforeUnmount(() => {
  // 移除频谱监听
  player.setAudioSpectrumListener(null);
  // 终止canvas元素的resize观察
  canvasResizeObserver && canvasResizeObserver.disconnect();
  // 解除引用
  canvasResizeObserver = color = canvasContext = canvasWidth = canvasHeight = NULL_REF;
});

const closeViewer = () => {
  toggleFullScreen(false);
  emit('close');
};
</script>

<template>
  <div class="col music-viewer">
    <c-image class="effect-cover" :model-value="cover" error="image/cover.jpg" />

    <window-state-bar viewer style="flex: none">
      <!-- 关闭播放详情视图 -->
      <c-icon name="arrow-down" style="margin-right: auto" @click="closeViewer" />
    </window-state-bar>

    <div class="row" style="flex: 1; align-items: stretch; overflow: hidden; padding: 20px 0">
      <c-image class="cover--rect-inner" :model-value="cover" error="image/cover.jpg" />

      <div class="col" style="flex: 1">
        <slot name="song" />
        <lyric-view style="flex: 1" />
      </div>
    </div>

    <!-- 注意必须为canvas元素提供width和height,否则绘制无效 -->
    <canvas height="200" style="flex: none" ref="canvasRef" />
  </div>
</template>
