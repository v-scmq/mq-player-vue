import Accordion from "./Accordion";
import Button from './ButtonBase';
import CheckBox from "./CheckBox";
import TableView from "./TableView";
import TextField from "./TextField";
import Slider from "./Slider";
import Spinner from "./Spinner";

import MessageControl from "./Message";

export default {
    /**
     * 初始化进度旋转器
     * @param Vue Vue Class
     */
    initializeSpinner(Vue) {
        // 继承 Spinner组件,并扩展open方法和close方法
        const spinner = new (Vue.extend(Spinner))();

        /**
         * 显示进度旋转器.(可选,默认以document.body元素作为父元素)
         * @param parent {Element | HTMLElement} 进度旋转器的父元素
         */
        spinner.open = (parent = document.body) => {
            // 若DOM元素已被挂载
            if (spinner.$el) {
                parent.appendChild(spinner.$el);
            } else {
                spinner.$mount().$nextTick(() => parent.appendChild(spinner.$el));
            }
        };

        /**关闭进度旋转器*/
        spinner.close = () => spinner.$el ? spinner.$el.remove() : null;

        Vue.prototype['$spinner'] = spinner;
    },

    /**
     *
     * @param Vue
     */
    initializeMessage(Vue) {
        const MessageConstructor = Vue.extend(MessageControl);
        let instances = [], count = 0;

        /**
         * 通过配置选项在页面上显示消息
         *
         * @param options {Object|String} 配置选项
         * @return {Object} message对象
         */
        const Message = options => {
            if (Vue.prototype.$isServer) return null;
            options = options || {};
            if (typeof options === 'string') {
                options = {message: options};
            }

            let id = ++count;
            // 将onClose方法传入到Message.vue
            options.onClose = () => Message.close(id);

            /** @type {Object} */
            let instance = new MessageConstructor({data: options});
            instance.id = id;

            // 计算当前message在竖直方向上的起始位置
            let verticalOffset = options.offset || 20;
            instances.forEach(item => verticalOffset += item.$el.offsetHeight + 16);
            document.body.appendChild(instance.$mount().$el);
            // 可见后才执行后续操作
            instance.verticalOffset = verticalOffset;
            instance.$el.style.zIndex = id;
            instance.visible = true;
            instances.push(instance);

            return instance;
        };

        // 注册不同类型的消息方法
        ['success', 'warning', 'info', 'error'].forEach(type => {
            Message[type] = options => {
                if (typeof options === 'string') {
                    options = {message: options};
                }
                options.type = type;
                return Message(options);
            };
        });

        /**
         * 关闭指定id的message消息
         * @param id message ID
         */
        Message.close = function (id) {
            let length = instances.length, index, removedHeight;
            for (index = 0; index < length; ++index) {
                if (id === instances[index].id) {
                    removedHeight = instances[index].$el.offsetHeight;
                    instances.splice(index, 1);
                    --length;
                    break;
                }
            }

            for (let i = index; i < length; ++i) {
                let dom = instances[i].$el;
                dom.style.top = `${parseInt(dom.style.top) - removedHeight - 16}px`;
            }
        };

        // 关闭所有message的方法
        Message.closeAll = () => {
            for (let i = instances.length - 1; i >= 0; --i) {
                instances[i].close();
            }
        };

        // 将message()方法放入Vue原型上
        Vue.prototype['$message'] = Message;
    },

    /**
     * 安装组件
     * @param Vue Vue class
     */
    install(Vue) {
        Vue.component(Button.name, Button);
        Vue.component(CheckBox.name, CheckBox);
        Vue.component(TableView.name, TableView);
        Vue.component(TextField.name, TextField);
        Vue.component(Slider.name, Slider);
        Vue.component(Accordion.name, Accordion);

        this.initializeSpinner(Vue);
        this.initializeMessage(Vue);
    }
}

