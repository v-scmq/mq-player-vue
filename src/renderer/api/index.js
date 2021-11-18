import axios from 'axios';

// 音乐平台id
let platform = 1;

/** 设置当前使用的音乐平台 */
export const setPlatform = platformId => platform = platformId;

/**
 * 获取歌手列表
 *
 * @param {Page} page                   分页对象
 * @param {SingerTagsParam | null} tag  歌手分类标签信息
 * @returns {Promise<{page:Page, tags:SingerTags, list:Singer[]}>} 异步Promise对象
 */
export const getSingerList = (page, tag) =>
    axios.post('/api/singers', {platform, page, tag}).then(DataReducer);

/**
 * 获取歌手歌曲列表
 *
 * @param {Page}    page     分页对象
 * @param {Singer}  singer   歌手信息
 * @returns {Promise<{page:Page, singer:Singer | null, list:Song[]}>} 异步Promise对象
 */
export const getSingerSongList = (page, singer) =>
    axios.post('/api/singer/songs', {platform, page, singer}).then(DataReducer);

/**
 * 获取歌手专辑列表
 *
 * @param {Page}    page     分页对象
 * @param {Singer}  singer   歌手信息
 * @returns {Promise<{page: Page, list: Album[]}>} 异步Promise对象
 */
export const getSingerAlbumList = (page, singer) =>
    axios.post('/api/singer/albums', {platform, page, singer}).then(DataReducer);

/**
 * 获取专辑歌曲列表
 *
 * @param {Page}    page     分页对象
 * @param {Album}   album    专辑信息
 * @returns {Promise<{album:Album | null, list:Song[]}>} 异步Promise对象
 */
export const getAlbumSongList = (page, album) =>
    axios.post('/api/album/songs', {platform, page, album}).then(DataReducer);

/**
 * @typedef {Object} Tag        标签信息
 *
 * @property {string} id   分类标签id
 * @property {string} name          分类标签名
 * @property {any} [key:string]     额外的信息
 */
/**
 * 获取歌手MV列表
 *
 * @param {Page}    page     分页对象
 * @param {Singer}  singer   歌手信息
 * @returns {Promise<{page:Page, list:Mv[]}>} 异步Promise对象
 */
export const getSingerMvList = (page, singer) =>
    axios.post('/api/singer/mvs', {platform, page, singer}).then(DataReducer);

/**
 * 获取歌单列表
 *
 * @param {Page}        page     分页对象
 * @param {Tag | null}  tag      歌单分类标签信息
 * @returns {Promise<{tags:SpecialTags[], page:Page, list:Special[]}>} 异步Promise对象
 */
export const getSpecialList = (page, tag) =>
    axios.post('/api/specials', {platform, page, tag}).then(DataReducer);

/**
 * 获取歌单歌曲列表
 *
 * @param {Page}        page     分页对象
 * @param {Special}     special  歌单信息
 * @returns {Promise<{special:Special, page:Page, list:Song[]}>} 异步Promise对象
 */
export const getSpecialSongList = (page, special) =>
    axios.post('/api/special/songs', {platform, page, special}).then(DataReducer);

/**
 * 获取MV列表
 *
 * @param {Page}                page     分页对象
 * @param {MvTagsParam | null}  tag      MV分类标签信息
 * @returns {Promise<{tags:MvTags | null, page:Page, list:Mv[]}>} 异步Promise对象
 */
export const getMvList = (page, tag) =>
    axios.post('/api/mvs', {platform, page, tag}).then(DataReducer);

/**
 * 获取榜单及歌曲列表
 *
 * @param {Page}                page     分页对象
 * @param {RankItem | null}     item     榜单分类标签信息
 * @returns {Promise<{page:Page, rankList:Rank[], list:Song[]}>} 异步Promise对象
 */
export const getRanksSongList = (page, item) =>
    axios.post('/api/ranks/songs', {platform, page, item}).then(DataReducer);

/**
 * 获取歌手搜索列表
 *
 * @param {string}              keyword  搜索关键词
 * @returns {Promise<{list:Singer[]}>} 异步Promise对象
 */
export const searchSinger = (keyword) =>
    axios.post('/api/search/singers', {platform, keyword}).then(DataReducer);

/**
 * 获取歌曲搜索列表
 *
 * @param {Page}                page     分页对象
 * @param {string}              keyword  搜索关键词
 * @returns {Promise<{page:Page, list:Song[]}>} 异步Promise对象
 */
export const searchSong = (page, keyword) =>
    axios.post('/api/ranks/songs', {platform, page, keyword}).then(DataReducer);

/**
 * 获取专辑搜索列表
 *
 * @param {Page}                page     分页对象
 * @param {string}              keyword  搜索关键词
 * @returns {Promise<{page:Page, list:Album[]}>} 异步Promise对象
 */
export const searchAlbum = (page, keyword) =>
    axios.post('/api/ranks/songs', {platform, page, keyword}).then(DataReducer);

/**
 * 获取歌单搜索列表
 *
 * @param {Page}                page     分页对象
 * @param {string}              keyword  搜索关键词
 * @returns {Promise<{page:Page, list:Special[]}>} 异步Promise对象
 */
export const searchSpecial = (page, keyword) =>
    axios.post('/api/search/specials', {platform, page, keyword}).then(DataReducer);

/**
 * 获取MV搜索列表
 *
 * @param {Page}                page     分页对象
 * @param {string}              keyword  搜索关键词
 * @returns {Promise<{page:Page, list:Mv[]}>} 异步Promise对象
 */
export const searchMv = (page, keyword) =>
    axios.post('/api/search/mvs', {platform, page, keyword}).then(DataReducer);

/**
 * 获取歌曲歌词
 *
 * @param {Song}    song     歌曲信息
 * @returns {Promise<[{millis:number, content:string}]>} 异步Promise对象
 */
export const getLyric = (song) =>
    axios.post('/api/lyric', {platform, song}).then(DataReducer);

/**
 * 获取歌手写真图片列表
 *
 * @param {Singer}  singer      歌曲信息
 * @returns {Promise<string[]>} 异步Promise对象
 */
export const getSingerPicture = (singer) =>
    axios.post('/api/singer/pic', {platform, singer}).then(DataReducer);

/**
 * 获取登录选项配置(当参数中不包含cookie信息) 或 登录用户信息(当参数中包含cookie信息)
 *
 * @param {Electron.Cookie[] | null}  cookies  cookie信息
 * @returns {Promise<{option:ModalOpenOption} | {reason:string | null, user:User | null}>} 异步Promise对象
 */
export const login = (cookies) =>
    axios.post('/api/user/login', {platform, cookies}).then(DataReducer);

/**
 * 退出登录,并返回需要移除cookie的URL
 *
 * @returns {Promise<{cookieURL:string}>} 异步Promise对象
 */
export const logout = () =>
    axios.post('/api/user/login', {platform}).then(DataReducer);


/**
 * 将axios中返回的数据进行消减一层, 获取真正需要的data
 *
 * @param {any} res axios内容响应对象
 * @return {any} 后台服务器返回的实际内容
 */
const DataReducer = res => res.data;