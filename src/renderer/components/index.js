import Accordion from "./Accordion";
import Button from './ButtonBase';
import CheckBox from "./CheckBox";
import TableView from "./TableView";
import TextField from "./TextField";
import Slider from "./Slider";
import Modal from "./Modal";
import Pagination from "./Pagination";

import {createVNode, render, ref, getCurrentInstance} from "vue";

// Message组件构建模板
const MessageComponent = {
    template: `
      <transition name="message-fade" @before-leave="onClose" @after-leave="$emit('destroy')">
      <div class="message" ref="el" v-show="visible" :style="{top: topOffset+'px'}"
           :class="[type, center?'center':null, showClose?'closeable':null, customClass]">

        <svg width="1em" height="1em" viewBox="0 0 16 16" class="message-icon">
          <path :d="icon"></path>
        </svg>

        <slot>
          <div class="content">{{ message }}</div>
        </slot>

        <svg width="1em" height="1em" viewBox="0 0 16 16" v-if="showClose" class='close-icon' @click="close">
          <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </div>
      </transition>
    `,

    props: {
        message: null, showClose: null, topOffset: 0,
        duration: {type: Number, default: 5000},
        onClose: {type: Function, default: null}
    },
    emits: ['destroy'],

    setup(props) {
        const visible = ref(false);
        const type = ref('info');
        const icon = ref(null);
        const onClose = ref(null);
        const customClass = ref(null);
        const closed = ref(false);
        const center = ref(null);

        /**动画结束后,移除并销毁dom*/
        const onAnimateEnd = () => {
            /** @type {HTMLElement} */
            let el = getCurrentInstance().refs.el;
            el.onmouseenter = el.onmouseleave = null;
            el.remove();
        };

        const close = () => {
            closed.value = true;
            visible.value = false;
            props.onClose instanceof Function ? props.onClose() : null;
        }

        /*message,showClose,duration, topOffset, timer, */
        return {visible, type, icon, onClose, customClass, closed, center, onAnimateEnd, close};
    },

    mounted() {
        // Message 图标类型
        const TYPE_MAP = {
            info: 'M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412l-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
            success: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z',
            warning: 'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z',
            error: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z'
        };

        // 确保message类型是一个支持的类型
        this.type = this.type && TYPE_MAP[this.type] ? this.type : 'info';
        // 获取对应类型的图标
        this.icon = TYPE_MAP[this.type];

        let timer, startTimer = () => this.duration > 0 && !this.closed ?
            timer = setTimeout(this.close, this.duration) : null;

        this.$el.onmouseenter = () => clearTimeout(timer);
        this.$el.onmouseleave = startTimer;
        startTimer(startTimer = null);
        this.visible = true;
    }
};

export default {
    /**
     * 安装组件
     * @param Vue {App<HostElement = any>} Vue应用实例
     */
    install(Vue) {
        /**************** Spinner START ****************/
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        spinner.innerHTML = `<div class="arc-container"><div class="arc-left"><div class="arc-inner"></div></div><div class="arc-right"><div class="arc-inner"></div></div></div><svg class="spinner-inner-icon" viewBox="0 0 110 110"><path d="M60.06 97.9c-10.9 3.377-22.218-1.219-25.286-10.264s3.279-19.115 14.177-22.492a23.728 23.728 0 0 1 13.214-.318l-24.065-33.226a3.053 3.053 0 0 1-.322-2.05c1.516-8.335 15.833-11.13 15.833-11.13 14.412-2.02 16.482-7.42 16.482-7.42 4.515 14.346-5.172 20.056-5.172 20.056-5.372 4.396-14.546 3.644-14.546 3.644l22.814 38.016-.3-.192a14.766 14.766 0 0 1 1.345 2.882c3.066 9.045-3.277 19.115-14.174 22.494z"></path></svg>`;

        /**
         * 显示进度旋转器.(可选,默认以document.body元素作为父元素)
         * @param parent {Element | HTMLElement} 进度旋转器的父元素
         */
        spinner.open = (parent = document.body) => parent.appendChild(spinner);

        /**关闭进度旋转器*/
        spinner.close = () => spinner.remove();
        /**************** Spinner   END ****************/


        /**************** Message START ****************/
        let instances = [], count = 0;

        /**
         * 通过配置选项在页面上显示消息
         *
         * @param options {Object|String} 配置选项
         * @return {Object} message对象
         */
        const Message = options => {
            options = options || {};
            if (typeof options === 'string') {
                options = {message: options};
            }

            let id = instances.length ? ++count : (count = 0);
            // 将onClose方法传入到Message.vue
            options.onClose = () => Message.close(id);

            // 计算当前message在竖直方向上的起始位置
            options.topOffset = options.topOffset || 20;
            instances.forEach(item => options.topOffset += (item.el.offsetHeight || 0) + 16);

            /** @type {Object} */
                // let instance = createApp(MessageComponent, options),
            let vm = createVNode(MessageComponent, options);
            let root = document.createElement('div');

            vm.props.onDestroy = () => {
                console.info('onDestroy()...')
                render(null, root);
                root = null;
            };

            render(vm, root);
            document.body.appendChild(root.firstElementChild);

            vm.$nodeId = id;
            instances.push(vm);
        };

        // 注册不同类型的消息方法
        ['success', 'warning', 'info', 'error'].forEach(type => {
            Message[type] = options => {
                if (typeof options === 'string') {
                    options = {message: options};
                }
                options.type = type;
                Message(options);
            };
        });

        /**
         * 关闭指定id的message消息
         * @param id message ID
         */
        Message.close = id => {
            // vm.component.props.$nodeId === id
            let index = instances.findIndex(vm => vm.$nodeId === id);
            if (index === -1) {
                return;
            }

            const vm = instances[index];
            instances.splice(index, 1);
            const len = instances.length;
            if (!len) {
                return;
            }

            // 当前被关闭的节点之后的所有可视消息节点的top位置都减少以下值
            const reduce = vm.el.offsetHeight + 16;
            for (; index < len; ++index) {
                instances[index].component.props.topOffset =
                    parseInt(instances[index].el.style.top) - reduce;
            }
        };

        // 关闭所有message的方法
        Message.closeAll = () => {
            for (let i = instances.length - 1; i >= 0; --i) {
                instances[i].close();
            }
        };
        /**************** Message END ****************/

        // 注册组件
        Vue.component(Button.name, Button);
        Vue.component(CheckBox.name, CheckBox);
        Vue.component(TableView.name, TableView);
        Vue.component(TextField.name, TextField);
        Vue.component(Slider.name, Slider);
        Vue.component(Accordion.name, Accordion);
        Vue.component(Modal.name, Modal);
        Vue.component(Pagination.name, Pagination);

        // 将扩展组件初始化到全局配置
        Vue.config.globalProperties.$spinner = spinner;
        Vue.config.globalProperties.$message = Message;
    }
}