import { post } from './request';

import {
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

/** 获取登录配置选项 */
export const getLoginOption = () => post<LoginOptionRes>('user/login/option');

/** 用户登录(现在该接口需要提供cookie作为请求体发送到服务器) */
export const login = (data: LoginPayload) => post<LoginRes>('user/login', data);

/** 退出登录 */
export const logout = () => post<LogoutRes>('user/logout');

/** 获取歌手列表 */
export const getSingers = (data: SingerListPayload) => post<SingerListRes>('singer/list', data);

/** 获取歌手歌曲列表 */
export const getSingerSongs = (data: SingerSongListPayload) => post<SingerSongListRes>('singer/songs', data);

/** 获取歌手专辑列表 */
export const getSingerAlbums = (data: SingerAlbumListPayload) => post<SingerAlbumListRes>('singer/albums', data);

/** 获取歌手MV列表 */
export const getSingerMvs = (data: SingerMvListPayload) => post<SingerMvListRes>('singer/mvs', data);

/** 获取专辑歌曲列表 */
export const getAlbumSongs = (data: AlbumSongListPayload) => post<AlbumSongListRes>('album/songs', data);

/** 获取歌单列表 */
export const getSpecials = (data: SpecialListPayload) => post<SpecialListRes>('special/list', data);

/** 获取歌单歌曲列表 */
export const getSpecialSongs = (data: SpecialSongListPayload) => post<SpecialSongListRes>('special/songs', data);

/** 获取榜单列表 */
export const getRanks = () => post<RankListRes>('rank/list');

/** 获取榜单项歌曲列表 */
export const getRankSongs = (data: RankSongListPayload) => post<RankSongListRes>('rank/songs', data);

/** 获取歌手搜索列表 */
export const getQuerySingers = (data: SearchPayload) => post<SingerSearchRes>('search/singers', data);

/** 获取歌曲搜索列表 */
export const getQuerySongs = (data: SearchPayload) => post<SongSearchRes>('search/songs', data);

/** 获取专辑搜索列表 */
export const getQueryAlbums = (data: SearchPayload) => post<AlbumSearchRes>('search/albums', data);

/** 获取歌单搜索列表 */
export const getQuerySpecials = (data: SearchPayload) => post<SpecialSearchRes>('search/specials', data);

/** 获取MV搜索列表 */
export const getQueryMvs = (data: SearchPayload) => post<MvSearchRes>('search/mvs', data);

/** 获取MV列表 */
export const getMvList = (data: MvListPayload) => post<MvListRes>('mv/list', data);

// /** 创建歌单(必须登录) */
// export const addSpecial = () => post('my/special/add');

// /** 更新歌单信息(必须登录) */
// export const updateSpecial = () => post('my/special/upd');

// /** 删除自建歌单(必须登录) */
// export const deleteSpecial = () => post('my/special/del');

// /** 添加歌曲到歌单(必须登录) */
// export const addSpecialSong = () => post('my/special/add/songs');

// /** 从自建歌单中移除歌曲(必须登录) */
// export const deleteSpecialSongs = () => post('my/special/del/songs');

// /** 获取自建歌单(包含收藏歌曲的歌曲)(必须登录) */
// export const getMySpecials = () => post('my/specials');

// /** 获取收藏歌曲列表(必须登录) */
// export const getLikeSongs = () => post('like/songs');

// /** 获取收藏专辑列表(必须登录) */
// export const getLikeAlbums = () => post('like/albums');

// /** 获取收藏歌单列表(必须登录) */
// export const getLikeSpecials = () => post('like/specials');

// /** 获取收藏的mv列表(必须登录) */
// export const getLikeMvs = () => post('like/mvs');

// /** 获取歌手写真图片列表 */
// export const getSingePhotos = () => post('singer/photos');

// /** 获取热搜词列表 */
// export const getHotKeys = () => post('hot-keys');

/** 获取歌曲歌词 */
export const getSongLyric = (data: LyricPayload) => post<LyricRes>('song/lyric', data);
