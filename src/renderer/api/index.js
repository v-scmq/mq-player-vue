import {KuGouSource} from './kugou';

/** 用户代理 PC浏览器标识 */
const USER_AGENT_PC = navigator.userAgent;

/** 用户代理 手机浏览器标识 */
const USER_AGENT_MOBILE = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36';

export default {
    install(Vue) {
        let ipcRender = Vue.prototype.$electron ? Vue.prototype.$electron.ipcRenderer : null;

        /**
         * 发起网络请求(默认GET请求)
         * @param options {Object} 配置选项对象
         * @returns {Promise<{data:Object,[property]:any}>} 异步对象Promise
         */
        const http = async options => {
            let headers = options.headers || {};
            // 若没有提供UA信息,则提供默认的UA信息
            if (!headers['User-Agent']) {
                headers['User-Agent'] = options.isMobile ? USER_AGENT_MOBILE : USER_AGENT_PC;
            }

            // 若没有提供来源页面信息,则提供默认的url部分
            if (!headers.referer) {
                headers.referer = options.url;
            }

            // 若有提交的数据,必须设置请求的中的内容类型
            if (options.data) {
                options.headers['Content-Type'] = (typeof options.data === 'object') ?
                    'application/json;charset=UTF-8' : 'application/x-www-form-urlencoded;charset=UTF-8';
            }
            // 重新设置header
            options.headers = headers;
            // 传递信到主进程,并等待主进程返回响应数据集
            let data = await ipcRender.invoke('net-request', options);
            // 若配置选项提供响应内容为文本,则直接返回字符串,否则返回反序列化后的对象
            return options.isText ? data : JSON.parse(data);
        };

        /**
         * 发起GET请求.若传入的参数只是一个字符串则会认为是目标URL
         * @param options {String|Object} 配置选项
         * @return {Promise<{data:Object,[property]:any}>} 异步对象Promise
         */
        http.get = async options => {
            // 转换为配置选项对象
            if ((typeof options) === 'string') {
                options = {url: options};
            }
            // 设置为GET请求
            options.method = 'GET';
            return await http(options);
        };

        /**
         * 发起POST请求.若传入的参数只是一个字符串则会认为是目标URL
         * @param options {String|Object} 配置选项
         * @return {Promise<{data:Object,[property]:any}>} 异步对象Promise
         */
        http.post = async options => {
            // 转换为配置选项对象
            if ((typeof options) === 'string') {
                options = {url: options};
            }
            // 设置为POST请求
            options.method = 'POST';
            return await http(options);
        };

        KuGouSource.http = http;
        Vue.prototype["$source"] = {KuGouSource, impl: KuGouSource};
        Vue.prototype["$http"] = http;
    }
}
