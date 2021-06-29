<template>
  <div class="v-column" id="music-viewer" v-show="visible">
    <img id="background-cover" alt :src="cover"/>
    <canvas id="canvas-view" width='1600' height='400'></canvas>
  </div>
</template>

<script>
export default {
  name: "PlayDetailView",

  props: {
    visible: null,
    cover: null
  },

  data: () => ({}),

  mounted() {
    this._header = document.body.querySelector('#app > .title-bar');
    this._header.querySelector('.hide-viewer').onclick = this.hidden;

    this._canvas = this.$el.querySelector('#canvas-view');
    this._canvasContext = this._canvas.getContext('2d');

    //柱状图颜色
    //1. Math.ceil()用作向上取整。 2. Math.floor()用作向下取整。 3. Math.round() 四舍五入取整
    this._color = this._canvasContext.createLinearGradient(this._canvas.width * 0.5, 0, this._canvas.width * 0.5, 400);
    this._color.addColorStop(0, "#0990ee");
    this._color.addColorStop(0.1, "#FF00FF");
    this._color.addColorStop(0.4, "#f30b7c");
    this._color.addColorStop(0.7, "#9744e0");
    this._color.addColorStop(1, "#e85ce8");

    // #7EC0EE", "#9AFF9A", "#FF86C1", "#FFA07A", "#FF00FF

    // 进行首次渲染
    // this.$player.setAudioSpectrumListener(this.rectRenderFrame);
    document.body.appendChild(this.$el);
  },

  beforeDestroy() {
    this.$el.remove();
    this.$player.setAudioSpectrumListener(null);
    if (this._header) {
      document.body.querySelector('#app >.tab-pane').before(this._header);
    }
  },

  watch: {
    visible(value) {
      let listener = value ? this.rectRenderFrame : null;
      this.$player.setAudioSpectrumListener(listener);
      value ? document.body.appendChild(this.$el) : this.$el.remove();

      this._header.classList.toggle('viewer', value);
      let node = value ? this.$el.querySelector('#background-cover')
          : document.body.querySelector('#app >.tab-pane');
      node.before(this._header);
    }
  },
  methods: {
    hidden() {
      this.$emit('close');
      this._header.classList.toggle('full-screen', false);
    },

    /**
     * 矩形频谱渲染方法
     * @param dataArray {Uint8Array} 音频频谱数据
     */
    rectRenderFrame(dataArray) {
      let width = this._canvas.width, height = this._canvas.height - 1;
      let step = Math.round(dataArray.length / 60);
      this._canvasContext.clearRect(0, 0, width, height);
      this._canvasContext.beginPath();

      for (let i = 1; i <= 60; ++i) {
        let value = dataArray[step * i];
        // 设置画笔填充色
        this._canvasContext.fillStyle = this._color;
        // 由画布中间向两边画矩形
        this._canvasContext.fillRect(width * 0.5 - (i - 1) * 10, height, 8, (-value) + 1);
        this._canvasContext.fillRect(i * 10 + width * 0.5, height, 8, (-value) + 1);
        this._canvasContext.fill();
      }
    },

    circleRenderFrame(dataArray) {
      let {width, height} = this._canvas;

      const du = 2; // 圆心到两条射线距离所成的角度
      const potInt = {x: width >> 1, y: height >> 1}; // 起始坐标
      const R = 150; // 半径
      const W = 3; // 射线的宽度
      const L = 35; // 射线的长度

      this._canvasContext.clearRect(0, 0, width, height);
      for (let i = 0; i < 360; ++i) {
        let value = dataArray[i + 100] / 4;
        // let value = 20
        this._canvasContext.lineWidth = W;
        let Rv1 = R - value;
        let Rv2 = R + value;
        this._canvasContext.beginPath();

        let gradient = this._canvasContext.createLinearGradient(
            Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
            -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x,
            Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) +
            potInt.y,
            -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) +
            potInt.x
        );

        gradient.addColorStop(0, "rgba(226, 225, 0, .4)");
        gradient.addColorStop(0.3, "rgba(226, 225, 0, .4)");
        gradient.addColorStop(0.3, "rgba(226, 225, 0, .4)");
        gradient.addColorStop(1, "rgba(226, 225, 0, 0)");
        if (i < 360 / du) {
          this._canvasContext.moveTo(
              Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
          );
          this._canvasContext.lineTo(
              Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + L) +
              potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + L) +
              potInt.x
          );
        }

        this._canvasContext.lineCap = "round";
        this._canvasContext.strokeStyle = gradient;
        this._canvasContext.stroke();
        this._canvasContext.closePath();

        this._canvasContext.beginPath();
        if (i < 360 / du / 3) {
          let diff = Rv1 + 20 > R ? R : Rv1 + 20;
          this._canvasContext.arc(
              Math.sin(((i * du * 3) / 180) * Math.PI) * diff +
              potInt.y,
              -Math.cos(((i * du * 3) / 180) * Math.PI) * diff +
              potInt.x,
              2,
              0,
              Math.PI * 2,
              false
          );
          this._canvasContext.fillStyle = "rgba(226, 225, 0, .5)";
        }
        this._canvasContext.fill();
        this._canvasContext.closePath();

        this._canvasContext.beginPath();
        if (i < 360 / du) {
          this._canvasContext.moveTo(
              Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
          );
          this._canvasContext.lineTo(
              Math.sin(((i * du) / 180) * Math.PI) * Rv2 + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * Rv2 + potInt.x
          );
        }

        this._canvasContext.lineCap = "round";
        this._canvasContext.strokeStyle = "rgba(226, 225, 0, 1)";
        this._canvasContext.stroke();
        this._canvasContext.closePath();
      }
    }
  }
}
</script>

<style scoped>
#music-viewer {
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

#background-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  /*filter: blur(150px);*/
  /*filter: blur(60px) brightness(60%);*/
  filter: blur(60px);
  opacity: 0.6;
  z-index: -1;
}

#canvas-view {
  flex: 1;
  margin: 4px;
}
</style>