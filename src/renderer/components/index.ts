import Accordion from './Accordion';
import Button from './Button';
import CheckBox from './CheckBox';
import TableView from './TableView';
import TextField from './TextField';
import Slider from './Slider';
import Modal from './Modal';
import Pagination from './Pagination';
import Icon from './Icon';
import GridView from './GridView'

export default {
    /**
     * 安装组件
     * @param {App<HostElement = any>} Vue Vue应用实例
     */
    install(Vue) {
        // 注册组件
        Vue.component(Button.name, Button);
        Vue.component(CheckBox.name, CheckBox);
        Vue.component(TableView.name, TableView);
        Vue.component(TextField.name, TextField);
        Vue.component(Slider.name, Slider);
        Vue.component(Accordion.name, Accordion);
        Vue.component(Modal.name, Modal);
        Vue.component(Pagination.name, Pagination);
        Vue.component(Icon.name, Icon);
        Vue.component(GridView.name, GridView);
    }
}