import {createVNode, render, ref, VNode, defineComponent, PropType} from 'vue';

/**  Message 图标类型 */
const TYPE_MAP = {
    info: 'M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412l-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
    success: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z',
    warning: 'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z',
    error: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z'
} as const;

/** Message类型 */
type MessageType = keyof typeof TYPE_MAP;

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
    /** (仅内部使用)消息在关闭时的回调 */
    onClose?: () => void;
    /** (仅内部使用)消息在可视区域的上边缘偏移量(单位:像素) */
    topOffset?: number;
}

/** Message构造器 */
type MessageConstructor = (options: string | MessageOptions) => void;

/** Message的info、success、warring、error类型方法 */
type MessageTypedFn = {
    [key in MessageType]: MessageConstructor
}

/**
 * Message组件
 */
type MessageComponent = {
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

} & MessageConstructor & MessageTypedFn;

/** Message组件构建模板 */
const MessageComponentOptions = defineComponent({
    template: `
      <transition name='message-fade' :duration='duration' @before-leave='close' @after-leave="$emit('destroy')">
      <div class='message' v-show='visible' :style="{top: topOffset + 'px'}" @mouseenter='clearTimer'
           @mouseleave='startTimer' :class="[type, showClose ? 'closeable' : null]">

        <svg width='1em' height='1em' viewBox='0 0 16 16' class='message-icon'>
          <path :d='icon'></path>
        </svg>

        <div class='content'>{{ message }}</div>

        <svg width='1em' height='1em' viewBox='0 0 16 16' v-if='showClose' class='close-icon' @click='close'>
          <path
              d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z'/>
        </svg>
      </div>
      </transition>
    `,

    props: {
        message: String,
        type: {type: String as PropType<MessageType>, required: true},
        showClose: {type: Boolean, default: false},
        topOffset: {type: Number, default: 0},
        duration: {type: Number, default: 5000},
        onClose: {type: Function, default: null}
    },

    emits: ['destroy'],

    setup(props) {
        // 初始不可见
        const visible = ref(false);

        // 获取对应类型的图标
        const icon = ref(TYPE_MAP[props.type] || TYPE_MAP['info']);

        // 数值计时器
        let timer: number | null;

        // 关闭,并调用传递过来的onClose方法
        const close = () => {
            visible.value = false;
            props.onClose && props.onClose();
        };

        // 清除计时器
        const clearTimer = () => {
            if (timer != null) {
                window.clearTimeout(timer);
                timer = null;
            }
        };

        // 启动计时器
        const startTimer = () => {
            // 清除之前的计时器
            clearTimer();
            // 重新开始计时
            if (props.duration > 0) {
                timer = window.setTimeout(close, props.duration)
            }
        };

        // 以动画帧开始显示
        requestAnimationFrame(() => {
            visible.value = true;
            // 开始计时
            startTimer();
        });

        return {visible, icon, close, clearTimer, startTimer};
    }
});


/** 存放所有正在显示的Message的VNode(虚拟DOM节点)对象 */
const instances: VNode[] = [];

// @ts-ignore
const Message: MessageComponent = (options: string | MessageOptions) => {
    options = options || {} as MessageOptions;
    if (typeof options === 'string') {
        options = {message: options};
    }

    // 确保类型是在 TYPE_MAP对象中的key 中
    options.type = options.type || 'info';

    const id = `${Math.random()}-${new Date().getTime()}`;
    // 将onClose方法传入到Message.vue
    options.onClose = () => Message.close(id);

    // 计算当前message在竖直方向上的起始位置
    options.topOffset = options.topOffset || 20;
    // @ts-ignore
    instances.forEach(item => options.topOffset += (item.el.offsetHeight || 0) + 16);

    const vm = createVNode(MessageComponentOptions, options);
    let root: HTMLDivElement | null = document.createElement('div');

    (<any>vm.props).onDestroy = () => {
        render(null, <HTMLDivElement>root);
        root = null;
    };

    render(vm, root);
    document.body.appendChild(<HTMLDivElement>root.firstElementChild);

    (<any>vm).$nodeId = id;
    instances.push(vm);
};

/**
 * 初始化 'info' , 'success' , 'warning' , 'error' 类型的Message方法
 */
(Object.keys(TYPE_MAP) as MessageType[]).forEach(key => {
    Message[key] = (options: MessageOptions | string) => {
        if (typeof options === 'string') {
            options = {message: options};
        }

        options.type = key;
        Message(options);
    };
});

/**
 * 关闭指定id的message消息
 *
 * @param {string} id message ID
 */
Message.close = (id: string) => {
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
Message.closeAll = () => {
    for (let i = instances.length - 1; i >= 0; --i) {
        (<any>instances[i]).close();
    }
};

export default Message;