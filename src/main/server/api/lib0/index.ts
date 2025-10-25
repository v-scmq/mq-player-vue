import { toPayload, toSuccess, toError, get, post, error, fetch } from '../../request';
import { formatTime, readLyric } from '../../../util';

import type { ApiHandlers } from '../../types';

import type {
  AlbumSearchRes,
  AlbumSongListPayload,
  AlbumSongListRes,
  LoginOptionRes,
  LoginPayload,
  LoginRes,
  LogoutRes,
  LyricPayload,
  LyricRes,
  MvListPayload,
  MvListRes,
  MvSearchRes,
  RankListRes,
  RankSongListPayload,
  RankSongListRes,
  SearchPayload,
  SingerAlbumListPayload,
  SingerAlbumListRes,
  SingerListPayload,
  SingerListRes,
  SingerMvListPayload,
  SingerMvListRes,
  SingerSearchRes,
  SingerSongListPayload,
  SingerSongListRes,
  SongSearchRes,
  SpecialListPayload,
  SpecialListRes,
  SpecialSearchRes,
  SpecialSongListPayload,
  SpecialSongListRes
} from '@/types/api';

import { Mv, Singer, Song } from '@/types';

/**
 * 创建API处理器
 */
export const createApis = () => {
  const cache: { [key: string]: any } = {};
  const baseApiURL = 'https://scmq-dev-ed.my.site.com/services/apexrest';

  /**
   * 获取歌曲在本地服务器上的URI地址
   *
   * @param id 歌曲id
   * @param mid 歌曲mid
   * @param format 歌曲文件格式
   */
  const getSongURI = (id?: string | number, mid?: string | number, format?: string /*, quality: number*/) => {
    id = id || '';
    format = format || 'mp3';

    return mid /*&& quality > 0*/
      ? import.meta.env.DEV
        ? `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_SERVER_API}/song/stream?id=${id}&mid=${mid}&format=${format}`
        : `/${import.meta.env.VITE_SERVER_API}/song/stream?id=${id}&mid=${mid}&format=${format}`
      : '';
  };

  /**
   * 获取MV在本地服务器上的URI地址
   *
   * @param id mv id
   * @param vid mv vid
   * @param format 视频格式
   */
  const getMvURI = (id?: string | number, vid?: string | number, format?: string /*,  quality: number*/) => {
    id = id || '';
    format = format || 'mp4';

    return vid
      ? import.meta.env.DEV
        ? `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_SERVER_API}/mv/stream?id=${id}&vid=${vid}&format=${format}`
        : `/${import.meta.env.VITE_SERVER_API}/mv/stream?id=${id}&vid=${vid}&format=${format}`
      : '';
  };

  const getProxyURI = (url?: string) => {
    if (!url) {
      return url;
    }

    return import.meta.env.DEV
      ? `${import.meta.env.VITE_SERVER_PROTOCOL}://${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_SERVER_PROXY}/${url}`
      : `/${import.meta.env.VITE_SERVER_PROXY}/${url}`;
  };

  /**
   * API处理器映射对象
   */
  const handlers: ApiHandlers = {
    /**
     * 获取登录配置选项(用于弹出登录页面的配置选项)
     */
    'user/login/option'() {
      return toSuccess<LoginOptionRes>({
        url: '', // schema://domain/path
        indexURL: '', // schema://domain/path
        width: 400,
        height: 400
        // preload: ''
      });
    },

    /**
     * 用户登录
     */
    async 'user/login'(req) {
      const cookies = await toPayload<LoginPayload>(req);

      return cookies && cookies.length > 0
        ? toSuccess<LoginRes>({
          id: '1234567890',
          nickName: '测试昵称',
          avatar: '',
          vip: false,
          level: 0,
          levelIcon: '',
          startTime: '',
          endTime: '',
          autoPay: false
        })
        : toError(void 0, '登录失败');
    },

    /**
     * 用户退出登录
     */
    'user/logout'(/*req, url*/) {
      return toSuccess<LogoutRes>({ indexURL: '' }, '已成功退出登录');
    },

    /**
     * 获取歌手列表
     */
    async 'singer/list'(req) {
      const { tags, page } = await toPayload<SingerListPayload>(req);
      console.log(tags, page);

      // 因为这里调用的接口, 仅仅是测试数据, 所以直接缓存所有结果
      const key = 'media/singers';
      let cached = cache[key] as SingerListRes | undefined;

      if (cached) {
        return toSuccess(cached);
      }

      const singers = await get<Singer[]>({
        url: `${baseApiURL}/media/singers`,
        origin: req
      });

      const length = singers.length;
      const list = singers.map(item => ({
        ...item,
        cover: getProxyURI(item.cover)
      }));

      cached = cache[key] = {
        page: { current: 1, pageCount: 1, size: Math.min(30, length), total: length },
        tags: [[{ id: '0', name: '全部' }]],
        list: list
      };

      return toSuccess(cached);
    },

    /**
     * 获取歌手歌曲列表
     */
    async 'singer/songs'(req) {
      const { id, mid /*, page*/ } = await toPayload<SingerSongListPayload>(req);

      const key = `media/singer/songs/${id}/${mid}`;

      let cached = cache[key] as SingerSongListRes | undefined;

      if (cached) {
        return toSuccess(cached);
      }

      const songs = await post<Song[]>({
        url: `${baseApiURL}/media/singer/songs`,
        body: { id, mid },
        origin: req
      });

      const length = songs.length;

      songs.forEach(item => {
        item.singer?.forEach(singer => {
          singer.cover = getProxyURI(singer.cover);
        });

        item.album && (item.album.cover = getProxyURI(item.album.cover));
        item.duration = formatTime(item.duration as any as number);
        item.path = getSongURI(item.id, item.mid);
      });

      cached = cache[key] = {
        page: { current: 1, pageCount: 1, size: Math.min(30, length), total: length },
        singer: { id, mid },
        list: songs
      };

      return toSuccess<SingerSongListRes>(cached);
    },

    /**
     * 获取歌手专辑列表
     */
    async 'singer/albums'(req) {
      const { mid, page } = await toPayload<SingerAlbumListPayload>(req);

      console.log(mid, page);

      return toSuccess<SingerAlbumListRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取歌手MV列表
     */
    async 'singer/mvs'(req) {
      const { mid, page } = await toPayload<SingerMvListPayload>(req);

      console.log(mid, page);

      return toSuccess<SingerMvListRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取专辑歌曲列表
     */
    async 'album/songs'(req) {
      const { mid, page } = await toPayload<AlbumSongListPayload>(req);

      console.log(mid, page);

      return toSuccess<AlbumSongListRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取歌单列表
     */
    async 'special/list'(req) {
      const { tag, page } = await toPayload<SpecialListPayload>(req);
      console.log(tag, page);

      return toSuccess<SpecialListRes>({
        tags: [],
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取歌单歌曲列表
     */
    async 'special/songs'(req) {
      const { mid, page } = await toPayload<SpecialSongListPayload>(req);

      return toSuccess<SpecialSongListRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        special: { mid, introduce: '歌单描述' },
        list: []
      });
    },

    /**
     * 获取榜单列表
     */
    async 'rank/list'(req) {
      const key = `media/ranks`;
      let cached = cache[key] as RankListRes | undefined;

      if (cached) {
        return toSuccess(cached);
      }

      const ranks = await get<RankListRes>({
        url: `${baseApiURL}/media/ranks`,
        origin: req
      });

      return toSuccess(cached = cache[key] = ranks);
    },

    /**
     * 获取榜单歌曲列表
     */
    async 'rank/songs'(req) {
      const { id/*, page*/ } = await toPayload<RankSongListPayload>(req);

      const key = `media/rank/songs/${id}`;
      let cached = cache[key] as RankSongListRes | undefined;

      if (cached) {
        return toSuccess(cached);
      }

      const songs = await post<Song[]>({
        url: `${baseApiURL}/media/rank/songs`,
        body: { id/*, page*/ },
        origin: req
      });

      songs.forEach(song => {
        song.singer?.forEach(singer => {
          singer.cover = getProxyURI(singer.cover);
        });

        song.album && (song.album.cover = getProxyURI(song.album.cover));
        song.duration = formatTime(song.duration as any as number);
        song.path = getSongURI(song.id, song.mid);
      });

      return toSuccess<RankSongListRes>(cached = cache[key] = {
        list: songs,
        page: { current: 1, pageCount: 1, size: songs.length, total: songs.length }
      });
    },

    /**
     * 获取歌手搜索列表
     */
    async 'search/singers'(req) {
      const { keyword } = await toPayload<SearchPayload>(req);
      console.log(keyword);
      return toSuccess<SingerSearchRes>([]);
    },

    /**
     * 获取歌曲搜索列表
     */
    async 'search/songs'(req) {
      const { keyword, page } = await toPayload<SearchPayload>(req);
      console.log(keyword);

      return toSuccess<SongSearchRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取专辑搜索列表
     */
    async 'search/albums'(req) {
      const { keyword, page } = await toPayload<SearchPayload>(req);
      console.log(keyword);
      return toSuccess<AlbumSearchRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取歌单搜索列表
     */
    async 'search/specials'(req) {
      const { keyword, page } = await toPayload<SearchPayload>(req);
      console.log(keyword);
      return toSuccess<SpecialSearchRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取MV搜索列表
     */
    async '/search/mvs'(req) {
      const { keyword, page } = await toPayload<SearchPayload>(req);
      console.log(keyword);
      return toSuccess<MvSearchRes>({
        page: { current: 1, pageCount: 0, size: page.size, total: 0 },
        list: []
      });
    },

    /**
     * 获取MV列表
     */
    async 'mv/list'(req) {
      const { tags, page } = await toPayload<MvListPayload>(req);
      console.log(tags, page);

      // 因为这里调用的接口, 仅仅是测试数据, 所以直接缓存所有结果
      const key = `media/mvs`;

      let cached = cache[key] as MvListRes;

      if (cached) {
        return toSuccess(cached);
      }

      const mvs = await get<Mv[]>({
        url: `${baseApiURL}/media/mvs`,
        origin: req
      });

      const length = mvs.length;
      const list = mvs.map(item => ({
        ...item,
        duration: formatTime(item.duration as any as number),
        path: getMvURI(item.id, item.vid),
        cover: getProxyURI(item.cover)
      }));

      cached = cache[key] = {
        tags: [[{ id: '1', name: '全部' }]],
        page: { current: 1, pageCount: 0, size: Math.min(30, length), total: length },
        list: list
      };

      return toSuccess<MvListRes>(cached);
    },

    /**
     * 创建歌单(必须登录)
     */
    'my/special/add'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 更新歌单信息(必须登录)
     */
    'my/special/update'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 移除自建歌单(必须登录)
     */
    'my/special/delete'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 添加歌曲到歌单(必须登录)
     */
    'my/special/add-songs'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 从自建歌单中移除歌曲(必须登录)
     */
    'my/special/delete-songs'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 获取自建歌单,包含收藏(必须登录)
     */
    'my/specials'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 获取收藏歌曲列表(必须登录)
     */
    'like/songs'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 获取收藏专辑列表(必须登录)
     */
    'like/albums'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 获取收藏歌单列表(必须登录)
     */
    'like/playlists'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 获取收藏的mv列表(必须登录)
     */
    'like/mvs'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 获取歌手写真
     */
    'singer/photos'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 获取热搜词列表
     */
    'hot/keys'(/*req*/) {
      return toSuccess({});
    },

    /**
     * 以stream方式载入歌曲
     *
     * sample: /song/stream?mid=abc&id=def&quality=1
     */
    async 'song/stream'(req, url) {
      const id = url.searchParams.get('id') || '';
      const mid = url.searchParams.get('mid') || '';
      const format = url.searchParams.get('format') || 'mp3';
      const fileName = url.searchParams.get('file');

      const key = `media/url/${id}/${mid}`;
      let data = cache[key] as { url: string };

      if (!data) {
        data = await post<{ url: string }>({
          url: `${baseApiURL}/media/url`,
          body: { id, mid },
          origin: req
        });

        cache[key] = data;
      }

      if (!data.url) {
        return error();
      }

      const res = await fetch<Response>({
        url: data.url,
        origin: req,
        proxy: true,
        response: 'raw'
      });

      // 若提供了文件名,则重写附件响应标头
      if (fileName) {
        res.headers.set('content-disposition', `attachment; filename="${encodeURIComponent(fileName)}.${format}"`);
      }

      return res;
    },

    /**
     * 以stream方式载入MV
     *
     * sample: /mv/stream?mid=abc&id=def&quality=1
     */
    async 'mv/stream'(req, url) {
      const id = url.searchParams.get('id') || '';
      const vid = url.searchParams.get('vid') || '';
      const file = url.searchParams.get('file');
      const format = url.searchParams.get('format') || 'mp4';

      const key = `media/url/${id}/${vid}`;
      let data = cache[key] as { url: string };

      if (!data) {
        data = await post<{ url: string }>({
          url: `${baseApiURL}/media/url`,
          body: { id, vid },
          origin: req
        });

        cache[key] = data;
      }

      if (!data.url) {
        return error();
      }

      const res = await fetch<Response>({
        url: data.url,
        origin: req,
        proxy: true,
        response: 'raw'
      });

      // 若提供了文件名,则重写附件响应标头
      if (file) {
        res.headers.set('content-disposition', `attachment; filename="${encodeURIComponent(file)}.${format}"`);
      }

      return res;
    },

    /**
     * 获取歌曲歌词
     */
    async 'song/lyric'(req) {
      const { id, mid } = await toPayload<LyricPayload>(req);

      if (!id || !mid) {
        return toSuccess<LyricRes>([]);
      }

      const data = await post<{ lyric: string; trans?: string }>({
        url: `${baseApiURL}/media/lyric`,
        body: { id, mid },
        origin: req
      });

      return toSuccess<LyricRes>(readLyric(data?.lyric, data?.trans));
    }
  };

  return handlers;
};
