import { createReadStream, existsSync, statSync } from 'fs';
import type { IncomingHttpHeaders } from 'http';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';

const MIME_TYPES: { [key: string]: string } = {
  '.aac': 'audio/aac',
  '.m4a': 'audio/m4a',
  '.mp3': 'audio/mp3',
  '.flac': 'audio/flac',
  '.mp4': 'video/mp4',
  '.mkv': 'video/mkv',
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.svgz': 'image/svg+xml',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '': 'application/octet-stream'
};

const requestMappingHandler = {
  // 静态资源访问接口
  [import.meta.env.VITE_SERVER_STATIC](path: string) {
    path = `${__dirname}/../${import.meta.env.VITE_SERVER_STATIC}/${path.replace(/\.\./g, '').replace(/\/\//g, '')}`;

    const stats = existsSync(path) && statSync(path);

    // 若不存在或不是一个文件, 则返回404状态码信息
    if (!stats || !stats.isFile()) {
      return new Response(null, { status: 404 });
    }

    return new Response(createReadStream(path) as unknown as ReadableStream, {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-length': String(stats.size),
        'content-type': MIME_TYPES[path.slice(path.lastIndexOf('.'))] || MIME_TYPES[''],
        'access-control-allow-origin': '*'
      }
    });
  },

  // 本地文件访问接口
  [import.meta.env.VITE_SERVER_FILE](path: string, req: Request) {
    path = decodeURIComponent(path);
    const stats = existsSync(path) && statSync(path);

    // 若不存在或不是一个文件, 则返回404状态码信息
    if (!stats || !stats.isFile()) {
      return new Response(null, { status: 404 });
    }

    // 文件大小(字节)
    const size = stats.size;
    // 分段传输时的数据字节范围请求头信息
    const range = req.headers.get('range');
    const format = path.slice(path.lastIndexOf('.'));

    // 若没有分段请求数据(字节)范围信息,则以200状态码返回
    if (!range || range.indexOf('bytes=') < 0) {
      return new Response(createReadStream(path) as unknown as ReadableStream, {
        status: 200,
        statusText: 'OK',
        headers: {
          'access-control-allow-origin': '*',
          'content-length': String(size),
          'content-type': MIME_TYPES[format] || MIME_TYPES['']
        }
      });
    }

    // Range请求头 => bytes=0-100 | bytes=0-
    const index = range.indexOf('-');
    // 请求数据(字节)区间的起始位置,从0开始计算
    const start = (index > 0 && Number(range.slice(6, index))) || 0;
    // 请求数据(字节)区间的结束位置,必须小于等于文件大小 - 1字节
    const end = (index > 0 && Number(range.slice(index + 1))) || size - 1;

    return new Response(createReadStream(path, { start, end }) as unknown as ReadableStream, {
      status: 206,
      statusText: 'OK',
      headers: {
        'access-control-allow-origin': '*',
        'accept-ranges': 'bytes',
        'content-length': String(end - start + 1),
        'content-range': `bytes ${start}-${end}/${size}`,
        'content-type': MIME_TYPES[format] || MIME_TYPES['']
      }
    });
  },

  // 第三方代理访问接口
  [import.meta.env.VITE_SERVER_PROXY](path: string, req: Request) {
    const href = decodeURIComponent(path);
    const url = new URL(href);

    // 发送到目标服务器的请求头
    const headers: IncomingHttpHeaders = {};

    // 获取浏览器发出的请求头
    req.headers.forEach((value, key) => {
      if (!key.startsWith('x-forwarded')) {
        headers[key] = value;
      }
    });

    headers.host = url.host;
    headers.referer = href;

    // 请求配置选项
    const options = { headers, method: req.method || 'get' };

    return new Promise<Response>(resolve => {
      const request = url.protocol === 'https' ? httpsRequest : httpRequest;
      const newReq = request(href, options, res => {
        resolve(
          new Response(res as unknown as ReadableStream, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers as unknown as { [key: string]: string }
          })
        );
      });

      newReq.once('error', () => resolve(new Response(null, { status: 500 })));
      newReq.end();
    });
  }
};

export const handler = (req: Request): Response | Promise<Response> => {
  const url = new URL(req.url);
  const path = url.pathname;
  const index = path.indexOf('/', 1);
  const key = path.slice(1, index) as keyof typeof requestMappingHandler;
  const handler = requestMappingHandler[key];

  return handler ? handler(path.slice(index + 1), req) : new Response(null, { status: 404 });
};
