<template>
  <div class='slider' ref='el' :class='{vertical}' @click='onSliderClicked'>
    <div class='track'>

      <template v-if='vertical'>
        <div class='buffer' v-if="bufferNodeVisible" :style='{height:`${buffering * 100}%`}'/>
        <div class='filler' :style='{height: `${value}%`}'/>
        <div class='thumb' ref='thumb' :style='{top: `${100 - value}%`}' @pointerdown='onDragStart'/>
      </template>

      <template v-else>
        <div class='buffer' v-if="bufferNodeVisible" :style='{width:`${buffering * 100}%`}'/>
        <div class='filler' :style='{width: `${value}%`}'/>
        <div class='thumb' ref='thumb' :style='{left: `${value}%`}' @pointerdown='onDragStart'/>
      </template>
    </div>

  </div>
</template>

<script lang='ts'>
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
 * @update 2021-09-02、2022-06-03
 */

import {computed, ref, watch, defineComponent} from 'vue';

export default defineComponent({
  name: 'Slider',

  props: {
    modelValue: {type: Number, default: 0},
    vertical: {type: Boolean, default: false},
    buffering: {type: Number, default: null}
  },

  emits: ['update:modelValue', 'change'],

  setup(props, {emit}) {
    //  组件根元素引用
    const el = ref(null as unknown as HTMLElement);

    // 滑块d元素
    const thumb = ref(null as unknown as HTMLElement);

    // 鼠标在滑块上按下时距离滑块的做左偏移量
    let offsetX: number;

    // 滑块距离父元素slider的左偏移量(单位px)
    let offsetLeft: number;

    // 滑块是否发生过拖动
    let dragged: boolean;

    // 进度值
    const value = computed(() => props.modelValue * 100);

    // 发出change事件,以便侦测数据值改变
    watch(() => props.modelValue, newValue => emit('change', newValue));

    /**
     * 滑块被拖动时触发.在此过程中,只会提交input事件以修改value属性值
     * @param {PointerEvent} e 指针事件
     */
    const onDragging = (e: PointerEvent) => {
      // 当节点display:none时, 取值会为0, 为防止除以0错误, 赋其默认值为1
      let total = (props.vertical ? el.value.clientHeight : el.value.clientWidth) || 1;

      // 增量 = 现在的e.clientX|e.clientY - 鼠标按下时的e.clientX|e.clientY(即offsetX)
      let value = (props.vertical ? e.clientY : e.clientX) - offsetX + offsetLeft;

      // 计算新的值,此时保留3为有效数字,然后检测值是否变化,才提交值(虽然提交相同值不会触发value改变)
      value = Number((Math.max(Math.min(value, total), 0) / total).toFixed(3));
      value = props.vertical ? 1 - value : value;

      if (props.modelValue !== value) {
        // 立刻置为true,这将用于表名滑块确实发生过拖动
        dragged = true;
        // 提交input事件以修改value属性值
        emit('update:modelValue', value);
      }
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

      dragged = offsetX = offsetLeft = null as any;
      document.onpointermove = document.onpointerup = null;
    };

    return {
      el, thumb, value,

      bufferNodeVisible: computed(() => {
        const {buffering} = props;
        return !!buffering && buffering > 0;
      }),

      /**
       * 检测滑块是否正在被拖动
       * @returns {boolean} 若滑块在被鼠标拖动,则返回true;否则返回false
       */
      isNotDragging: () => offsetX == null,

      /**
       * 开始拖动(指针设备在滑块上按下)时触发, 此时并还未开始拖动,仅仅是准备好拖动.
       * 需要注意检测中断拖动不能依靠滑块(div)元素本身,需要借助document对象 或 window对象
       * 因为元素本身在鼠标移动后,所监听的鼠标释放事件并不会触发,但是document或window一定会触发
       *
       * @param {PointerEvent} event 指针事件
       */
      onDragStart(event: PointerEvent) {
        event.preventDefault();

        const value = props.vertical;
        offsetX = value ? event.clientY : event.clientX;
        offsetLeft = value ? thumb.value.offsetTop : thumb.value.offsetLeft;
        document.onpointermove = onDragging;
        document.onpointerup = onDragEnd;
      },

      /**
       * 滑动条被点击时触发,随着先后触发input事件和change事件
       * 触发change事件并传出第二个参数值true 以方便侦测滑动条的值是人为改变
       *
       * @param {PointerEvent} e 指针事件
       */
      onSliderClicked(e: PointerEvent) {
        if (e.target === thumb.value) {
          return;
        }

        let value = props.vertical
            ? e.offsetY / el.value.clientHeight
            : e.offsetX / el.value.clientWidth;

        value = Number(value.toFixed(3));
        value = props.vertical ? 1 - value : value;

        if (value !== props.modelValue) {
          emit('update:modelValue', value);
          emit('change', value, true);
        }
      }

    };

  }

});
</script>
