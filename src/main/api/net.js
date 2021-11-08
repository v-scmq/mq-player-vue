import {request as httpRequest} from 'http';
import {request as httpsRequest} from 'https';

/**
 * @typedef {Object} RequestParam 请求信息
 *
 * @property {string} url                                           访问路径
 * @property {Record<string, string>} headers                       请求头
 * @property {'get' | 'post' | undefined} method                    请求方式
 * @property {string | Object | undefined} data                     发送到服务器的数据
 * @property {boolean | undefined} isMobile                         是否模拟手机端请求
 * @property {'json' | 'text' | 'buffer' | undefined} responseType  数据响应类型
 * @property {'json' | 'form-data' | undefined} dataType            post请求提交的数据类型
 */

/**
 * @typedef {Object} ResponseData 响应信息
 *
 * @property {number} statusCode                       响应状态码
 * @property {Record<string, string>} headers          响应头信息
 * @property {Object | Buffer | string} data           响应数据
 */

/**
 * 发起网络请求(默认get请求)
 *
 * @param {RequestParam} options 配置选项对象
 * @returns {Promise<ResponseData>} 异步对象Promise
 */
const http = options => new Promise(resolve => {
    // assert options instanceof Object === true
    // assert (!!options.url) === true
    // assert options.header instanceof Object === true

    // 若没有提供UA信息,则提供默认的UA信息
    if (!options.headers['User-Agent']) {
        options.headers['User-Agent'] = options.isMobile ?
            // 用户代理 手机浏览器标识
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36'
            // 用户代理 PC浏览器标识
            : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';
    }

    // 若没有提供引用页面信息,则使用访问的URL作为引用页面
    if (!options.headers.referer) {
        options.headers.referer = options.url;
    }

    const method = options.method || 'get'

    // 若有提交的数据,必须设置请求的中的内容类型
    if (method === 'post' && options.data) {
        options.headers['Content-Type'] = ((typeof options.data) === 'string') && options.dataType === 'form-data' ?
            'application/x-www-form-urlencoded;charset=UTF-8' : 'application/json;charset=UTF-8';
    }

    // 必须由协议相对应的处理器去发起网络请求
    /** @type {httpRequest | httpsRequest | Function} */
    const handler = options.url.indexOf('https') === 0 ? httpsRequest : httpRequest;

    // 发起网络请求
    const request = handler(options.url, {method: options.method, headers: {...options.headers}},
        /** @type {module:http.IncomingMessage} */response => {

            const buffers = [];

            // 数据得到响应时,拼接响应数据
            response.on('data', chunk => buffers.push(chunk))

            // 改变Promise对象状态:由pending(进行中)转变为resolved(已成功)
            // 数据响应完成时,promise对象状态变为resolved以将数据返回
            response.once('end', () => {
                /** @type {Buffer | string} */
                let data = Buffer.concat(buffers);

                let {responseType: type} = options;

                // 若配置选项提供返回类型是字节类型,那么返回的将是Buffer(Uint8Array子类)类型
                if (type === 'buffer') {
                    return resolve({statusCode: response.statusCode, headers: response.headers, data});
                }

                data = data.toString();

                // 若配置选项提供响应内容为文本,则直接返回字符串
                if (type === 'text') {
                    return resolve({statusCode: response.statusCode, headers: response.headers, data});
                }

                // 配置选项提供响应类型为JSON(默认),那么返回反序列化后的JSON格式的对象
                try {
                    data = JSON.parse(data);
                    resolve({statusCode: response.statusCode, headers: response.headers, data});
                } catch (error) {
                    // 若转换为JSON数据失败, 则返回文本
                    resolve({statusCode: response.statusCode, headers: response.headers, data});
                }
            });
        });

    // 当前网络请求发生错误时
    request.once('error', error => resolve(error.toString()));

    // post请求时且存在数据时, 将数据通过输出流管道发送到目标服务器
    if (method === 'post' && options.data) {
        const data = options.data;
        request.write(((typeof data) === 'string') ? data :
            (typeof data) === 'object' ? JSON.stringify(data) : data.toString());
    }

    // 结束发送请求
    request.end();
});

/**
 * 发起GET请求
 *
 * @param {RequestParam} options 配置选项对象
 * @returns {Promise<ResponseData>} 异步对象Promise
 */
http.get = options => {
    // 设置为GET请求
    options.method = 'get';
    return http(options);
};

/**
 * 发起POST请求
 *
 * @param {RequestParam} options 配置选项对象
 * @returns {Promise<ResponseData>} 异步对象Promise
 */
http.post = options => {
    // 设置为POST请求
    options.method = 'post';
    return http(options);
};

export default http;