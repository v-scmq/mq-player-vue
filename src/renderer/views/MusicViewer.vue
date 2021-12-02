<template>
  <div class='v-column music-viewer'>
    <window-state-bar viewer style='flex:none'>
      <!-- 关闭播放详情视图 -->
      <icon class='icon-menu' name='arrow-down' style='margin:0 auto 0 0.5em;' @click='$emit("close")'/>
    </window-state-bar>

    <img class='cover effect-cover' alt :src='cover'/>
    <canvas class='canvas-view' width='1600' height='400' ref='canvasRef'></canvas>
  </div>
</template>

<script>
import player from '../player';
import WindowStateBar from './WindowStateBar';
import {onBeforeUnmount, onMounted, ref} from 'vue';

export default {
  name: 'PlayDetailView',
  components: {WindowStateBar},

  props: {
    cover: null
  },

  emits: ['close'],

  setup() {

    /** @type {Ref<HTMLCanvasElement | null>} */
    const canvasRef = ref(null);
    /** @type {CanvasRenderingContext2D | null} */
    let canvasContext = null;
    /** @type {CanvasGradient | null} */
    let color = null;

    /**
     * 矩形频谱渲染方法
     *
     * @param {Uint8Array} dataArray 音频频谱数据
     */
    const rectRenderFrame = (dataArray) => {
      let width = canvasRef.value.width, height = canvasRef.value.height - 1;
      let step = Math.round(dataArray.length / 60);
      canvasContext.clearRect(0, 0, width, height);
      canvasContext.beginPath();

      for (let i = 1; i <= 60; ++i) {
        let value = dataArray[step * i];
        // 设置画笔填充色
        canvasContext.fillStyle = color;
        // 由画布中间向两边画矩形
        canvasContext.fillRect(width * 0.5 - (i - 1) * 10, height, 8, (-value) + 1);
        canvasContext.fillRect(i * 10 + width * 0.5, height, 8, (-value) + 1);
        canvasContext.fill();
      }
    };

    // /**
    //  * 圆形粒子频谱渲染方法
    //  *
    //  * @param {Uint8Array} dataArray 音频频谱数据
    //  */
    // const circleRenderFrame = dataArray => {
    //   let {width, height} = this._canvas;
    //
    //   const du = 2; // 圆心到两条射线距离所成的角度
    //   const potInt = {x: width >> 1, y: height >> 1}; // 起始坐标
    //   const R = 150; // 半径
    //   const W = 3; // 射线的宽度
    //   const L = 35; // 射线的长度
    //
    //   this._canvasContext.clearRect(0, 0, width, height);
    //   for (let i = 0; i < 360; ++i) {
    //     let value = dataArray[i + 100] / 4;
    //     // let value = 20
    //     this._canvasContext.lineWidth = W;
    //     let Rv1 = R - value;
    //     let Rv2 = R + value;
    //     this._canvasContext.beginPath();
    //
    //     let gradient = this._canvasContext.createLinearGradient(
    //         Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
    //         -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x,
    //         Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) +
    //         potInt.y,
    //         -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) +
    //         potInt.x
    //     );
    //
    //     gradient.addColorStop(0, 'rgba(226, 225, 0, .4)');
    //     gradient.addColorStop(0.3, 'rgba(226, 225, 0, .4)');
    //     gradient.addColorStop(0.3, 'rgba(226, 225, 0, .4)');
    //     gradient.addColorStop(1, 'rgba(226, 225, 0, 0)');
    //     if (i < 360 / du) {
    //       this._canvasContext.moveTo(
    //           Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
    //           -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
    //       );
    //       this._canvasContext.lineTo(
    //           Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) +
    //           potInt.y,
    //           -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) +
    //           potInt.x
    //       );
    //     }
    //
    //     this._canvasContext.lineCap = 'round';
    //     this._canvasContext.strokeStyle = gradient;
    //     this._canvasContext.stroke();
    //     this._canvasContext.closePath();
    //
    //     this._canvasContext.beginPath();
    //     if (i < 360 / du / 3) {
    //       let diff = Rv1 + 20 > R ? R : Rv1 + 20;
    //       this._canvasContext.arc(
    //           Math.sin(((i * du * 3) / 180) * Math.PI) * diff +
    //           potInt.y,
    //           -Math.cos(((i * du * 3) / 180) * Math.PI) * diff +
    //           potInt.x,
    //           2,
    //           0,
    //           Math.PI * 2,
    //           false
    //       );
    //       this._canvasContext.fillStyle = 'rgba(226, 225, 0, .5)';
    //     }
    //     this._canvasContext.fill();
    //     this._canvasContext.closePath();
    //
    //     this._canvasContext.beginPath();
    //     if (i < 360 / du) {
    //       this._canvasContext.moveTo(
    //           Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
    //           -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
    //       );
    //       this._canvasContext.lineTo(
    //           Math.sin(((i * du) / 180) * Math.PI) * Rv2 + potInt.y,
    //           -Math.cos(((i * du) / 180) * Math.PI) * Rv2 + potInt.x
    //       );
    //     }
    //
    //     this._canvasContext.lineCap = 'round';
    //     this._canvasContext.strokeStyle = 'rgba(226, 225, 0, 1)';
    //     this._canvasContext.stroke();
    //     this._canvasContext.closePath();
    //   }
    // };

    onMounted(() => {
      const canvas = canvasRef.value;
      canvasContext = canvas.getContext('2d');

      // 柱状图颜色
      // 1. Math.ceil()用作向上取整。 2. Math.floor()用作向下取整。 3. Math.round() 四舍五入取整
      color = canvasContext.createLinearGradient(canvas.width * 0.5, 0, canvas.width * 0.5, 400);
      color.addColorStop(0, '#0990ee');
      color.addColorStop(0.1, '#FF00FF');
      color.addColorStop(0.4, '#f30b7c');
      color.addColorStop(0.7, '#9744e0');
      color.addColorStop(1, '#e85ce8');

      // #7EC0EE', '#9AFF9A', '#FF86C1', '#FFA07A', '#FF00FF

      // 异步执行音频频谱监听(若是第一次调用, AudioAnalyser相关的对象在创建时可能发生阻塞)
      setTimeout(() => player.setAudioSpectrumListener(rectRenderFrame));
    });

    onBeforeUnmount(() => player.setAudioSpectrumListener(color = canvasContext = null));

    return {canvasRef};
  }
}
</script>

<style scoped>
.music-viewer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 9;
  overflow: hidden;
  /*background-color: black;*/
  /*background: rgb(224, 224, 224);*/
  background: rgb(100, 100, 100);
  /*rgb(250,235,215)*/
  /*FAEBD7FF*/
}

.effect-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  /*filter: blur(150px);*/
  /*filter: blur(60px) brightness(60%);*/
  filter: blur(60px);
  opacity: 0.6;
  z-index: -1;
}

.canvas-view {
  flex: 1;
  margin: 4px;
}
</style>