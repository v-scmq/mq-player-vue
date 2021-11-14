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
 * @typedef {Object} Mv mv信息
 *
 * @property {string | number | undefined}              vid      mv id
 * @property {string | undefined}                       title    mv标题
 * @property {string | Singer | Singer[] | undefined}   singer   歌手信息
 * @property {string | undefined}                       cover    mv封面图
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
 * @typedef {Object} Tag        标签信息
 *
 * @property {string} id   分类标签id
 * @property {string} name          分类标签名
 * @property {any} [key:string]     额外的信息
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
 * @typedef {{[key: keyof SingerTags]: string | number}} SingerTagsParam  歌手分类标签作为参数信息
 */

/**
 * @typedef {Object} SpecialTags 歌单分类标签
 *
 * @property {string} title 歌单分类(标签组)标题
 * @property {Tag[]}  items 歌单子分类标签列表
 */

/**
 * @typedef {Object} Special    歌单信息
 *
 * @property {string} mid                       歌单mid
 * @property {string} name                      歌单名称
 * @property {string | number | undefined} id   歌单id
 * @property {string | undefined} cover         歌单封面URL
 * @property {string | undefined} introduce     歌单简介
 * @property {string | undefined} creator       歌单创建者
 * @property {string | undefined} userId        用户id
 */
/**
 * @typedef {Object} MvTags mv分类标签信息
 *
 * @property {Tag[]} area 区域分类标签
 * @property {Tag[]} version 版本分类标签
 */

/**
 * @typedef {{[key: keyof MvTags]: string | number}} MvTagsParam 获取mv列表时的分类标签参数信息
 */

/**
 * @typedef {Object} RankItem           音乐排行榜子分类列表项
 *
 * @property {string | number} id       分类id
 * @property {string |undefined} name   排行榜名称
 * @property {string |undefined} cover  排行榜图标URL
 */

/**
 * @typedef {Object} Rank           音乐排行榜分类信息
 *
 * @property {string | number} id   榜单分组id
 * @property {string} title         榜单分组标题
 * @property {RankItem[]} items     榜单子分类列表
 */

/**
 * @typedef {Object} User                       登录用户信息
 *
 * @property {string | number}  uin             登录用户账号
 * @property {string}           nickName        用户昵称
 * @property {string}           headURI         用户头像URI
 * @property {boolean}          vip             是否是vip
 * @property {number}           level           vip等级
 * @property {string}           levelIconURI    vip等级图标
 * @property {string}           startTime       开通vip的时间
 * @property {string}           endTime         vip到期时间
 * @property {boolean}          autoPay         是否自动续费
 * @property {any}              [key:string]    额外的信息
 */

/**
 * @typedef {Object} HttpInfo                    HTTP状态码和响应头信息
 *
 * @property {number}                 statusCode HTTP状态码
 * @property {Record<string, string>} headers    HTTP响应头
 */

/**
 * @typedef {Object} HttpCookie                     HttpCookie信息
 *
 * @property {string} value                         cookie值
 * @property {string} default                       默认cookie值
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
        return {tags: null, page, list: [], httpInfo: {statusCode: 200, headers: {}}};
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
     * @return {Promise<{page:Page, list:Mv[], httpInfo:HttpInfo}>} MV信息列表集合
     */
    async singerMvList(singer, page) {
        return {page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取歌单列表
     *
     * @param {Tag | null} tag  歌单分类标签信息
     * @param {Page} page       分页对象
     * @returns {Promise<{tags:SpecialTags[], page:Page, list:Special[], httpInfo:HttpInfo}>} 异步Promise对象
     */
    async specialList(tag, page) {
        return {tags: [], page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取歌单包含的歌曲列表
     *
     * @param {Special} special 歌单信息
     * @param {Page} page 分页对象
     * @returns {Promise<{special:Special, page:Page, list:Song[], httpInfo:HttpInfo}>} 歌单中的歌曲的List集合
     */
    async specialSongList(special, page) {
        return {special, page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取指定MV分类下的MV列表
     *
     * @param {MvTagsParam | null} tag MV分类标签信息
     * @param {Page} page 分页对象
     * @return {Promise<{page:Page, tags:MvTags, list:Mv[], httpInfo:HttpInfo}>} 异步Promise对象
     */
    async mvList(tag, page) {
        return {tags: {area: [], version: []}, page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 获取指定榜单项包含的音乐列表
     *
     * @param {RankItem | null} item 榜单项
     * @param {Page} page 分页对象
     * @return {Promise<{page:Page, rankList:Rank[], list:Song[], httpInfo:HttpInfo}>} 异步Promise对象
     */
    async rankSongList(item, page) {
        return {page, rankList: [], list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 搜索歌手
     *
     * @param {string} keyword 歌手名关键词
     * @return {Promise<{list:Singer[], httpInfo:HttpInfo}>} 歌手信息列表集合
     */
    async singerSearch(keyword) {
        return {list: [{mid: '1S21239V', name: keyword}], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 搜索歌曲,这个搜索关键词可以是歌曲名、歌手名、专辑名
     *
     * @param {string} keyword 搜索关键词(也可以是拼音)
     * @param {Page} page 分页对象
     * @return {Promise<{page:Page, list:[], httpInfo:HttpInfo}>} 异步Promise对象
     */
    async songSearch(keyword, page) {
        return {page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 搜索专辑,这个搜索关键词可以是歌曲名、歌手名、专辑名
     *
     * @param {string} keyword 搜索关键词(也可以是拼音)
     * @param {Page} page 分页对象
     * @return {Promise<{page:Page, list:Album[], httpInfo:HttpInfo}>} 专辑信息列表集合
     */
    async albumSearch(keyword, page) {
        return {page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 搜索MV,这个搜索关键词可以是歌曲名、歌手名、专辑名
     *
     * @param {string} keyword 搜索关键词(也可以是拼音)
     * @param {Page} page 分页对象
     * @return {Promise<{page:Page, list:Mv[], httpInfo:HttpInfo}>} MV信息列表集合
     */
    async mvSearch(keyword, page) {
        return {page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 根据关键词搜索歌单, 以获得歌单列表
     *
     * @param {string} keyword 搜索关键词(也可以是拼音)
     * @param {Page} page 分页对象
     * @return {Promise<{page, list:Special[], httpInfo:HttpInfo}>} 歌单信息列表集合
     */
    async specialSearch(keyword, page) {
        return {page, list: [], httpInfo: {statusCode: 200, headers: {}}};
    },

    /**
     * 开始登录, 并获取用户基本信息 <br>
     *
     *  注意: {@param cookies} 参数至少需要包含一个cookie信息,否则认为获取登录配置选项
     *
     * @param {Electron.Cookie[] | null} cookies cookie信息
     * @returns {Promise<{option:ModalOpenOption | null, httpInfo:HttpInfo} |
     *                   {reason:string | null, user:User | null, httpInfo:HttpInfo}>} 异步Promise对象
     */
    async login(cookies) {
        if (cookies == null || cookies.length < 1) {
            // 访问受限
            return {option: null, httpInfo: {statusCode: 403, headers: {}}};
        }

        return {
            reason: '不支持的操作！', user: null,
            httpInfo: {statusCode: cookies ? 200 : 404, headers: {}}
        };
    },

    /**
     * 退出登录
     *
     * @return {Promise<{cookieURL:string, httpInfo:HttpInfo}>} 异步Promise对象
     */
    async logout() {
        // 访问受限
        return {cookieURL: '', httpInfo: {statusCode: 403, headers: {}}};
    }
}