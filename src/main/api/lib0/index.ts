import type { IncomingMessage } from 'http';

type ApiHandles = {
  [key: string]: (req: Request, _url?: URL) => Response | Promise<Response>
}

/**
 * 创建API处理器
 */
export const createApis = () => {
  // 响应对象(Electron自定义协议响应对象与浏览器端相同)
  const Res = Response;

  /**
   * 获取请求体
   *
   * @param req 请求对象
   * @param type 请求体数据类型
   */
  const toPayload = <T>(req: Request | IncomingMessage, type?: 'text' | 'json') => {
    if ((req.method || 'GET') === 'GET') {
      return Promise.resolve({} as T);
    }

    // others => POST | PUT | DELETE | PATCH
    if (req instanceof Request) {
      return (type === 'text' ? req.text() : req.json()) as Promise<T>;
    }

    return new Promise<T>((resolve) => {
      const buffers: Buffer[] = [];

      req.on('data', chunk => buffers.push(chunk));

      req.once('end', () => {
        const payload = buffers.toString();
        type === 'text' ? resolve(payload as T) : resolve(JSON.parse(payload) as T);
      });
    });

  };

  /**
   * (响应体写入器)用于向响应管道中写入响应数据体
   */
  const writer = {
    success(data: null | Record<string, any> | any[], message?: string) {
      data == null && (data = null);
      return new Res(JSON.stringify({ data, message, type: 'success' }));
    },

    error(data: null | Record<string, any> | any[], message?: string) {
      data == null && (data = null);
      return new Res(JSON.stringify({ data, message, type: 'error' }));
    },

    pipe(response: IncomingMessage) {
      return new Res(response as unknown as ReadableStream, {
        status: response.statusCode,
        statusText: response.statusMessage,
        headers: response.headers as unknown as { [key: string]: string }
      });
    }
  };

  /**
   * API处理器映射对象
   */
  const handlers: ApiHandles = {

    /**
     * 用户登录
     */
    async '/user/login'(_req, _url) {
      const { cookies } = await toPayload<{ cookies: string[] }>(_req);
      console.info(cookies);
      return writer.success({});
    },

    /**
     * 用户退出登录
     */
    '/user/logout'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌手列表
     */
    '/singer/list'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌手歌曲列表
     */
    '/singer/songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌手专辑列表
     */
    '/singer/albums'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌手MV列表
     */
    '/singer/mvs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取专辑歌曲列表
     */
    '/album/songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌单列表
     */
    '/playlists'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌单歌曲列表
     */
    '/playlist/songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取榜单列表
     */
    '/rank/list'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取榜单歌曲列表
     */
    '/rank/songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌手搜索列表
     */
    '/search/singers'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌曲搜索列表
     */
    '/search/songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取专辑搜索列表
     */
    '/search/albums'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌单搜索列表
     */
    '/search/playlists'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取MV搜索列表
     */
    '/search/mvs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取MV列表
     */
    '/mv/list'(_req, _url) {
      return writer.success({});
    },

    /**
     * 创建歌单(必须登录)
     */
    '/my/playlist/add'(_req, _url) {
      return writer.success({});
    },

    /**
     * 更新歌单信息(必须登录)
     */
    '/my/playlist/update'(_req, _url) {
      return writer.success({});
    },

    /**
     * 移除自建歌单(必须登录)
     */
    '/my/playlist/delete'(_req, _url) {
      return writer.success({});
    },

    /**
     * 添加歌曲到歌单(必须登录)
     */
    '/my/playlist/add-songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 从自建歌单中移除歌曲(必须登录)
     */
    '/my/playlist/delete-songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取自建歌单,包含收藏(必须登录)
     */
    '/my/playlists'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取收藏歌曲列表(必须登录)
     */
    '/like/songs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取收藏专辑列表(必须登录)
     */
    '/like/albums'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取收藏歌单列表(必须登录)
     */
    '/like/playlists'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取收藏的mv列表(必须登录)
     */
    '/like/mvs'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌曲歌词
     */
    '/song/lyric'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取歌手写真
     */
    '/singer/photo'(_req, _url) {
      return writer.success({});
    },

    /**
     * 获取热搜词列表
     */
    '/hot/keys'(_req, _url) {
      return writer.success({});
    },

    /**
     * 以stream方式载入歌曲
     *
     * sample: /song/stream?mid=abc&id=def&quality=1
     */
    '/song/stream'(_req, _url) {
      return writer.pipe(null as any);
    },

    /**
     * 以stream方式载入MV
     *
     * sample: /mv/stream?mid=abc&id=def&quality=1
     */
    '/mv/stream'(_req, _url) {
      return writer.pipe(null as any);
    }
  };

  console.info(handlers);
  return handlers;
};