/**
 * @typedef {Object} Singer 歌手信息
 *
 * @property {string | number | undefined}  id         歌手id
 * @property {string | number | undefined}  mid        歌手mid
 * @property {string | undefined}           name       歌手名称
 * @property {string | undefined}           cover      歌手封面图片 URI
 * @property {string | undefined}           introduce  歌手介绍
 * @property {number | undefined}           songCount  歌手包含的歌曲数量
 * @property {number | undefined}           albumCount 歌手包含的专辑数量
 * @property {number | undefined}           mvCount    歌手包含的MV数量
 * @property {number | undefined}           fansCount  歌手关注(粉丝)量
 */

/**
 * @typedef {Object} Album 专辑信息
 *
 * @property {string | number | undefined}  id         专辑id
 * @property {string | number | undefined}  mid        专辑mid
 * @property {string | undefined}           name       专辑名称
 * @property {string | Singer | undefined}  singer     所属歌手
 * @property {string | undefined}           cover      专辑封面图片 URI
 * @property {string | undefined}           introduce  专辑介绍
 * @property {number | undefined}           songCount  专辑包含的歌曲数量
 * @property {string | undefined}           year       专辑发布年份
 */

/**
 * @typedef {Object} Song 歌曲信息
 *
 * @property {string | number | undefined}              id       歌曲id
 * @property {string | number | undefined}              mid      歌曲mid
 * @property {string | number | undefined}              vid      歌曲mv id
 * @property {string | undefined}                       title    歌曲标题
 * @property {string | Singer | Singer[] | undefined}   singer   歌手信息
 * @property {string | Album | undefined}               album    专辑信息
 * @property {string | undefined}                       duration 播放时长
 * @property {string | undefined}                       year     歌曲年份
 * @property {string | undefined}                       path     文件路径
 * @property {string | undefined}                       format   音频格式
 * @property {string | undefined}                       size     文件大小(如: 3.59MB)
 * @property {number | undefined}                       quality  音质等级
 */

/**
 * @typedef {Object} MV MV信息
 *
 * @property {string | number | undefined}              vid      mv id
 * @property {string | undefined}                       title    mv标题
 * @property {string | Singer | Singer[] | undefined}   singer   歌手信息
 * @property {number | undefined}                       cover    mv封面图
 * @property {string | undefined}                       duration 播放时长
 * @property {string | undefined}                       path     文件路径
 * @property {string | undefined}                       format   视频格式
 * @property {string | undefined}                       size     文件大小(如: 3.59MB)
 * @property {number | undefined}                       quality  画质等级
 */

/**
 * @typedef {Object} Page       分页对象
 *
 * @property {number} current               当前页
 * @property {number} size                  每页数据量大小
 * @property {number | undefined} total     数据总量
 */

/**
 * @typedef {Object} Tag    标签信息
 *
 * @property {string} id    分类标签id
 * @property {string} name  分类标签名
 */

/**
 * @typedef {Object} SingerTags 标签组信息
 *
 * @property {Tag[]} en         歌手检索字母分类标签
 * @property {Tag[]} area       歌手所属区域分类标签
 * @property {Tag[]} sex        歌手性别分类标签
 * @property {Tag[]} genre      歌手所属流派分类标签
 */

/**
 * @typedef {Object} SingerTagsParam    歌手分类标签作为参数信息
 *
 * @property {string | undefined} en                歌手检索字母
 * @property {string | undefined} area              歌手所属区域
 * @property {string | undefined} sex               歌手性别分类
 * @property {string | undefined} genre             歌手所属流派
 */

/**
 * @typedef {Object} HttpInfo                    HTTP状态码和响应头信息
 *
 * @property {number}                 statusCode HTTP状态码
 * @property {Record<string, string>} headers    HTTP响应头
 */

/** 默认的数据源API实现 */
export const DefaultSource = {
    id: 0,

    /**
     * 获取歌手列表信息集合
     *
     * @param {Page} page 分页对象,不能为null
     * @param {SingerTagsParam} tag 歌手分类标签对象
     * @return {Promise<{tags: SingerTags | null, list: Song[], page: Page, httpInfo:HttpInfo}>} 歌手信息列表集合
     */
    async singerList(tag, page) {
        return {tags:/** @type {SingerTagsParam} */{}, page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取歌手的歌曲列表
     *
     * @param {Singer} singer 歌手信息,不能为null
     * @param {Page} page 分页对象,不能为null
     * @return {Promise<{page: Page, singer: Singer | null, list:Song[], httpInfo:HttpInfo}>} 异步Promise对象
     */
    async singerSongList(singer, page) {
        return {singer, page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取歌手的专辑列表
     *
     * @param {Singer} singer 歌手信息,不能为null
     * @param {Page} page 分页对象,不能为null
     * @return {Promise<{page:Page, list:Album[], httpInfo:HttpInfo}>}专辑信息列表集合
     */
    async singerAlbumList(singer, page) {
        return {page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取专辑的歌曲列表
     *
     * @param {Album} album 专辑信息对象,不能为null
     * @param {Page} page 分页信息对象,不能为null
     * @return {Promise<{album:Album, list:Song[], httpInfo:HttpInfo}>} 专辑包含的歌曲List集合
     */
    async albumSongList(album, page) {
        return {album, page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取歌手的MV列表
     *
     * @param {Singer} singer 歌手信息,不能为null
     * @param {Page} page 分页对象,不能为null
     * @return {Promise<{page:Page, list:MV[], httpInfo:HttpInfo}>} MV信息列表集合
     */
    async singerMvList(singer, page) {
        return {page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },
}