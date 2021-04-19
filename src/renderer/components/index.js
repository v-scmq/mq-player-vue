import Button from './Button';
import CheckBox from "./CheckBox";
import Table from "./Table";
import TextField from "./TextField";
import Slider from "./Slider";
import Spinner from "./Spinner";
import Accordion from "./Accordion";

import MessageControl from "./Message";

export default {
    /**
     * 初始化进度旋转器
     * @param Vue Vue Class
     */
    initializeSpinner(Vue) {
        // 继承 Spinner组件,并扩展open方法和close方法
        const SpinnerConstructor = Vue.extend(Spinner);

        /**
         * 显示进度旋转器
         * @param parent {Element | HTMLElement} 进度旋转器的父元素
         */
        SpinnerConstructor.prototype.open = function (parent) {
            if (this.$el) {
                if (!parent.contains(this.$el)) parent.appendChild(this.$el);
            } else {
                this.$mount().$nextTick(() => parent.appendChild(this.$el));
            }
        };

        /**关闭进度旋转器*/
        SpinnerConstructor.prototype.close = function () {
            this.$el.remove();
        };

        Vue.prototype['$spinner'] = new SpinnerConstructor();
    },

    /**
     *
     * @param Vue
     */
    initializeMessage(Vue) {
        let MessageConstructor = Vue.extend(MessageControl);

        let instance, instances = [], count = 0;

        const Message = options => {
            if (Vue.prototype.$isServer) return;
            options = options || {};
            if (typeof options === 'string') {
                options = {message: options};
            }

            let id = ++count;
            // 将onClose方法传入到Message.vue
            options.onClose = () => Message.close(id);
            instance = new MessageConstructor({data: options});
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
                    removedHeight = instance.$el.offsetHeight;
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
        Vue.component(Table.name, Table);
        Vue.component(TextField.name, TextField);
        Vue.component(Slider.name, Slider);
        Vue.component(Accordion.name, Accordion);

        this.initializeSpinner(Vue);
        this.initializeMessage(Vue);
    }
}

