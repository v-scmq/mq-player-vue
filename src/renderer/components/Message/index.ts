import { createVNode, render, VNode } from 'vue';
import MessageConstructor from './Message.vue';

/** Message类型 */
type MessageType = 'success' | 'warning' | 'error' | 'info';

/**
 * 消息配置选项
 */
type MessageOptions = {
  /** 消息文本 */
  message: string;
  /** 消息类型 */
  type?: MessageType;
  /** 是否显示关闭图标 */
  showClose?: boolean;
  /** 消息显示时间(单位: 毫秒) */
  duration?: number;
  /** 消息在关闭时的回调 */
  onClose?: () => void;
  /** 消息在可视区域的上边缘偏移量(单位:像素) */
  topOffset?: number;
};

/** Message构造器 */
type MessageFn = (options: string | MessageOptions) => void;

/** Message的info、success、warring、error类型方法 */
type MessageTypedFn = {
  [key in MessageType]: (options: string | Omit<MessageOptions, 'type'>) => void;
};

/**
 * Message组件
 */
type MessageComponent = MessageFn &
  MessageTypedFn & {
    /**
     * 通过指定的message id,来关闭Message
     *
     * @param id message id
     */
    close(id: string): void;

    /**
     * 关闭所有Message
     */
    closeAll(): void;
  };

/** Message组件构建模板 */
/** 存放所有正在显示的Message的VNode(虚拟DOM节点)对象 */
const instances: VNode[] = [];

// @ts-ignore
const Msg: MessageComponent = (options: string | MessageOptions) => {
  // 参见: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
  // 下一次重绘之前更新动画帧所调用(在可见时,显示Message, 才能保证每一个Message的高度被正确获得)
  requestAnimationFrame(() => {
    if (typeof options === 'string') {
      options = { message: options };
    }

    // 确保类型是在 TYPE_MAP对象中的key 中
    options.type = options.type || 'info';
    // 生成随机id
    const id = `${Math.random()}-${new Date().getTime()}`;
    // 获取配置选项所提供的关闭回调
    const onClose = options.onClose;

    // 覆盖传入的onClose方法
    options.onClose = () => {
      // 关闭Message
      Msg.close(id);
      // 若指定了关闭时的回调,则调用它
      onClose && onClose();
    };

    // 计算当前message在竖直方向上的起始位置
    options.topOffset = options.topOffset || 20;

    for (const vm of instances) {
      options.topOffset += ((<HTMLElement>vm.el).offsetHeight || 0) + 16;
    }

    const vm = createVNode(MessageConstructor, options);
    let root: HTMLDivElement | null = document.createElement('div');

    (<any>vm.props).onDestroy = () => {
      render(null, <HTMLDivElement>root);
      root = null;
    };

    render(vm, root);
    document.body.appendChild(<HTMLDivElement>root.firstElementChild);

    (<any>vm).$nodeId = id;
    instances.push(vm);
  });
};

/**
 * 初始化 'info' , 'success' , 'warning' , 'error' 类型的Message方法
 */
(['success', 'info', 'warning', 'error'] as MessageType[]).forEach(key => {
  Msg[key] = options => {
    if (typeof options === 'string') {
      options = { message: options };
    }

    (<MessageOptions>options).type = key;
    Msg(options);
  };
});

/**
 * 关闭指定id的message消息
 *
 * @param {string} id message ID
 */
Msg.close = (id: string) => {
  let index = instances.findIndex(vm => (<any>vm).$nodeId === id);
  if (index === -1) {
    return;
  }

  // 获取需要删除的Message
  const vm = instances[index];
  // 删除指定的Message
  instances.splice(index, 1);
  // Message个数
  const length = instances.length;

  if (length > 0) {
    // 当前被关闭的节点之后的所有可视消息节点的top位置都减少以下值
    const reduce = (vm.el as HTMLElement).offsetHeight + 16;
    for (; index < length; ++index) {
      (<any>instances[index].component).props.topOffset =
        parseInt((instances[index].el as HTMLElement).style.top) - reduce;
    }
  }
};

/**
 * 关闭所有message的方法
 */
Msg.closeAll = () => {
  for (let i = instances.length - 1; i >= 0; --i) {
    (<any>instances[i]).close();
  }
};

export const Message = Msg;
