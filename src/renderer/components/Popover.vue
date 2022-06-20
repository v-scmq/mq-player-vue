<template>
  <div class='popover-trigger' ref='el'>
    <slot></slot>

    <div v-bind='$attrs' ref='popover' class='popover' :class='{expand}' :style='style' v-if='visible'
         :data-placement='placementRef' @click='onClick' @transitionend='onAnimationEnd'>
      <slot name='content'></slot>
    </div>
  </div>
</template>

<script lang='ts'>
import {defineComponent, nextTick, ref, onBeforeUnmount, PropType} from 'vue';

/**
 * 弹出层的定位样式.
 */
type PositionStyle = {
  top?: string,
  right?: string,
  bottom?: string,
  left?: string
}


/**
 * 弹出层相对于触发源节点的方位.
 *
 * <pre>
 *              ↑               ↑              ↑
 *              top-start      top       top-end
 * ← left-start                                    right-start →
 * ← left                                          right       →
 * ← left-end                                      right-end   →
 *              bottom-start  bottom  bottom-end
 *              ↓               ↓              ↓
 * </pre>
 */
type Placement =
    'top-start' | 'top' | 'top-end' |
    'right-start' | 'right' | 'right-end' |
    'bottom-start' | 'bottom' | 'bottom-end' |
    'left-start' | 'left' | 'left-end';

export default defineComponent({
  name: 'Popover',

  // 禁用 Attribute 继承, 将传入的非props中的属性作用于特定的元素(popover)上
  inheritAttrs: false,

  props: {
    /** 弹出层被点击后是否可关闭 */
    closeable: Boolean,
    /** 弹出层元素 和 触发元素 的间距 */
    gap: {type: Number, default: 8},
    /** 弹出层相对于触发源节点的方位 */
    placement: {type: String as PropType<Placement>}
  },

  setup(props) {
    // 组件根元素引用
    const el = ref(null as unknown as HTMLElement);
    // 弹出层根元素引用
    const popover = ref(null as unknown as HTMLElement);
    // 弹出层的可见性
    const visible = ref(false);
    // 弹出层是否展开
    const expand = ref(false);
    // 弹出层的定位样式
    const style = ref<PositionStyle | null>(null);
    // 弹出的位置(默认在触发源的下方)
    const placementRef = ref<Placement>('bottom');

    /**
     * 计算弹出层的位置
     */
    const computePosition = () => {
      const gap = props.gap;

      const {top, left: x2, bottom, right, width: w2} = el.value.getBoundingClientRect();

      const {clientWidth: maxWidth, clientHeight: maxHeight} = document.body;

      const {offsetWidth: w1, offsetHeight: h1} = popover.value;

      const styleValue: PositionStyle = {};

      // 在目标元素的上方到可视窗口的高度 => top

      // 在目标元素的下方到可视窗口的高度 => maxHeight - bottom
      const bottomSpace = maxHeight - bottom;

      // 检测在目标元素的下方是否能够显示
      let value = bottom + gap + h1;

      // 若能显示 或 在下方的高度大于在上方的高度
      if (value < maxHeight || top < bottomSpace) {
        styleValue.top = `${bottom + gap}px`;

      } else {
        styleValue.bottom = `${(maxHeight - top) + gap}px`;
      }

      // 在目标元素的右边到可视窗口的宽度 => maxWidth - right
      const rightSpace = maxWidth - right;

      // 居中计算表达式: x1 + (w1 - w2) / 2 = x2
      //            =>  x1 = x2 - (w1 - w2) / 2
      value = x2 - (w1 - w2) / 2;

      // 检测在目标元素的水平中央是否能够显示
      if (x2 > rightSpace) {
        styleValue.right = `${(value += w1) >= maxWidth ? w1 : (maxWidth - value)}px`;

      } else {
        styleValue.left = `${Math.max(0, value)}px`;
      }

      // TODO placement如何取值
      placementRef.value = styleValue.top ? 'bottom' : 'top';

      style.value = styleValue;
    };

    /**
     * 指针设备点击、可视窗口resize、失去焦点事件处理器
     *
     * @param event 指针设备点击、可视窗口resize、失去焦点事件
     */
    const eventHandler = (event: PointerEvent | UIEvent) => {
      // 1.若窗口大小发生变化, 则直接销毁弹出层
      if (event.type == 'resize') {
        expand.value = visible.value = false;
        return;
      }

      // 2.若窗口失去焦点, 则关闭弹出层
      if (event.type == 'blur') {
        expand.value = false;
        return;
      }

      const element = event.target as HTMLElement;
      // event.preventDefault();

      // 3.若点击的弹出层, 则什么也不做
      if (popover.value && popover.value.contains(element)) {
        // 若点击弹出层内部的触发关闭的元素, 那么关闭弹出层
        if (element.classList.contains('--popover-close')) {
          expand.value = false;
        }
        return;
      }

      // 4.若弹出层已被展开 ;
      //   若不是鼠标设备的主按钮所点击 ;
      //   若点击的不是触发源节点 或是其子节点 .
      if (expand.value /*|| (event as PointerEvent).button !== 0*/
          || !el.value || !el.value.contains(element)) {
        // 关闭弹出层
        return void (expand.value = false);
      }

      // 5.若点击的是触发源节点 或其子节点

      visible.value = true;

      // 若未指定弹出层的位置, 则计算后得到定位样式和placement
      if (!props.placement) {
        nextTick(computePosition);

      } else {
        // 否则弹出层的位置由指定prop决定
        placementRef.value = props.placement || 'bottom';
      }

      requestAnimationFrame(() => void (expand.value = true));
    };

    /**
     * 弹出层被点击时, 若弹出层可关闭, 则关闭它
     *
     * @param event 指针设备点击事件
     */
    const onClick = (event: PointerEvent) => {
      if (props.closeable) {
        event.stopPropagation();
        expand.value = false;
      }
    };

    /**
     * 过度动画结束时, 若未展开弹出层, 则销毁弹出层
     */
    const onAnimationEnd = () => {
      if (!expand.value) {
        visible.value = false;
      }
    };

    // window.addEventListener('blur', eventHandler);
    // window.addEventListener('resize', eventHandler);
    document.addEventListener('pointerdown', eventHandler);

    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', eventHandler);
      window.removeEventListener('resize', eventHandler);
      window.removeEventListener('blur', eventHandler);
    });

    return {el, popover, visible, expand, style, placementRef, onClick, onAnimationEnd};
  }

});
</script>
