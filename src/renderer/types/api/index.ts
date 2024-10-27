import {
  Album,
  LyricLine,
  Mv,
  MvTags,
  Page,
  Rank,
  Singer,
  SingerTags,
  Song,
  Special,
  SpecialTags,
  User
} from '@/types';

/** 获取登录配置选项API响应体 */
export type LoginOptionRes = {
  /** 用于登录的URL */
  url: string;
  /** 登录成功时的首页URL */
  indexURL: string;
  /** 弹出登录页面时窗口宽度 */
  width: number;
  /** 弹出登录页面时窗口高度 */
  height: number;
  /** 弹出登录页面所需要的预加载脚本 */
  preload?: string;
};

/** 用户登录API请求体 */
export type LoginPayload = Electron.Cookie[];

/** 用户登录API响应体 */
export type LoginRes = User;

/** 用户退出登录API响应体 */
export type LogoutRes = {
  /** 登录成功后的首页URL, 清除此站点的cookie */
  indexURL: string;
};

/** 歌手列表API请求体 */
export type SingerListPayload = {
  /** 歌手分类标签id列表(对应不同分组标签下的id,即有多少个分组,就只能有多少个id) */
  tags?: string[];
  page: Page;
};

/** 歌手列表API响应体 */
export type SingerListRes = {
  page: Page;
  /** 歌手分类标签 */
  tags?: SingerTags;
  list: Singer[];
};

/** 歌手歌曲列表API请求体 */
export type SingerSongListPayload = {
  /** 歌手id */
  id?: string | number;
  /** 歌手mid */
  mid: string | number;

  page: Page;
};

/** 歌手歌曲列表API响应体 */
export type SingerSongListRes = {
  page: Page;
  singer: Singer;
  list: Song[];
};

/** 歌手专辑列表API请求体 */
export type SingerAlbumListPayload = {
  /** 歌手id */
  id?: string | number;
  /** 歌手mid */
  mid: string | number;

  page: Page;
};

/** 歌手专辑列表API响应体 */
export type SingerAlbumListRes = {
  page: Page;
  list: Album[];
};

/** 歌手MV列表API请求体 */
export type SingerMvListPayload = {
  /** 歌手id */
  id?: string | number;
  /** 歌手mid */
  mid: string | number;

  page: Page;
};

/** 歌手专辑列表API响应体 */
export type SingerMvListRes = {
  page: Page;
  list: Mv[];
};

/** 专辑歌曲列表API请求体 */
export type AlbumSongListPayload = {
  /** 专辑id */
  id?: string | number;
  /** 专辑mid */
  mid: string | number;

  page: Page;
};

/** 专辑歌曲列表API响应体 */
export type AlbumSongListRes = {
  page: Page;
  list: Song[];
};

/** 歌单列表API请求体 */
export type SpecialListPayload = {
  /** 歌单分类标签id */
  tag?: string;
  page: Page;
};

/** 歌单列表API响应体 */
export type SpecialListRes = {
  /** 歌单分类标签id */
  tags?: SpecialTags;
  list: Special[];
  page: Page;
};

/** 歌单歌曲列表API请求体 */
export type SpecialSongListPayload = {
  /** 歌单id */
  id?: string | number;
  /** 歌单mid */
  mid: string | number;

  page: Page;
};

/** 歌单歌曲列表API响应体 */
export type SpecialSongListRes = {
  page: Page;
  special?: Special;
  list: Song[];
};

/** 榜单列表API响应体 */
export type RankListRes = Rank[];

/** 榜单歌曲列表API请求体 */
export type RankSongListPayload = {
  /** 榜单项id */
  id: string;
  page: Page;
};

/** 榜单歌曲列表API响应体 */
export type RankSongListRes = {
  page: Page;
  list: Song[];
};

/** 所有搜索类API请求体 */
export type SearchPayload = {
  keyword: string;
  page: Page;
};

/** 歌手搜索API响应体 */
export type SingerSearchRes = Singer[];

/** 歌曲搜索API响应体 */
export type SongSearchRes = {
  page: Page;
  list: Song[];
};

/** 专辑搜索API响应体 */
export type AlbumSearchRes = {
  page: Page;
  list: Album[];
};

/** 歌单搜索API响应体 */
export type SpecialSearchRes = {
  page: Page;
  list: Special[];
};

/** MV搜索API响应体 */
export type MvSearchRes = {
  page: Page;
  list: Mv[];
};

/** MV列表API请求体 */
export type MvListPayload = {
  /** MV分类标签id列表(对应不同分组标签下的id,即有多少个分组,就只能有多少个id) */
  tags?: string[];
  page: Page;
};

/** MV列表API响应体 */
export type MvListRes = {
  page: Page;
  tags?: MvTags;
  list: Mv[];
};

/** 歌曲歌词API请求体 */
export type LyricPayload = {
  /** 歌曲id(某些具体API实现可能是必须提供的) */
  id?: string | number;
  /** 歌曲mid */
  mid: string | number;
};

/** 歌曲歌词API响应体 */
export type LyricRes = LyricLine[];
