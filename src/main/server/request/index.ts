import { net } from 'electron';
import { createReadStream, existsSync, statSync } from 'fs';
import type { IncomingHttpHeaders } from 'http';
import type { Page } from '@/types';

/*================== 类型定义 START ==================*/
type ErrorCode = 403 | 404;

type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type RequestOption = {
  /** 访问路径 */
  url: string;
  /** 请求头 */
  headers?: IncomingHttpHeaders;
  /** get请求时的url参数(注意提供了此选项,如果url上存在相同的依然会被拼接到最终请求地址) */
  params?: Record<string, string | number | boolean>;
};

type PostRequestOption = RequestOption & {
  /** 请求体 */
  body?: Record<string, any> | string;
};

type Http = {
  toPayload(req: Request, type: 'text'): Promise<string>;
  toPayload<T>(req: Request, type?: 'json'): Promise<T>;

  get(options: RequestOption, type: 'text'): Promise<string>;
  get<T>(options: RequestOption, type?: 'json'): Promise<T>;

  post(options: PostRequestOption, type: 'text'): Promise<string>;
  post<T>(options: PostRequestOption, type?: 'json'): Promise<T>;
};
/*================== 类型定义   END ==================*/

const Res = Response;

/**
 * 获取请求体(应在具有请求体的POST方式等的请求中调用)
 *
 * @param req 请求对象
 * @param type 指定获取请求体的类型(text:以存文本读取; json:以反序列化为对象读取)
 */
export const toPayload: Http['toPayload'] = <T>(req: Request, type?: 'text' | 'json') => {
  return type === 'text' ? req.text() : (req.json() as Promise<T>);
};

/**
 * 获取一个请求的请求标头
 *
 * @param headers 原始请求标头
 * @param cookie 新的cookie值(若指定则替换原请求中cookie值;否则删除原请求中cookie值)
 */
export const toHeaders = ({ headers }: Request, cookie?: string) => {
  const newHeaders: IncomingHttpHeaders = {};
  const cookieKey = 'cookie';

  cookie ? headers.set(cookieKey, cookie) : headers.delete(cookieKey);
  headers.forEach((v, k) => (newHeaders[k] = v));

  return newHeaders;
};

/**
 * 使用electron net模块发出一个网络请求(默认GET请求)
 */
export const request = net.fetch;

/**
 * 发出一个网络请求
 *
 * @param options 请求配置选项
 * @param type 响应体数据类型(默认以JSON反序列化)
 * @param method 请求方式(默认GET请求)
 */
const fetch = async <T>(options: RequestOption, type?: 'text' | 'json', method?: RequestMethod) => {
  let { url, params, body, headers = {} } = options as RequestOption & { body: PostRequestOption['body'] };

  if (params) {
    const list: string[] = [];

    for (const key in params) {
      const value = params[key];
      (value || value === 0) && list.push(`${key}=${encodeURIComponent(value)}`);
    }

    list.length && (url = `${url}${url.includes('?') ? '&' : '?'}${list.join('&')}`);
  }

  let key = 'content-type';

  if (body) {
    if (typeof body !== 'string') {
      body = JSON.stringify(body);
      headers[key] = 'application/json';
    } else {
      headers[key] = headers[key] || 'application/json';
    }
  } else {
    // 没有请求体移除内容类型表头
    delete headers[key];
  }

  key = 'referer';
  headers[key] = headers[key] || url;

  const isText = type === 'text';

  try {
    const res = await request(url, {
      method: method,
      headers: headers as Record<string, string>,
      body
    });

    return await (isText ? res.text() : res.json());
  } catch (e) {
    return isText ? '' : ({} as T);
  }
};

/**
 * 发出一个网络请求
 *
 * @param options 请求配置选项
 * @param type 响应体数据类型(默认以JSON反序列化)
 */
export const get: Http['get'] = <T>(options: RequestOption, type?: 'text' | 'json') => fetch<T>(options, type);

/**
 * 发出一个网络请求
 *
 * @param options 请求配置选项
 * @param type 响应体数据类型(默认以JSON反序列化)
 */
export const post: Http['post'] = <T>(options: PostRequestOption, type?: 'text' | 'json') =>
  fetch<T>(options, type, 'post');

/**
 * 返回一个成功的响应对象
 *
 * @param data 响应体数据(作为响应内容的一部分)
 * @param message 成功响应的消息
 */
export const toSuccess = <T extends Record<string, any> | any[]>(data?: T, message?: string) => {
  let page: Page;

  // 全局统一计算分页页数：若存在分页对象
  if ((page = (<Record<string, any>>data)?.page)) {
    page.pageCount = Math.ceil((page.total || 1) / page.size || 30);
  }

  // data === null && (data = void 0);
  return Res.json({ data, message, type: 'success' });
};

/**
 * 返回一个标识数据类型是错误的响应对象(状态码依然是默认的200)
 *
 * @param data 响应体数据(作为响应内容的一部分)
 * @param message 错误消息
 */
export const toError = <T extends Record<string, any> | any[]>(data?: T, message?: string) => {
  data === null && (data = void 0);
  return Res.json({ data, message, type: 'error' });
};

/**
 * 通过指定一个响应状态码来返回一个响应对象
 *
 * @param code 错误响应状态码(默认404)
 */
export const error = (code?: ErrorCode) => new Res(null, { status: code || 404 });

/**
 * 请求本地文件资源以stream方式响应
 *
 * @param path 本地文件路径
 * @param range 范围请求标头(例如: 'bytes=0-100' | 'bytes=0-')
 */
export const stream = (path: string, range?: string | null) => {
  const stats = existsSync(path) && statSync(path);

  // 若不存在或不是一个文件, 则返回404状态码信息
  if (!stats || !stats.isFile()) {
    return toError();
  }

  // 分段传输时的数据字节范围请求头信息
  range = range || '';
  // 文件大小(字节)
  const size = stats.size;
  // 文件格式(这里以文件名后缀决定)
  const format = path.slice(path.lastIndexOf('.') + 1);

  const mimes: { [key: string]: string } = {
    aac: 'audio/aac',
    m4a: 'audio/m4a',
    mp3: 'audio/mp3',
    flac: 'audio/flac',
    mp4: 'video/mp4',
    mkv: 'video/mkv',
    js: 'text/javascript',
    html: 'text/html',
    css: 'text/css',
    svg: 'image/svg+xml',
    svgz: 'image/svg+xml',
    json: 'application/json',
    wasm: 'application/wasm',
    '': 'application/octet-stream'
  };

  // Range请求头 => bytes=0-100 | bytes=0-
  const index = range.indexOf('-') || 0;
  const isRage = index > 6;
  // 请求数据(字节)区间的起始位置,从0开始计算
  const start = (isRage && Number(range.slice(6, index))) || 0;
  // 请求数据(字节)区间的结束位置,必须小于等于文件大小 - 1字节
  const end = (isRage && Number(range.slice(index + 1))) || size - 1;

  const headers: HeadersInit = {
    'content-length': String(end - start + 1),
    'content-type': mimes[format] || mimes['']
  };

  if (isRage) {
    headers['accept-ranges'] = 'bytes';
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
  }

  // 若没有分段请求数据(字节)范围信息,则以200状态码返回
  return new Res(createReadStream(path, { start, end }) as any as ReadableStream, {
    status: isRage ? 206 : 200,
    statusText: 'OK',
    headers
  });
};
