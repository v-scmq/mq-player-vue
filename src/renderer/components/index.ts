import {App} from 'vue';

import Accordion from './Accordion.vue';
import Button from './Button.vue';
import CheckBox from './CheckBox.vue';
import TableView from './TableView.vue';
import TextField from './TextField.vue';
import Slider from './Slider.vue';
import Modal from './Modal.vue';
import Pagination from './Pagination.vue';
import Icon from './Icon.vue';
import GridView from './GridView.vue'

export default {
    /**
     * 安装组件
     * @param {App<HostElement = any>} Vue Vue应用实例
     */
    install(app: App) {
        // 注册组件
        app.component(Button.name, Button);
        app.component(CheckBox.name, CheckBox);
        app.component(TableView.name, TableView);
        app.component(TextField.name, TextField);
        app.component(Slider.name, Slider);
        app.component(Accordion.name, Accordion);
        app.component(Modal.name, Modal);
        app.component(Pagination.name, Pagination);
        app.component(Icon.name, Icon);
        app.component(GridView.name, GridView);
    }
}