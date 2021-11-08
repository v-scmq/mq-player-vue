<template>
  <div class='slider' ref='el' :class='{"vertical": vertical}' @click='onSliderClicked'>
    <div class='track'/>
    <div class='buffering' v-if='buffering!=null' :style='{width:`${buffering*100}%`}'/>
    <div class='fill'/>
    <div class='thumb' @mousedown.prevent='onDragStart'/>
  </div>
</template>

<script>
/**
 * 滑动条组件, 用于双向绑定的value属性值永远在 [0,1] 区间.  它具有2个可供外部使用的事件:
 * 1.change事件,数据改变时,实时的回调方法.第一个参数是当前value属性值, 第二个参数若为true,
 *        则表示 “滑块被拖动” 或 “点击滑动条有效位置”, 其余情况都是为undefined
 *
 * 2.input事件组件内部主动发起修改value属性值所用,通常不建议使用
 *
 * 需要注意: 当滑动条是竖直方向上显示时,滑动条的高度需要能够 自动适应 或 直接明确指定
 *    (最佳解决方案,父元素使用flex布局自动适应,slider组件不需要再做任何变动)
 *
 * @author SCMQ
 * @date 2020-12-13
 * @update 2021-09-02
 */

import {watch, onMounted, getCurrentInstance} from 'vue';

export default {
  name: 'Slider',

  props: {
    modelValue: {type: Number, default: 0},
    vertical: {type: Boolean, default: null},
    buffering: {type: Number, default: null}
  },

  emits: ['update:modelValue', 'change'],

  setup: (props, {emit}) => {
    let el = null;
    let fill = null;       // 填充块div元素(dom对象)
    let thumb = null;      // 滑  块div元素(dom对象)
    let offsetX = null;    // 鼠标在滑块上按下时距离滑块的做左偏移量
    let offsetLeft = null; // 滑块距离父元素slider的左偏移量(单位px)
    let dragged = null;    // 滑块是否发生过拖动

    /**
     * 鼠标开始拖动(鼠标在滑块上按下)时触发, 此时并还未开始拖动,仅仅是准备好拖动.
     * 需要注意检测中断拖动不能依靠滑块(div)元素本身,需要借助document对象 或 window对象
     * 因为元素本身在鼠标移动后,所监听的鼠标释放事件并不会触发,但是document或window一定会触发
     * @param {MouseEvent} e 鼠标事件
     */
    const onDragStart = e => {
      let value = props.vertical;
      offsetX = value ? e.clientY : e.clientX;
      offsetLeft = value ? thumb.offsetTop : thumb.offsetLeft;
      document.onmousemove = onDragging;
      document.onmouseup = onDragEnd;
    };

    /**
     * 鼠标停止拖动(鼠标在页面开始按下后,然后释放)时触发.
     * 此时只会提交change事件,并且传出的第2个参数boolean值true以方便侦测滑块拖动结束
     */
    const onDragEnd = () => {
      // 在拖动处理的onDragging方法中, 若确实发生值的变化,dragged值才会为true
      if (dragged) {
        // 触发一次改变事件,并传出boolean值true作为拖动结束的标记
        emit('change', props.modelValue, true);
      }

      dragged = null;
      offsetX = null;
      offsetLeft = null;
      document.onmousemove = null;
      document.onmouseup = null;
    };

    /**
     * 滑块被拖动时触发.在此过程中,只会提交input事件以修改value属性值
     * @param {MouseEvent} e 鼠标事件
     */
    const onDragging = e => {
      let total = props.vertical ? el.clientHeight : el.clientWidth;

      // 增量 = 现在的e.clientX|e.clientY - 鼠标按下时的e.clientX|e.clientY(即offsetX)
      let value = props.vertical ? e.clientY : e.clientX;
      value = value - offsetX + offsetLeft;
      value = value < 0 ? 0 : value > total ? total : value;

      // 计算新的值,此时保留3为有效数字,然后检测值是否变化,才提交值(虽然提交相同值不会触发value改变)
      value = props.vertical ? 1 - (value / total).toFixed(3) :
          (value / total).toFixed(3) - 0;

      if (props.modelValue !== value) {
        // 立刻置为true,这将用于表名滑块确实发生过拖动
        dragged = true;
        // 提交input事件以修改value属性值
        emit('update:modelValue', value);
      }
    };

    /**
     * 滑动条被点击时触发,随着先后触发input事件和change事件
     * 触发change事件并传出第二个参数值true 以方便侦测滑动条的值是人为改变
     * @param {MouseEvent} e 鼠标事件
     */
    const onSliderClicked = e => {
      if (e.target === el) {
        let value = props.vertical ? e.offsetY / el.clientHeight : e.offsetX / el.clientWidth;
        value = value.toFixed(3) - 0;
        value = props.vertical ? 1 - value : value;

        if (value !== props.modelValue) {
          emit('update:modelValue', value);
          emit('change', value, true);
        }
      }
    };

    /**
     * 设置滑块的位置和填充块的宽度
     * @param {number} value 滑动条模型绑定的值的100倍(滑动条绑定的value在[0,1]区间内)
     */
    const setStyle = value => {
      if (props.vertical) {
        fill.style.height = `${value}%`;
        thumb.style.top = `${100 - value}%`;
        // TODO 打包后, props.vertical明确指定是true,但还是将fill的width以横向模式设置
        //      从调试断点来看进入了,else,但若是在if和else中做console输出的日志是正常的
        fill.style.width = thumb.style.left = null;

      } else {
        fill.style.width = value = `${value}%`;
        thumb.style.left = value;
        fill.style.height = thumb.style.top = null;
      }
    };

    onMounted(() => {
      /** @type {HTMLElement} */
      el = getCurrentInstance().refs.el;
      fill = el.querySelector('.fill');
      thumb = el.querySelector('.thumb');
      // 当值大于0时需要更新滑块和填充块
      if (props.modelValue > 0) {
        setStyle(props.modelValue * 100);
      }
    });

    watch(() => props.modelValue, newValue => {
      // 若没有拖动,则更新滑块和填充块的位置
      setStyle(newValue * 100);
      // 发出change事件,以便侦测数据值改变
      emit('change', newValue);
    });

    /**
     * 检测滑块是否正在被拖动
     * @returns {boolean} 若滑块在被鼠标拖动,则返回true;否则返回false
     */
    const isNotDragging = () => offsetX == null;

    return {onSliderClicked, onDragStart, isNotDragging}
  }
}
</script>
