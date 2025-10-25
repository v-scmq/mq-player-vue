import { createReadStream, existsSync, statSync } from 'fs';
import { Readable } from 'stream';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';

import type { IncomingHttpHeaders, ClientRequest as NodeClientRequest } from 'http';
import type { ReadableStream as NodeWebReadableStream } from 'stream/web';
import type { Page } from '@/types';

/*================== 类型定义 START ==================*/
type ErrorCode = 403 | 404;

type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type RequestOptions = {
  /** 请求目标站点地址 */
  url: string;

  /** get请求时的url参数(注意提供了此选项,如果url上存在相同的依然会被拼接到最终请求地址) */
  params?: Record<string, string | number | boolean>;

  /** 请求方法 */
  method?: RequestMethod;

  /** 请求体 */
  body?: string | Record<string, any> | any[];

  /** 请求头 */
  headers?: Record<string, string> | IncomingHttpHeaders;

  /** 代理请求,原始请求的header将覆盖指定的header */
  proxy?: boolean;
  /** 原始请求 */
  origin?: Request;
  /** 指定获取响应后以何种类型兑现promise, 'json':进行反序列化 | 'text':字符串形式 | 'raw':Response对象 */
  response?: 'json' | 'text' | 'raw';
};

type ResType = Record<string, any> | any[] | string | Response;

type Http = {
  toPayload(req: Request, type: 'text'): Promise<string>;
  toPayload<T>(req: Request, type?: 'json'): Promise<T>;
};
/*================== 类型定义   END ==================*/

const Res = Response;

/**
 * 从一个字符串中读取cookie信息,然后以键值对形式对象返回
 *
 * @param cookies cookie信息字符串
 */
const toCookieMap = (cookies?: string) => {
  const map: { [key: string]: string } = {};

  if (cookies) {
    // `xx = 11 ; yy = 22` => {'xx': 11, 'yy': 22}
    for (const item of cookies.split(';')) {
      const values = item.split('=');
      const k = values[0].trim();
      const v = values[1]?.trim();
      k && v && (map[k] = v);
    }
  }

  return map;
};

/**
 * 获取一个请求的请求标头
 *
 * @param headers 原始请求标头
 * @param cookie 新的cookie值(若指定则替换原请求中cookie值;否则删除原请求中cookie值)
 */
export const toHeaders = ({ headers }: Request, cookie?: string) => {
  const newHeaders: Record<string, string> = {};
  const cookieKey = 'cookie';

  cookie ? headers.set(cookieKey, cookie) : headers.delete(cookieKey);
  headers.forEach((v, k) => (newHeaders[k] = v));

  return newHeaders;
};

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
 * 发出一个网络请求
 *
 * @param options 请求配置选项
 */
export const fetch = async <T extends ResType>(options: RequestOptions) => {
  let { url, params, method, body, proxy, origin } = options;

  // 若提供了URL参数对象, 则为其附加到URL字符串上
  if (params) {
    const list: string[] = [];

    for (const key in params) {
      const value = params[key];
      (value || value === 0) && list.push(`${key}=${encodeURIComponent(value)}`);
    }

    list.length && (url = `${url}${url.includes('?') ? '&' : '?'}${list.join('&')}`);
  }

  let key = 'content-type';
  const h1 = options.headers || {};
  const h2 = origin ? toHeaders(origin) : {};

  let sendBody: (newRequest: NodeClientRequest) => void;

  if (proxy) {
    method = origin?.method as RequestOptions['method'];
    sendBody = newRequest =>
      origin && origin.body
        ? Readable.fromWeb(origin.body as NodeWebReadableStream).pipe(newRequest)
        : newRequest.end();
  } else {
    if (body) {
      if (typeof body !== 'string') {
        body = JSON.stringify(body);
        h1[key] = 'application/json;charset=UTF-8';
      }

      sendBody = newRequest => newRequest.end(body);
    } else {
      // 没有请求体移除内容类型表头
      delete h1[key];

      sendBody = newRequest => newRequest.end();
    }
  }

  // 如果是代理, 那么原始请求的请求头优先级高于指定请求头
  const headers: Record<string, string> | IncomingHttpHeaders = {
    ...(proxy ? h1 : h2),
    ...(proxy ? h2 : h1)
  };

  key = 'referer';
  headers[key] = headers[key] || url;

  const res = await new Promise<Response>(resolve => {
    const send = url.startsWith('https') ? httpsRequest : httpRequest;

    let redirectCount = 0;

    const doSend = () => {
      const newRequest = send(url, { method, headers }, readable => {
        // 如果服务器响应头包含了重定向URL, 那么需要重新发起请求去访问新的资源(如果有可能需要携带cookie)
        if ((url = readable.headers.location as string)) {
          // 服务器响应头中的cookie
          const c1 = readable.headers.cookie || '';
          // 服务器响应头中的set-cookie
          const c2 = (readable.headers['set-cookie'] || []).join(';');
          // 从已有的cookie和服务器响应的cookie上构建cookie字符串, 从而构建cookie的key=>value对象
          const cookies = toCookieMap(`${headers.cookie || ''};${c1};${c2}`);
          delete cookies.Path;
          delete cookies.Domain;
          // 更新cookie
          headers.cookie = Object.keys(cookies)
            .map(key => `${key}=${cookies[key]}`)
            .join(';');

          // 需要重定向时, 按照现在的浏览器只可能是以get请求发送请求(这里通过递归调用完成发送, 最多允许重定向5次)
          method = 'get';
          ++redirectCount <= 5 ? doSend() : resolve(error());
        } else {
          resolve(
            new Res(readable as any as ReadableStream, {
              status: readable.statusCode,
              statusText: readable.statusMessage,
              headers: readable.headers as Record<string, string>
            })
          );
        }
      });

      newRequest.once('error', () => resolve(error()));

      sendBody(newRequest);
    };

    doSend();
  });

  const type = options.response;

  if (type === 'raw') {
    return res as T;
  }

  try {
    return (type === 'text' ? await res.text() : await res.json()) as T;
  } catch (error) {
    return (type === 'text' ? '' : {}) as T;
  }
};

/**
 * 发出一个网络请求
 *
 * @param options 请求配置选项
 */
export const get = <T extends ResType>(options: Omit<RequestOptions, 'body'>) => fetch<T>(options);

/**
 * 发出一个网络请求
 *
 * @param options 请求配置选项
 */
export const post = <T extends ResType>(options: RequestOptions) => {
  options.method = 'post';
  return fetch<T>(options);
};

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
    return error();
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
