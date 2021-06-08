import {KuGouSource} from './kugou';
import {QQMusicSource} from "./tencent";

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
         * @returns {Promise<{data:Object | String, headers:any, statusCode:Number, statusMessage:String}>} 异步对象Promise
         */
        const http = options => new Promise(resolve => {
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

            // 传递请求到主进程,并等待主进程发起网络请求,然后返回响应数据
            ipcRender.invoke('net-request', options).then(data => {
                // 反序列化数据
                data = JSON.parse(data);
                Vue.prototype.$message(`状态码：${data.statusCode}, 消息：${data.statusMessage}`);

                // 若配置选项提供响应内容为文本,则直接返回字符串,否则返回反序列化后的对象
                data.data = options.isText ? data.data : JSON.parse(data.data);
                // 从pending状态变成resolved状态
                resolve(data);

            }).catch(reason => {
                Vue.prototype.$message(`请求失败:${reason}`);
                resolve(reason);
            });
        });

        /**
         * 发起GET请求.若传入的参数只是一个字符串则,会认为是目标URL
         * @param options {Object | String} 配置选项
         * @return {Promise<{data:Object | String, headers:any, statusCode:Number, statusMessage:String}>} 异步对象Promise
         */
        http.get = options => {
            // 转换为配置选项对象
            if ((typeof options) === 'string') {
                options = {url: options};
            }
            // 设置为GET请求
            options.method = 'get';
            return http(options);
        };

        /**
         * 发起POST请求.若传入的参数只是一个字符串,则会认为是目标URL
         * @param options {Object | String} 配置选项
         * @return {Promise<{data:Object | String, headers:any, statusCode:Number, statusMessage:String}>} 异步对象Promise
         */
        http.post = options => {
            // 转换为配置选项对象
            if ((typeof options) === 'string') {
                options = {url: options};
            }
            // 设置为POST请求
            options.method = 'post';
            return http(options);
        };

        KuGouSource.http = QQMusicSource.http = http;
        Vue.prototype["$source"] = {KuGouSource, QQMusicSource, impl: KuGouSource};
        Vue.prototype["$http"] = http;
    }
}
