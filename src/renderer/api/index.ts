import axios from 'axios';

import {
    Song,
    Album,
    Page,
    Singer,
    SingerTagsParam,
    Tag,
    Special,
    MvTagsParam,
    RankItem,
    LyricLine,
    AlbumSongModuleData,
    SingerAlbumModuleData,
    SingerListModuleData,
    SingerSongModuleData,
    SingerMvModuleData,
    MvListModuleData,
    SpecialSongModuleData,
    SpecialListModuleData,
    RankModuleData,
    SingerSearchModuleData,
    SongSearchModuleData,
    AlbumSearchModuleData,
    SpecialSearchModuleData,
    MvSearchModuleData,
    ProfileSpecialModuleData,
    LikeSongModuleData,
    LikeSpecialModuleData,
    LikeAlbumModuleData,
    LikeMvModuleData,
    LoginModuleData,
} from '../../types';

// 音乐平台id
let platform = 1;

/** 设置当前使用的音乐平台 */
export const setPlatform = (platformId: number) => platform = platformId;

/**
 * 获取歌手列表
 *
 * @param page 分页信息
 * @param tag  歌手分类标签信息
 * @return {Promise<SingerListModuleData>} 异步Promise对象
 */
export const getSingerList = (page: Page, tag: SingerTagsParam | null) =>
    axios.post('/api/singers', {platform, page, tag})
        .then<SingerListModuleData>(DataReducer);

/**
 * 获取歌手歌曲列表
 *
 * @param page 分页信息
 * @param singer 歌手信息
 * @return {Promise<SingerSongModuleData>} 异步Promise对象
 */
export const getSingerSongList = (page: Page, singer: Singer) =>
    axios.post('/api/singer/songs', {page, singer})
        .then<SingerSongModuleData>(DataReducer);

/**
 * 获取歌手专辑列表
 *
 * @param page   分页信息
 * @param singer 歌手信息
 * @return {Promise<SingerAlbumModuleData>} 异步Promise对象
 */
export const getSingerAlbumList = (page: Page, singer: Singer) =>
    axios.post('/api/singer/albums', {page, singer})
        .then<SingerAlbumModuleData>(DataReducer);

/**
 * 获取专辑歌曲列表
 *
 * @param page 分页信息
 * @param album 专辑信息
 * @return {Promise<AlbumSongModuleData>} 异步Promise对象
 */
export const getAlbumSongList = (page: Page, album: Album) =>
    axios.post('/api/album/songs', {page, album})
        .then<AlbumSongModuleData>(DataReducer);

/**
 * 获取歌手MV列表
 *
 * @param page 分页信息
 * @param singer 歌手信息
 * @return {Promise<SingerMvModuleData>} 异步Promise对象
 */
export const getSingerMvList = (page: Page, singer: Singer) =>
    axios.post('/api/singer/mvs', {page, singer})
        .then<SingerMvModuleData>(DataReducer);

/**
 * 获取歌单列表
 *
 * @param page 分页信息
 * @param tag 歌单分类标签信息
 * @return {Promise<SpecialListModuleData>} 异步Promise对象
 */
export const getSpecialList = (page: Page, tag: Tag | null) =>
    axios.post('/api/specials', {platform, page, tag})
        .then<SpecialListModuleData>(DataReducer);

/**
 * 获取歌单歌曲列表
 *
 * @param page 分页信息
 * @param special 歌单信息
 * @return {Promise<SpecialSongModuleData>} 异步Promise对象
 */
export const getSpecialSongList = (page: Page, special: Special) =>
    axios.post('/api/special/songs', {page, special})
        .then<SpecialSongModuleData>(DataReducer);

/**
 * 获取MV列表
 *
 * @param page 分页信息
 * @param tag MV分类标签信息
 * @return {Promise<MvListModuleData>} 异步Promise对象
 */
export const getMvList = (page: Page, tag: MvTagsParam | null) =>
    axios.post('/api/mvs', {platform, page, tag})
        .then<MvListModuleData>(DataReducer);

/**
 * 获取榜单及歌曲列表
 *
 * @param page 分页信息
 * @param item 榜单分类标签信息
 * @return {Promise<RankModuleData>} 异步Promise对象
 */
export const getRanksSongList = (page: Page, item: RankItem | null) =>
    axios.post('/api/ranks/songs', {platform, page, item})
        .then<RankModuleData>(DataReducer);

/**
 * 获取歌手搜索列表
 *
 * @param keyword  搜索关键词
 * @return {Promise<SingerSearchModuleData>} 异步Promise对象
 */
export const searchSinger = (keyword: string) =>
    axios.post('/api/search/singers', {platform, keyword})
        .then<SingerSearchModuleData>(DataReducer);

/**
 * 获取歌曲搜索列表
 *
 * @param page 分页信息
 * @param keyword 搜索关键词
 * @return {Promise<SongSearchModuleData>} 异步Promise对象
 */
export const searchSong = (page: Page, keyword: string) =>
    axios.post('/api/search/songs', {platform, page, keyword})
        .then<SongSearchModuleData>(DataReducer);

/**
 * 获取专辑搜索列表
 *
 * @param page 分页信息
 * @param keyword 搜索关键词
 * @return {Promise<AlbumSearchModuleData>} 异步Promise对象
 */
export const searchAlbum = (page: Page, keyword: string) =>
    axios.post('/api/search/albums', {platform, page, keyword})
        .then<AlbumSearchModuleData>(DataReducer);

/**
 * 获取歌单搜索列表
 *
 * @param page 分页信息
 * @param keyword 搜索关键词
 * @return {Promise<SpecialSearchModuleData>} 异步Promise对象
 */
export const searchSpecial = (page: Page, keyword: string) =>
    axios.post('/api/search/specials', {platform, page, keyword})
        .then<SpecialSearchModuleData>(DataReducer);

/**
 * 获取MV搜索列表
 *
 * @param page 分页信息
 * @param keyword 搜索关键词
 * @return {Promise<MvSearchModuleData>} 异步Promise对象
 */
export const searchMv = (page: Page, keyword: string) =>
    axios.post('/api/search/mvs', {platform, page, keyword})
        .then<MvSearchModuleData>(DataReducer);


/**
 * 创建歌单(必须登录)
 *
 * @param special 歌单名称
 */
export const createSpecial = (special: string) =>
    axios.post('/api/special/create', {platform, name: special})
        .then<Special>(DataReducer);

/**
 * 更新歌单信息(必须登录)
 *
 * @param special 歌单信息
 */
export const updateSpecial = (special: Special) =>
    axios.post('/api/special/update', {platform, special})
        .then<boolean>(DataReducer);

/**
 * 移除自建歌单(必须登录)
 *
 * @param special 歌单信息(包含关键的id和mid)
 */
export const removeSpecial = (special: Special) =>
    axios.post('/api/special/remove', {platform, special})
        .then<boolean>(DataReducer);

/**
 * 添加歌曲到歌单(必须登录)
 *
 * @param songs 歌曲信息列表(包含关键的id和mid)
 * @param special 歌单信息(包含关键的id和mid)
 */
export const addSpecialSong = (songs: Song[], special: Special) =>
    axios.post('/api/special/songs/add', {platform, songs, special})
        .then<boolean>(DataReducer);

/**
 * 从自建歌单中移除歌曲(必须登录)
 *
 * @param songs 歌曲信息列表(包含关键的id和mid)
 * @param special 歌单信息(包含关键的id和mid)
 */
export const removeSpecialSong = (songs: Song[], special: Special) =>
    axios.post('/api/special/songs/remove', {platform, songs, special})
        .then<boolean>(DataReducer);


/**
 * 获取自建歌单(包含收藏歌曲的歌曲)
 */
export const getProfileSpecials = () =>
    axios.post('/api/profile/specials', {platform})
        .then<ProfileSpecialModuleData>(DataReducer);

/**
 * 获取收藏歌曲列表(必须登录)
 *
 * @param page 分页信息
 */
export const getLikeSongs = (page: Page,) =>
    axios.post('/api/like/songs', {platform, page})
        .then<LikeSongModuleData>(DataReducer);

/**
 * 获取收藏歌单列表(必须登录)
 *
 * @param page 分页信息
 */
export const getLikeSpecials = (page: Page) =>
    axios.post('/api/like/specials', {platform, page})
        .then<LikeSpecialModuleData>(DataReducer);

/**
 * 获取收藏专辑列表(必须登录)
 *
 * @param page 分页信息
 */
export const getLikeAlbums = (page: Page) =>
    axios.post('/api/like/albums', {platform, page})
        .then<LikeAlbumModuleData>(DataReducer);

/**
 * 获取收藏的mv列表(必须登录)
 *
 * @param page 分页信息
 */
export const getLikeMvs = (page: Page) =>
    axios.post('/api/like/mvs', {platform, page})
        .then<LikeMvModuleData>(DataReducer);


/**
 * 获取歌曲歌词
 *
 * @param song 歌曲信息
 * @return {Promise<LyricLine[]>} 异步Promise对象
 */
export const getLyric = (song: Song) =>
    axios.post('/api/lyric', song).then<LyricLine[]>(DataReducer);

/**
 * 获取歌手写真图片列表
 *
 * @param song 歌曲信息
 * @return {Promise<string[]>} 异步Promise对象
 */
export const getSingeCovers = (song: Song) =>
    axios.post('/api/singer/pic', song).then<string[]>(DataReducer);

/**
 * 获取热搜词列表
 *
 * @return {Promise<string[]>} 异步Promise对象
 */
export const getHotKeys = () => axios.post('/api/hot-keys').then<string[]>(DataReducer);

/**
 * 获取登录选项配置(当参数中不包含cookie信息) 或 登录用户信息(当参数中包含cookie信息)
 *
 * @param cookies cookie信息
 * @return {Promise<LoginModuleData>} 异步Promise对象
 */
export const login = (cookies: Electron.Cookie[] | null) =>
    axios.post('/api/user/login', {platform, cookies})
        .then<LoginModuleData>(DataReducer)
        .catch((reason: any) => {
            const {message, response: {data: {reason: msg = ''} = {}} = {}} = reason
            return {reason: msg || message} as LoginModuleData;
        });

/**
 * 退出登录,并返回需要移除cookie的URL
 *
 * @return {Promise<{cookieURL:string}>} 异步Promise对象
 */
export const logout = () =>
    axios.post('/api/user/login', {platform})
        .then<{ cookieURL: string }>(DataReducer);


/**
 * 将axios中返回的数据进行消减一层, 获取真正需要的data
 *
 * @template T
 * @param res axios内容响应对象
 * @return {T} 后台服务器返回的实际内容
 */
const DataReducer = <T>(res: any) => res.data as T;