import {request as httpRequest, IncomingMessage, IncomingHttpHeaders} from 'http';
import {request as httpsRequest} from 'https';

/**
 * 请求参数信息
 */
type RequestParam = {
    /** 访问路径 */
    url: string;
    /** 请求头 */
    headers: IncomingHttpHeaders;
    /** 请求方式 */
    method?: 'get' | 'post';
    /** 发送到服务器的数据 */
    data?: string | Record<string, any>;
    /** 是否模拟手机端请求 */
    isMobile?: boolean;
    /** 数据响应类型 */
    responseType?: 'json' | 'text' | 'buffer';
    /** post请求提交的数据类型 */
    dataType?: 'json' | 'form-data';
}

/**
 * 响应信息
 */
type ResponseData = {
    /** 响应状态码 */
    statusCode: number;
    /** 响应头信息 */
    headers: IncomingHttpHeaders;
    /** 响应数据 */
    data: Record<string, any> | Buffer | string;
}

/**
 * Http(s)客户端请求, 发起网络请求(默认get请求)
 */
type HttpClient = ((options: RequestParam) => Promise<ResponseData>) & {
    /**
     * 发起get请求
     *
     * @param options 配置选项对象
     * @returns {Promise<ResponseData>} 异步对象Promise
     */
    get(options: Omit<RequestParam, 'method'>): Promise<ResponseData>,

    /**
     * 发起post请求
     *
     * @param options 配置选项对象
     * @returns {Promise<ResponseData>} 异步对象Promise
     */
    post(options: Omit<RequestParam, 'method'>): Promise<ResponseData>,
}

/**
 * 发起网络请求(默认get请求)
 *
 * @param options 配置选项对象
 */
const http: HttpClient = options => new Promise(resolve => {
    // assert options instanceof Object === true
    // assert (!!options.url) === true
    // assert options.header instanceof Object === true

    // 若没有提供UA信息,则提供默认的UA信息
    if (!options.headers['user-agent']) {
        options.headers['user-agent'] = options.isMobile ?
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
        options.headers['content-type'] = ((typeof options.data) === 'string') && options.dataType === 'form-data' ?
            'application/x-www-form-urlencoded;charset=UTF-8' : 'application/json;charset=UTF-8';
    }

    /**
     * 响应信息处理器
     *
     *  @param response 响应信息
     */
    const handler = (response: IncomingMessage) => {
        // 响应错误时,返回错误信息
        response.once('error', reason => resolve({
            statusCode: response.statusCode || 200,
            headers: response.headers,
            data: reason
        }));

        const buffers: Buffer[] = [];

        // 数据得到响应时,拼接响应数据
        response.on('data', chunk => buffers.push(chunk));

        // 改变Promise对象状态:由pending(进行中)转变为resolved(已成功)
        // 数据响应完成时,promise对象状态变为resolved以将数据返回
        response.once('end', () => {
            const data: Buffer | string = Buffer.concat(buffers);
            // 响应类型
            const {responseType: type} = options;

            // 返回结果值
            const result = {statusCode: response.statusCode || 200, headers: response.headers, data};

            // 若配置选项提供返回类型是字节类型,那么返回的将是Buffer(Uint8Array子类)类型
            if (type === 'buffer') {
                return resolve(result);
            }

            // @ts-ignore
            result.data = (<Buffer>data).toString();

            // 若配置选项提供响应内容为文本,则直接返回字符串
            if (type === 'text') {
                return resolve(result);
            }

            // 配置选项提供响应类型为JSON(默认),那么返回反序列化后的JSON格式的对象
            try {
                result.data = JSON.parse(result.data as unknown as string);
                resolve(result);
            } catch (error) {
                // 若转换为JSON数据失败, 则返回文本
                resolve(result);
            }
        });
    };

    // 新的请求配置对象
    const newOptions = {method, headers: options.headers};

    // 发起网络请求(不同的协议, 使用不同的请求处理器发送)
    const request = options.url.includes('https')
        ? httpsRequest(options.url, newOptions, handler)
        : httpRequest(options.url, newOptions, handler);

    // 当前网络请求发生错误时
    request.once('error', reason => resolve({data: reason} as unknown as ResponseData));

    // post请求时且存在数据时, 将数据通过输出流管道发送到目标服务器
    if (method === 'post' && options.data) {
        const data = options.data;
        request.write(((typeof data) === 'string') ? data :
            (typeof data) === 'object' ? JSON.stringify(data) : data.toString());
    }

    // 结束发送请求
    request.end();
});

http.get = options => {
    // 设置为get请求
    (<RequestParam>options).method = 'get';
    return http(options);
};

http.post = options => {
    // 设置为post请求
    (<RequestParam>options).method = 'post';
    return http(options);
};

export default http;