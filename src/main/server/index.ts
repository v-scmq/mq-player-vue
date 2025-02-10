import { protocol } from 'electron';
import { stream, error, fetch } from './request';

import type { RequestRootHandler, ApiHandlers } from './types';

export const createServer = () => {
  let apis: ApiHandlers | undefined;

  const handlers: RequestRootHandler = {
    // 静态资源访问接口
    [import.meta.env.VITE_SERVER_STATIC](path, req) {
      path = `${import.meta.dirname}/../${import.meta.env.VITE_SERVER_STATIC}/${path.replace(/\.\./g, '').replace(/\/\//g, '')}`;
      return stream(path, req.headers.get('range'));
    },

    // 本地文件访问接口
    [import.meta.env.VITE_SERVER_FILE](path, req) {
      return (path = decodeURIComponent(path)).includes('..') ? error() : stream(path, req.headers.get('range'));
    },

    // 第三方代理访问接口
    [import.meta.env.VITE_SERVER_PROXY](path, req, u) {
      let url: URL;

      try {
        url = new URL((path = `${path}${u.search || ''}`));
      } catch (e) {
        return error();
      }

      // 不允许代理访问自身
      return url.protocol.includes(import.meta.env.VITE_SERVER_PROTOCOL)
        ? error(403)
        : fetch({
          url: path,
          origin: req,
          proxy: true,
          response: 'raw'
        });
    },

    // 音乐数据统一前置接口
    async [import.meta.env.VITE_SERVER_API](path, req, url) {
      if (import.meta.env.VITE_MUSIC_API === '1') {
        const { createApis } = await import('./api/lib1');
        apis = createApis();

        // 替换原成员方法,然后调用方法处理结果
        return (handlers[import.meta.env.VITE_SERVER_API] = (path, req, url) => {
          const handle = (<ApiHandlers>apis)[path];
          return handle ? handle(req, url) : error();
        })(path, req, url);
      }

      // 默认的数据接口实现
      else {
        const { createApis: _ } = await import('./api/lib0');
        apis = _();

        // 替换原成员方法,然后调用方法处理结果
        return (handlers[import.meta.env.VITE_SERVER_API] = (path, req, url) => {
          const handle = (<ApiHandlers>apis)[path];
          return handle ? handle(req, url) : error();
        })(path, req, url);
      }
    }
  };

  protocol.handle(import.meta.env.VITE_SERVER_PROTOCOL, req => {
    // 1.静态资源接口 => app://domain/static/index.html       (***不允许出现相对路径)
    // 2.本地文件接口 => app://domain/file/disk://path        (***需要考虑安全性)
    // 3.网络代理接口 => app://domain/proxy/http(s)://domain/ (***需要验证是否被代理了自身,否则可能导致循环调用问题)
    // 4.音乐数据接口 => app://domain/api/path2/pat3……        (***路径精确匹配模式)

    // req.url => 'app://domain/path1/path2……'
    const url = new URL(req.url);
    // pathname => '/path1/path2……'
    const path = url.pathname;
    // 必须从路径的第3个位置开始, 因为按照上述4个顶层接口规定那样,路径第一个/后面至少有一个字符
    const index = path.indexOf('/', 2);
    // 获取顶层接口处理器
    const handler = handlers[path.slice(1, index) as keyof RequestRootHandler];

    return handler ? handler(path.slice(index + 1), req, url) : error();
  });
};
