import {App} from 'vue';

import Accordion from './Accordion.vue';
import HlButton from './Button.vue';
import CheckBox from './CheckBox.vue';
import TableView from './TableView.vue';
import TextField from './TextField.vue';
import TabPane from './TabPane.vue';
import Slider from './Slider.vue';
import Modal from './Modal.vue';
import Pagination from './Pagination.vue';
import Icon from './Icon.vue';
import GridView from './GridView.vue'
import ImageView from './ImageView.vue';
import Popover from './Popover.vue';

export default {
    /**
     * 安装组件
     * @param app Vue应用实例
     */
    install(app: App) {
        const Vue = app;
        // 注册组件
        Vue.component(HlButton.name, HlButton);
        Vue.component(CheckBox.name, CheckBox);
        Vue.component(TableView.name, TableView);
        Vue.component(TextField.name, TextField);
        Vue.component(TabPane.name, TabPane);
        Vue.component(Slider.name, Slider);
        Vue.component(Accordion.name, Accordion);
        Vue.component(Modal.name, Modal);
        Vue.component(Pagination.name, Pagination);
        Vue.component(Icon.name, Icon);
        Vue.component(GridView.name, GridView);
        Vue.component(ImageView.name, ImageView);
        Vue.component(Popover.name, Popover);
    }
}