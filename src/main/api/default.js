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
 * @property {string | undefined}           genre       所属流派
 * @property {string | undefined}           language    语种
 * @property {string | undefined}           company     唱片公司
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
 * @property {string | number | undefined}              id          mv id
 * @property {string | number | undefined}              vid         mv vid
 * @property {string | undefined}                       title       mv标题
 * @property {string | Singer | Singer[] | undefined}   singer      歌手信息
 * @property {string | undefined}                       cover       mv封面图
 * @property {string | undefined}                       duration    播放时长
 * @property {string | undefined}                       path        文件路径
 * @property {string | undefined}                       format      视频格式
 * @property {string | undefined}                       year        发布年份
 * @property {number | undefined}                       playCount   播放量
 * @property {string | undefined}                       size        文件大小(如: 3.59MB)
 * @property {number | undefined}                       quality     画质等级
 */

/**
 * @typedef {Object} Page       分页对象
 *
 * @property {number} current               当前页
 * @property {number} size                  每页数据量大小
 * @property {number | undefined} total     数据总量
 * @property {number | undefined} pageCount 总页数
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
 * @typedef {Object} HttpCookie                 HttpCookie信息
 *
 * @property {string | number}    uin           账号
 * @property {string | number}    randomId      随机id
 * @property {string}             value         cookie值
 * @property {string}             default       默认cookie值
 */

/** 默认的数据源API实现 */
export const DefaultSource = {
    id: 0,

    /**
     * 获取歌手列表信息集合
     *
     * @param {Page} page 分页对象,不能为null
     * @param {SingerTagsParam} tag 歌手分类标签对象
     * @return {Promise<{tags: SingerTags | null, list: Singer[], page: Page, httpInfo:HttpInfo}>} 歌手信息列表集合
     */
    async singerList(tag, page) {
        const list = []
        for (let index = 1; index < 201; ++index) {
            list.push({
                mid: `mid-${index}`,
                name: `-singer-${index}-name`,
                cover: '/icon/default_cover.jpg'
            })
        }
        return {
            tags: {
                en: [{id: '0', name: '全部'}, {id: '1', name: 'A'}],
                sex: [{id: '0', name: '全部'}, {id: '1', name: '男'}, {id: '2', name: '女'}],
                area: [{id: '0', name: '全部'}],
                genre: [{id: '0', name: '全部'}]
            },
            page, list, httpInfo: {statusCode: 200, headers: {}}
        };
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
     * @return {Promise<{page:Page, album:Album, list:Song[], httpInfo:HttpInfo}>} 专辑包含的歌曲List集合
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
        const value = JSON.parse('{"page":{"current":1,"size":30,"total":100,"pageCount":4},"rankList":[{"id":0,"title":"巅峰榜","items":[{"id":"62,2021-11-24","name":"飙升榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000L9yGG2zhiFG.jpg"},{"id":"26,2021_46","name":"热歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003d6Awd0O79Md.jpg"},{"id":"27,2021-11-24","name":"新歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002sTsl43q60hW.jpg"},{"id":"4,2021-11-24","name":"流行指数榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000004Khv0S1i1cPq.jpg"},{"id":"52,2021-11-24","name":"腾讯音乐人原创榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003SrMeN2HtmDn.jpg"},{"id":"67,2021-11-24","name":"听歌识曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M0000030t4eu3FwGIy.jpg"},{"id":"201,","name":"MV榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002qxsIw0mCGSv.jpg"}]},{"id":1,"title":"地区榜","items":[{"id":"5,2021_46","name":"内地榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000WfCE73AUhXZ.jpg"},{"id":"59,2021_46","name":"香港地区榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003bKeJx1gSIn9.jpg"},{"id":"61,2021_46","name":"台湾地区榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003UF8GU2pICqU.jpg"},{"id":"3,2021_46","name":"欧美榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003CZMHg4Mog72.jpg"},{"id":"16,2021_46","name":"韩国榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002uv0H81wmIXB.jpg"},{"id":"17,2021_46","name":"日本榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001xvJMp243t6s.jpg"}]},{"id":2,"title":"特色榜","items":[{"id":"28,2021_46","name":"网络歌曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000WZ7my1ff478.jpg"},{"id":"63,2021_46","name":"DJ舞曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000MYrTY2MqNas.jpg"},{"id":"74,2021_46","name":"Q音快手榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000004Yx8930iTmOZ.jpg"},{"id":"60,2021_46","name":"抖音排行榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M0000038CpZW2iO2x6.jpg"},{"id":"64,2021_46","name":"综艺新歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003vydae3MSR34.jpg"},{"id":"29,2021_46","name":"影视金曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001P8SpK14Gswy.jpg"},{"id":"65,2021_46","name":"国风热歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002O5vk234k7oj.jpg"},{"id":"58,2021_46","name":"说唱榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003lAV6j0VHpL4.jpg"},{"id":"57,2021_46","name":"电音榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001TZI9b3U5VnR.jpg"},{"id":"72,2021_46","name":"动漫音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002hhjha2SFsdX.jpg"},{"id":"73,2021_46","name":"游戏音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001Bbccw4CMZvg.jpg"},{"id":"70,2021_46","name":"达人音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002MU7em0soydS.jpg"},{"id":"36,2021_46","name":"K歌金曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003A6kU047prvs.jpg"},{"id":"131,2021_45","name":"大学生音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003B8k7d0CC09j.jpg"}]},{"id":3,"title":"全球榜","items":[{"id":"108,2021_46","name":"美国公告牌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001eb6wK4WQ1cK.jpg"},{"id":"123,2021_47","name":"美国热门音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003lVJOC4ZEwJB.jpg"},{"id":"129,2021_47","name":"韩国Melon榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003MOyy90PzGOf.jpg"},{"id":"107,2021_47","name":"英国UK榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000jq6zE4XpzZz.jpg"},{"id":"105,2021_47","name":"日本公信榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002oWJFp2Qe83l.jpg"},{"id":"126,2021_47","name":"JOOX本地热播榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001xrOIy0VGRQD.jpg"},{"id":"130,2021_47","name":"香港TVB劲歌金榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000004HR6dd43AwT3.jpg"},{"id":"127,2021_47","name":"台湾KKBOX榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002WGWoV3fsTub.jpg"},{"id":"128,2021_47","name":"YouTube音乐排行榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M0000009h9jy2tAMLZ.jpg"}]}],"list":[{"id":332882761,"mid":"002n8WAV4KfuPM","title":"爱情神话","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"000jHzwj4O8iOP","name":"爱情神话","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000jHzwj4O8iOP_1.jpg%3Fmax_age%3D2592000","year":"2021-11-23"},"duration":"04:26","year":"2021-11-23","vid":"","path":"/api/url/song?platform=1&mid=002n8WAV4KfuPM&id=332882761&quality=1"},{"id":331839675,"mid":"003UkWuI0E8U0l","title":"孤勇者","singer":[{"id":143,"mid":"003Nz2So3XXYek","name":"陈奕迅","title":"陈奕迅","type":0,"uin":0,"pmid":""}],"album":{"mid":"001uaPM93kxk1R","name":"孤勇者","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000001uaPM93kxk1R_3.jpg%3Fmax_age%3D2592000","year":"2021-11-08"},"duration":"04:16","year":"2021-11-08","vid":"y0041ywgpm7","path":"/api/url/song?platform=1&mid=003UkWuI0E8U0l&id=331839675&quality=1"},{"id":333430506,"mid":"001iCo0N30TafW","title":"选择 (Live)","singer":[{"id":596,"mid":"003xM8SD2WibJI","name":"林子祥","title":"林子祥","type":0,"uin":0,"pmid":""},{"id":24833,"mid":"002mze3U0NYXOM","name":"胡夏","title":"胡夏","type":0,"uin":0,"pmid":""}],"album":{"mid":"00158yZI3TQsPC","name":"中国梦之声·我们的歌第三季 第10期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M00000158yZI3TQsPC_2.jpg%3Fmax_age%3D2592000","year":"2021-11-21"},"duration":"04:27","year":"2021-11-21","vid":"s0041jbjx52","path":"/api/url/song?platform=1&mid=001iCo0N30TafW&id=333430506&quality=1"},{"id":203514624,"mid":"00375L600p9sxv","title":"像我这样的人 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"0001n7a82gh6IY","name":"明日之子 第8期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000001n7a82gh6IY_1.jpg%3Fmax_age%3D2592000","year":"2017-08-05"},"duration":"02:51","year":"2017-08-05","vid":"y0026hr4b5e","path":"/api/url/song?platform=1&mid=00375L600p9sxv&id=203514624&quality=1"},{"id":213224236,"mid":"000uhMwj387EBp","title":"牧马城市","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"001yHQzz2rm3lk","name":"老男孩 电视剧原声带","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000001yHQzz2rm3lk_1.jpg%3Fmax_age%3D2592000","year":"2018-03-29"},"duration":"04:18","year":"2018-03-29","vid":"k002671le5d","path":"/api/url/song?platform=1&mid=000uhMwj387EBp&id=213224236&quality=1"},{"id":102193483,"mid":"000NqZLy2lfXjT","title":"我们的歌","singer":[{"id":265,"mid":"001JDzPT3JdvqK","name":"王力宏","title":"王力宏","type":0,"uin":0,"pmid":""}],"album":{"mid":"002Zwh5p4HgecI","name":"改变自己","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002Zwh5p4HgecI_1.jpg%3Fmax_age%3D2592000","year":"2007-07-13"},"duration":"04:07","year":"2007-07-13","vid":"q0013x75hkk","path":"/api/url/song?platform=1&mid=000NqZLy2lfXjT&id=102193483&quality=1"},{"id":203451421,"mid":"003kLvu04bLGzi","title":"消愁 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"002xoonH2Bk7FR","name":"明日之子 第7期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002xoonH2Bk7FR_1.jpg%3Fmax_age%3D2592000","year":"2017-07-29"},"duration":"02:59","year":"2017-07-29","vid":"x00248tvbgv","path":"/api/url/song?platform=1&mid=003kLvu04bLGzi&id=203451421&quality=1"},{"id":331251776,"mid":"002Svoe23jftw0","title":"影子说","singer":[{"id":6144212,"mid":"001cw0Sr12ZLc4","name":"洛先生","title":"洛先生","type":0,"uin":0,"pmid":""}],"album":{"mid":"003pp4xV1Vztwu","name":"影子说","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003pp4xV1Vztwu_3.jpg%3Fmax_age%3D2592000","year":"2021-11-02"},"duration":"04:19","year":"2021-11-02","vid":"","path":"/api/url/song?platform=1&mid=002Svoe23jftw0&id=331251776&quality=1"},{"id":5089887,"mid":"004673lC2KA9z5","title":"相依为命","singer":[{"id":4284,"mid":"004DFS271osAwp","name":"陈小春","title":"陈小春","type":0,"uin":0,"pmid":""}],"album":{"mid":"003IJ0iE4AJ1xi","name":"陈小春金碟铁盒珍藏系列","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003IJ0iE4AJ1xi_1.jpg%3Fmax_age%3D2592000","year":"2008-09-25"},"duration":"03:57","year":"2008-09-25","vid":"h0012abhb4q","path":"/api/url/song?platform=1&mid=004673lC2KA9z5&id=5089887&quality=1"},{"id":280688800,"mid":"002BZinz35lH8D","title":"最后的莫西干人+谁能明白我","singer":[{"id":6777501,"mid":"003Oc68A4ZrUDn","name":"王小康","title":"王小康","type":0,"uin":0,"pmid":""}],"album":{"mid":"004QXvek0z5RUA","name":"最后的莫西干人+谁能明白我","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000004QXvek0z5RUA_1.jpg%3Fmax_age%3D2592000","year":"2020-10-21"},"duration":"03:21","year":"2020-10-21","vid":"","path":"/api/url/song?platform=1&mid=002BZinz35lH8D&id=280688800&quality=1"},{"id":331896479,"mid":"002LUKvT1NuNOm","title":"秒针 (Dj版)","singer":[{"id":4055289,"mid":"002ffRcI0XN8px","name":"阿梨粤","title":"阿梨粤","type":1,"uin":443824251,"pmid":""},{"id":9013795,"mid":"0014qOxU355jDk","name":"R7","title":"R7","type":0,"uin":0,"pmid":""}],"album":{"mid":"000Fzz1W4SHfqm","name":"秒针","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000Fzz1W4SHfqm_1.jpg%3Fmax_age%3D2592000","year":"2021-11-09"},"duration":"02:58","year":"2021-11-09","vid":"","path":"/api/url/song?platform=1&mid=002LUKvT1NuNOm&id=331896479&quality=1"},{"id":102066257,"mid":"002hXDfk0LX9KO","title":"听妈妈的话","singer":[{"id":4558,"mid":"0025NhlN2yWrP4","name":"周杰伦","title":"周杰伦","type":0,"uin":0,"pmid":""}],"album":{"mid":"002jLGWe16Tf1H","name":"依然范特西","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002jLGWe16Tf1H_1.jpg%3Fmax_age%3D2592000","year":"2006-09-05"},"duration":"04:25","year":"2006-09-05","vid":"u0012xltd8y","path":"/api/url/song?platform=1&mid=002hXDfk0LX9KO&id=102066257&quality=1"},{"id":7090,"mid":"001yZ7Tf0kudte","title":"爱，很简单","singer":[{"id":101,"mid":"002cK0F12szD9T","name":"陶喆","title":"陶喆","type":0,"uin":0,"pmid":""}],"album":{"mid":"003ROVwj4PqLPa","name":"陶喆同名专辑","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003ROVwj4PqLPa_1.jpg%3Fmax_age%3D2592000","year":"1997-12-06"},"duration":"04:29","year":"1997-12-06","vid":"x00111flj0l","path":"/api/url/song?platform=1&mid=001yZ7Tf0kudte&id=7090&quality=1"},{"id":332438548,"mid":"002Gd0jn1wU11x","title":"第51次原谅","singer":[{"id":6764673,"mid":"003nRjEX3diMiV","name":"刘艺雯","title":"刘艺雯","type":1,"uin":0,"pmid":""}],"album":{"mid":"004WSaGi331A99","name":"第51次原谅","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000004WSaGi331A99_1.jpg%3Fmax_age%3D2592000","year":"2021-11-13"},"duration":"03:59","year":"2021-11-13","vid":"","path":"/api/url/song?platform=1&mid=002Gd0jn1wU11x&id=332438548&quality=1"},{"id":320466101,"mid":"002ehZoP3KY9W8","title":"尾号6208","singer":[{"id":1264348,"mid":"001C8eOJ0f7yoq","name":"严浩翔","title":"严浩翔","type":0,"uin":0,"pmid":""}],"album":{"mid":"003Szv7f2resBD","name":"尾号6208","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003Szv7f2resBD_1.jpg%3Fmax_age%3D2592000","year":"2021-08-16"},"duration":"03:33","year":"2021-08-16","vid":"","path":"/api/url/song?platform=1&mid=002ehZoP3KY9W8&id=320466101&quality=1"},{"id":203705594,"mid":"002WLDmw0vkHtC","title":"借 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"002iBxBy3bAmCx","name":"明日之子 第11期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002iBxBy3bAmCx_1.jpg%3Fmax_age%3D2592000","year":"2017-08-26"},"duration":"03:34","year":"2017-08-26","vid":"p0024yo3a5g","path":"/api/url/song?platform=1&mid=002WLDmw0vkHtC&id=203705594&quality=1"},{"id":718475,"mid":"0027oMO61wWi55","title":"发如雪","singer":[{"id":4558,"mid":"0025NhlN2yWrP4","name":"周杰伦","title":"周杰伦","type":0,"uin":0,"pmid":""}],"album":{"mid":"0024bjiL2aocxT","name":"十一月的萧邦","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000024bjiL2aocxT_1.jpg%3Fmax_age%3D2592000","year":"2005-11-01"},"duration":"04:59","year":"2005-11-01","vid":"g0022gfiw3p","path":"/api/url/song?platform=1&mid=0027oMO61wWi55&id=718475&quality=1"},{"id":331850330,"mid":"002zQHGy0ao8TC","title":"探窗 (416女团热搜版)","singer":[{"id":5475574,"mid":"003EBdnp0sVReZ","name":"叶聪明","title":"叶聪明","type":1,"uin":0,"pmid":""},{"id":8413787,"mid":"003C2gNf1sHFHb","name":"ya妖精","title":"ya妖精","type":1,"uin":0,"pmid":""},{"id":4062736,"mid":"002zHaIr1Yqevs","name":"小淅儿","title":"小淅儿","type":1,"uin":994986865,"pmid":""},{"id":5173692,"mid":"000Sm8ZI1qbwgT","name":"边靖婷","title":"边靖婷","type":1,"uin":1143742236,"pmid":""},{"id":9149309,"mid":"002lowTs2jBD7c","name":"是可爱晨","title":"是可爱晨","type":1,"uin":0,"pmid":""},{"id":168296,"mid":"003W5e4R1SPbLY","name":"汐音社","title":"汐音社","type":2,"uin":0,"pmid":""}],"album":{"mid":"000hCOvC363Q6f","name":"探窗 (416女团热搜版)","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000hCOvC363Q6f_3.jpg%3Fmax_age%3D2592000","year":"2021-11-07"},"duration":"03:08","year":"2021-11-07","vid":"","path":"/api/url/song?platform=1&mid=002zQHGy0ao8TC&id=331850330&quality=1"},{"id":333318124,"mid":"002azdxu1orJa0","title":"花香","singer":[{"id":2141386,"mid":"001yqGOu1ymWvI","name":"徐梦洁","title":"徐梦洁","type":1,"uin":0,"pmid":""}],"album":{"mid":"001bDucW2jXUc4","name":"花香","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000001bDucW2jXUc4_1.jpg%3Fmax_age%3D2592000","year":"2021-11-22"},"duration":"03:59","year":"2021-11-22","vid":"","path":"/api/url/song?platform=1&mid=002azdxu1orJa0&id=333318124&quality=1"},{"id":307332919,"mid":"002IdsKB1F0YX1","title":"少年时代","singer":[{"id":4553007,"mid":"0039JTTG0s4SCv","name":"时代少年团","title":"时代少年团","type":2,"uin":0,"pmid":""}],"album":{"mid":"000io1950KoJSv","name":"舞象之年","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000io1950KoJSv_1.jpg%3Fmax_age%3D2592000","year":"2021-07-18"},"duration":"04:42","year":"2021-07-18","vid":"","path":"/api/url/song?platform=1&mid=002IdsKB1F0YX1&id=307332919&quality=1"},{"id":102896302,"mid":"003JZU0r2p15ta","title":"Love Love","singer":[{"id":164157,"mid":"002gC7Yc0KoAJ2","name":"金润吉","title":"金润吉","type":0,"uin":0,"pmid":""}],"album":{"mid":"002krpkf1Mt3mu","name":"慢慢走，欣赏啊","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002krpkf1Mt3mu_1.jpg%3Fmax_age%3D2592000","year":"2015-07-17"},"duration":"02:57","year":"2015-07-17","vid":"o0025az57w2","path":"/api/url/song?platform=1&mid=003JZU0r2p15ta&id=102896302&quality=1"},{"id":333032084,"mid":"0025QQQ83VlFPP","title":"醺","singer":[{"id":183154,"mid":"003cdx43143O7n","name":"柏凝","title":"柏凝","type":0,"uin":0,"pmid":""}],"album":{"mid":"003P6P9J0X5NB6","name":"醺","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003P6P9J0X5NB6_2.jpg%3Fmax_age%3D2592000","year":"2021-11-20"},"duration":"02:25","year":"2021-11-20","vid":"","path":"/api/url/song?platform=1&mid=0025QQQ83VlFPP&id=333032084&quality=1"},{"id":214702782,"mid":"003hzeOV0LsPyx","title":"像我这样的人 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""},{"id":2213464,"mid":"0019IoYw3N98Nw","name":"徐航","title":"徐航","type":0,"uin":0,"pmid":""}],"album":{"mid":"003EiPHr1D6oc2","name":"嗨，唱起来 第12期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003EiPHr1D6oc2_1.jpg%3Fmax_age%3D2592000","year":"2018-07-13"},"duration":"02:51","year":"2018-07-13","vid":"","path":"/api/url/song?platform=1&mid=003hzeOV0LsPyx&id=214702782&quality=1"},{"id":286838574,"mid":"002UKWPs2VIRLI","title":"只有我一个人觉得？","singer":[{"id":4553007,"mid":"0039JTTG0s4SCv","name":"时代少年团","title":"时代少年团","type":2,"uin":0,"pmid":""}],"album":{"mid":"000io1950KoJSv","name":"舞象之年","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000io1950KoJSv_1.jpg%3Fmax_age%3D2592000","year":"2021-07-18"},"duration":"03:27","year":"2021-07-18","vid":"i00357clddj","path":"/api/url/song?platform=1&mid=002UKWPs2VIRLI&id=286838574&quality=1"},{"id":4830342,"mid":"001OyHbk2MSIi4","title":"十年","singer":[{"id":143,"mid":"003Nz2So3XXYek","name":"陈奕迅","title":"陈奕迅","type":0,"uin":0,"pmid":""}],"album":{"mid":"000GDz8k03UOaI","name":"黑白灰","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000GDz8k03UOaI_1.jpg%3Fmax_age%3D2592000","year":"2003-04-15"},"duration":"03:25","year":"2003-04-15","vid":"u00138j4hcs","path":"/api/url/song?platform=1&mid=001OyHbk2MSIi4&id=4830342&quality=1"},{"id":231911712,"mid":"002EKRp30g50rs","title":"呓语 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"004RZwia4aBTHJ","name":"我是唱作人 第4期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000004RZwia4aBTHJ_1.jpg%3Fmax_age%3D2592000","year":"2019-05-03"},"duration":"04:55","year":"2019-05-03","vid":"w0030g9pqxi","path":"/api/url/song?platform=1&mid=002EKRp30g50rs&id=231911712&quality=1"},{"id":333492084,"mid":"000hvgXt2pjuqu","title":"리무진 (Feat. MINO) (Prod. GRAY) (Limousine)","singer":[{"id":4712068,"mid":"004KSCka1NfPiP","name":"BE′O (비오)","title":"BE′O (비오)","type":0,"uin":0,"pmid":""},{"id":183200,"mid":"000FWvLC2alyWL","name":"宋旻浩","title":"宋旻浩 (MINO)","type":0,"uin":0,"pmid":""}],"album":{"mid":"0036HZv21rAA8T","name":"쇼미더머니 10 Episode 3 (Show Me The Money 10 Episode 3)","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000036HZv21rAA8T_1.jpg%3Fmax_age%3D2592000","year":"2021-11-20"},"duration":"03:40","year":"2021-11-20","vid":"g00416516x5","path":"/api/url/song?platform=1&mid=000hvgXt2pjuqu&id=333492084&quality=1"},{"id":333494805,"mid":"002DuWey1nhOQE","title":"春日之花","singer":[{"id":3791374,"mid":"003OYnZ81g7rGR","name":"等一下就回家","title":"等一下就回家","type":0,"uin":0,"pmid":""}],"album":{"mid":"003uO2j0104BXq","name":"春日之花","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003uO2j0104BXq_1.jpg%3Fmax_age%3D2592000","year":"2021-11-22"},"duration":"02:11","year":"2021-11-22","vid":"","path":"/api/url/song?platform=1&mid=002DuWey1nhOQE&id=333494805&quality=1"},{"id":331914756,"mid":"001uTC4A3i9hH5","title":"后来的风","singer":[{"id":9030108,"mid":"004OGjlR31ks1e","name":"陆三三","title":"陆三三","type":1,"uin":0,"pmid":""}],"album":{"mid":"0034rRlc0uS0Lc","name":"后来的风","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000034rRlc0uS0Lc_2.jpg%3Fmax_age%3D2592000","year":"2021-11-08"},"duration":"03:09","year":"2021-11-08","vid":"","path":"/api/url/song?platform=1&mid=001uTC4A3i9hH5&id=331914756&quality=1"},{"id":274684296,"mid":"003XqvzC0DhoQF","title":"姐姐真漂亮","singer":[{"id":4553007,"mid":"0039JTTG0s4SCv","name":"时代少年团","title":"时代少年团","type":2,"uin":0,"pmid":""}],"album":{"mid":"000io1950KoJSv","name":"舞象之年","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000io1950KoJSv_1.jpg%3Fmax_age%3D2592000","year":"2021-07-18"},"duration":"03:16","year":"2021-07-18","vid":"z0034zamxma","path":"/api/url/song?platform=1&mid=003XqvzC0DhoQF&id=274684296&quality=1"}]}')
        value.httpInfo = {statusCode: 200, headers: {}};
        return page && value;
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
     * 获取歌曲播放地址列表
     *
     * @param {string | number} id      歌曲id
     * @param {string} mid              歌曲mid
     * @param {number} quality          音质等级, [1, 3]
     * @return {Promise<string | null>} 异步Promise对象
     */
    async getSongUrl(id, mid, quality) {
        return id && mid && quality ? '' : null;
    },

    /**
     * 获取MV播放地址列表
     *
     * @param {string} vid              mv vid
     * @param {number} quality          画质等级, [1, 4]
     * @return {Promise<string | null>} 异步Promise对象
     */
    async getMvUrl(vid, quality) {
        return vid && quality ? '' : null;
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