/**
 * 打开模态框时所需的配置选项
 */
import {IncomingHttpHeaders} from "http";

export type ModalOpenOption = {
    /** URL地址 */
    url: string;
    /** 重定向后的首页地址 */
    indexURL: string;
    /** 模态框宽度 */
    width: number;
    /** 模态框高度 */
    height: number;
    /** 模态框预加载js文件名 */
    preloadName: string;
};

/**
 * 窗口状态监听器
 */
export type WindowStateListener = (event: Electron.IpcRendererEvent, isMaximize: boolean) => void;

/**
 * 歌手信息
 */
export type Singer = {
    /** 歌手id */
    id?: string | number;
    /** 歌手mid */
    mid?: string | number;
    /** 歌手名称 */
    name?: string;
    /** 歌手封面图片 URI */
    cover?: string;
    /** 歌手介绍 */
    introduce?: string;
    /** 歌手包含的歌曲数量 */
    songCount?: number;
    /** 歌手包含的专辑数量 */
    albumCount?: number;
    /** 歌手包含的MV数量 */
    mvCount?: number;
    /** 歌手关注(粉丝)量 */
    fansCount?: number;
    /** 歌手其他名称 */
    otherName?: string;
    /** 歌手拼音 */
    spell?: string;
}

/**
 * 专辑信息
 */
export type Album = {
    /** 专辑id */
    id?: string | number;
    /** 专辑mid */
    mid?: string | number;
    /** 专辑名称 */
    name?: string;
    /** 所属歌手 */
    singer?: string | Singer;
    /** 专辑封面图片 URI */
    cover?: string;
    /** 专辑介绍 */
    introduce?: string;
    /** 专辑包含的歌曲数量 */
    songCount?: number;
    /** 专辑发布年份 */
    year?: string;
    /**  所属流派 */
    genre?: string;
    /**  语种 */
    language?: string;
    /**  唱片公司 */
    company?: string;
}

/**
 * 歌曲信息
 */
export type Song = {
    /** 歌曲id */
    id?: string | number;
    /** 歌曲mid */
    mid?: string | number;
    /** 歌曲mv id */
    vid?: string | number;
    /** 歌曲标题 */
    title?: string;
    /** 歌手信息 */
    singer?: string | Singer | Singer[];
    /** 专辑信息 */
    album?: string | Album | null;
    /** 播放时长 */
    duration?: string;
    /** 歌曲年份 */
    year?: string;
    /** 文件路径 */
    path?: string;
    /** 音频格式 */
    format?: string;
    /** 文件大小(如: 3.59MB) */
    size?: string;
    /** 音质等级 */
    quality?: number;
}

/**
 * mv信息
 */
export type Mv = {
    /** mv id */
    id?: string | number;
    /** mv vid */
    vid?: string | number;
    /** mv标题 */
    title?: string;
    /** 歌手信息 */
    singer?: string | Singer | Singer[];
    /** mv封面图 */
    cover?: string;
    /** 播放时长 */
    duration?: string;
    /** 文件路径 */
    path?: string;
    /** 视频格式 */
    format?: string;
    /** 发布年份 */
    year?: string;
    /** 播放量 */
    playCount?: number;
    /** 文件大小(如: 3.59MB) */
    size?: string;
    /** 画质等级 */
    quality?: number;
}

/**
 * 歌词行数据
 */
export type LyricLine = {
    /** 歌词开始时间(单位: 秒) */
    start: number;
    /** 歌词开始时间(单位: 秒) */
    end: number;
    /** 歌词内容 */
    content: string;
};

/**
 * 分页信息
 */
export type Page = {
    /** 当前页 */
    current: number;
    /** 每页数据量大小 */
    size: number;
    /** 数据总量 */
    total?: number;
    /** 总页数 */
    pageCount?: number;
}

/**
 * 已计算的分页信息
 */
export type ComputedPage = {
    /** 数据总量 */
    total: number;
    /** 总页数 */
    pageCount: number;
} & Page;

/**
 * 标签信息
 */
export type Tag = {
    /**  分类标签id */
    id?: string;
    /** 分类标签名 */
    name?: string;

    /** 额外的信息 */
    [key: string]: any;
}

/**
 * 标签组信息
 */
export type SingerTags = {
    /** 歌手检索字母分类标签 */
    en: Tag[];
    /** 歌手所属区域分类标签 */
    area: Tag[];
    /** 歌手性别分类标签 */
    sex: Tag[];
    /** 歌手所属流派分类标签 */
    genre: Tag[];
}

/**
 * 歌手分类标签作为参数信息
 */
export type SingerTagsParam = { [key in keyof SingerTags]: string };

/**
 * 歌单分类标签
 */
export type SpecialTags = {
    /** 歌单分类(标签组)标题 */
    title: string;
    /** 歌单子分类标签列表 */
    items: Tag[];
}

/**
 * 歌单信息
 */
export type Special = {
    /** 歌单mid */
    mid?: string;
    /** 歌单名称 */
    name?: string;
    /** 歌单id */
    id?: string | number;
    /** 歌单封面URL */
    cover?: string;
    /** 歌单简介 */
    introduce?: string;
    /** 歌单创建者 */
    creator?: string;
    /** 用户id */
    userId?: string;
}

/**
 * mv分类标签信息
 */
export type MvTags = {
    /** 区域分类标签 */
    area: Tag[];
    /** 版本分类标签 */
    version: Tag[];
}

/** 获取mv列表时的分类标签参数信息 */
export type MvTagsParam = { [key in keyof MvTags]: string };

/**
 * 音乐排行榜子分类列表项
 */
export type RankItem = {
    /** 分类id */
    id: string;
    /** 排行榜名称 */
    name: string;
    /** 排行榜图标URL */
    cover?: string;
}

/**
 * 音乐排行榜分类信息
 */
export type Rank = {
    /** 榜单分组id */
    id: string;
    /** 榜单分组标题 */
    title: string;
    /** 榜单子分类列表 */
    items: RankItem[];
}

/**
 * 登录用户信息
 */
export type User = {
    /* 登录用户账号 */
    uin: string | number;
    /* 用户昵称 */
    nickName: string;
    /* 用户头像URI */
    headURI: string;
    /* 是否是vip */
    vip: boolean;
    /* vip等级 */
    level: number;
    /* vip等级图标 */
    levelIconURI: string;
    /* 开通vip的时间 */
    startTime: string;
    /* vip到期时间 */
    endTime: string;
    /* 是否自动续费 */
    autoPay: boolean;

    /* 额外的信息 */
    [key: string]: any;
}

/**
 * HTTP状态码和响应头信息
 */
export type HttpInfo = {
    /** HTTP状态码 */
    statusCode: number;
    /** HTTP响应头 */
    headers: IncomingHttpHeaders;
}

/**
 *  HTTP基础响应信息
 */
export type HttpBaseResponse = {
    /** HTTP状态信息 */
    httpInfo?: HttpInfo;
    /** 分页信息 */
    page?: Page;

    /** 额外的信息 */
    [key: string]: any;
}

/**
 * 歌手列表模块数据
 */
export type SingerListModuleData = {
    /** 歌手分类标签 */
    tags: SingerTags | null;
    /** 歌手列表 */
    list: Singer[];
    /** 分页信息 */
    page: Page;
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌手歌曲模块数据
 */
export type SingerSongModuleData = {
    /** 分页信息 */
    page: Page;
    /** 歌手信息 */
    singer: Singer | null;
    /** 歌曲列表 */
    list: Song[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌手专辑模块数据
 */
export type SingerAlbumModuleData = {
    /** 分页信息 */
    page: Page;
    /** 专辑列表 */
    list: Album[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

export type AlbumSongModuleData = {
    /** 分页信息 */
    page: Page;
    /** 专辑信息 */
    album: Album;
    /** 专辑歌曲列表 */
    list: Song[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌手Mv模块数据
 */
export type SingerMvModuleData = {
    /** 分页信息 */
    page: Page;
    /** 歌手Mv列表 */
    list: Mv[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌单列表模块数据
 */
export type SpecialListModuleData = {
    /** 分页信息 */
    page: Page;
    /** 歌单分类标签 */
    tags: SpecialTags[] | null;
    /** 歌单列表 */
    list: Special[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌单歌曲模块数据
 */
export type SpecialSongModuleData = {
    /** 分页信息 */
    page: Page;
    /** 歌单信息 */
    special: Special;
    /** 歌单歌曲列表 */
    list: Song[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * Mv列表模块数据
 */
export type MvListModuleData = {
    /** 分页信息 */
    page: Page;
    /** Mv分类标签模块 */
    tags: MvTags;
    /** mv列表 */
    list: Mv[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 排行榜(音乐榜单)模块数据
 */
export type RankModuleData = {
    /** 分页信息 */
    page: Page;
    /** 榜单列表 */
    rankList: Rank[] | null;
    /** 歌曲列表 */
    list: Song[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌手搜索模块数据
 */
export type SingerSearchModuleData = {
    /** 歌手列表 */
    list: Singer[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌曲搜索模块数据
 */
export type SongSearchModuleData = {
    /** 分页信息 */
    page: Page;
    /** 歌曲列表 */
    list: [];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 专辑搜索模块数据
 */
export type AlbumSearchModuleData = {
    /** 分页信息 */
    page: Page;
    /** 专辑列表 */
    list: Album[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * Mv搜索模块数据
 */
export type MvSearchModuleData = {
    /** 分页信息 */
    page: Page;
    /** Mv列表 */
    list: Mv[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 歌单搜素模块数据
 */
export type SpecialSearchModuleData = {
    /** 分页信息 */
    page: Page;
    /** 歌单列表 */
    list: Special[];
    /** HTTP状态信息 */
    httpInfo: HttpInfo;
}

/**
 * 登录模块数据
 */
export type LoginModuleData = {
    /** HTTP状态信息 */
    httpInfo: HttpInfo;

    /** 登录配置信息 */
    option?: ModalOpenOption;

    /** 获取登录用户信息 */
    user?: User | null;
    /** 错误原因 */
    reason?: string | null;
}


/**
 * 音乐数据源接口
 */
export interface DataSource {
    /** 数据源id */
    id: number;

    /**
     * 获取歌手列表信息集合
     *
     * @param tag 歌手分类标签对象
     * @param page 分页对象
     * @return {Promise<SingerListModuleData>} 异步Promise对象
     */
    singerList(tag: SingerTagsParam | null, page: Page): Promise<SingerListModuleData>;

    /**
     * 获取歌手的歌曲列表
     *
     * @param singer 歌手信息
     * @param page 分页对象
     * @return {Promise<SingerSongModuleData>} 异步Promise对象
     */
    singerSongList(singer: Singer, page: Page): Promise<SingerSongModuleData>;

    /**
     * 获取歌手的专辑列表
     *
     * @param singer 歌手信息
     * @param page 分页对象
     * @return {Promise<SingerAlbumModuleData>} 异步Promise对象
     */
    singerAlbumList(singer: Singer, page: Page): Promise<SingerAlbumModuleData>;

    /**
     * 获取专辑的歌曲列表
     *
     * @param album 专辑信息对象
     * @param page 分页信息对象
     * @return {Promise<AlbumSongModuleData>} 异步Promise对象
     */
    albumSongList(album: Album, page: Page): Promise<AlbumSongModuleData>;

    /**
     * 获取歌手的MV列表
     *
     * @param singer 歌手信息,不能为null
     * @param page 分页对象,不能为null
     * @return {Promise<SingerMvModuleData>} 异步Promise对象
     */
    singerMvList(singer: Singer, page: Page): Promise<SingerMvModuleData>;

    /**
     * 获取歌单列表
     *
     * @param tag 歌单分类标签信息
     * @param page 分页对象
     * @return {Promise<SpecialListModuleData>} 异步Promise对象
     */
    specialList(tag: Tag | null, page: Page): Promise<SpecialListModuleData>;

    /**
     * 获取歌单包含的歌曲列表
     *
     * @param special 歌单信息
     * @param page 分页对象
     * @return {Promise<SpecialSongModuleData>} 异步Promise对象
     */
    specialSongList(special: Special, page: Page): Promise<SpecialSongModuleData>;

    /**
     * 获取指定MV分类下的MV列表
     *
     * @param tag MV分类标签信息
     * @param page 分页对象
     * @return {Promise<MvListModuleData>} 异步Promise对象
     */
    mvList(tag: MvTagsParam | null, page: Page): Promise<MvListModuleData>;

    /**
     * 获取指定榜单项包含的音乐列表
     *
     * @param item 榜单项
     * @param page 分页对象
     * @return {Promise<RankModuleData>} 异步Promise对象
     */
    rankSongList(item: RankItem | null, page: Page): Promise<RankModuleData>;

    /**
     * 搜索歌手
     *
     * @param keyword 歌手名关键词
     * @return {Promise<SingerSearchModuleData>} 异步Promise对象
     */
    singerSearch(keyword: string): Promise<SingerSearchModuleData>;

    /**
     * 搜索歌曲, 这个搜索关键词可以是歌曲名、歌手名、专辑名
     *
     * @param keyword 搜索关键词(也可以是拼音)
     * @param page 分页对象
     * @return {Promise<SongSearchModuleData>} 异步Promise对象
     */
    songSearch(keyword: string, page: Page): Promise<SongSearchModuleData>;

    /**
     * 搜索专辑, 这个搜索关键词可以是歌曲名、歌手名、专辑名
     *
     * @param keyword 搜索关键词(也可以是拼音)
     * @param page 分页对象
     * @return {Promise<AlbumSearchModuleData>} 异步Promise对象
     */
    albumSearch(keyword: string, page: Page): Promise<AlbumSearchModuleData>;

    /**
     * 搜索MV,这个搜索关键词可以是歌曲名、歌手名、专辑名
     *
     * @param keyword 搜索关键词(也可以是拼音)
     * @param page 分页对象
     * @return {Promise<MvSearchModuleData>} 异步Promise对象
     */
    mvSearch(keyword: string, page: Page): Promise<MvSearchModuleData>;

    /**
     * 根据关键词搜索歌单, 以获得歌单列表
     *
     * @param keyword 搜索关键词(也可以是拼音)
     * @param page 分页对象
     * @return {Promise<SpecialSearchModuleData>} 歌单信息列表集合
     */
    specialSearch(keyword: string, page: Page): Promise<SpecialSearchModuleData>;

    /**
     * 获取歌曲播放地址
     *
     * @param id 歌曲id
     * @param mid 歌曲mid
     * @param quality 音质等级, [1, 3]
     * @return {Promise<string | null>} 异步Promise对象
     */
    getSongUrl(id: string | number, mid: string, quality: number): Promise<string | null>;

    /**
     * 获取MV播放地址
     *
     * @param vid mv vid
     * @param quality 画质等级, [1, 4]
     * @return {Promise<string | null>} 异步Promise对象
     */
    getMvUrl(vid: string, quality: number): Promise<string | null>;

    /**
     * 获取歌曲歌词
     *
     * @param song 歌曲信息
     * @return {Promise<LyricLine[]>} 异步Promise对象
     */
    getLyric(song: Song): Promise<LyricLine[]>;

    /**
     * 通过歌曲信息, 获取歌手写真URL列表
     *
     * @param song 歌曲信息
     * @return {Promise<string[]>} 异步Promise对象
     */
    getSingerCovers(song: Song): Promise<string[]>;

    /**
     * 获取热搜词列表
     * @return {Promise<string[]>} 异步Promise对象
     */
    getHotKeys(): Promise<string[]>;

    /**
     * 开始登录, 并获取用户基本信息
     *
     * 注意: {@param cookies} 参数至少需要包含一个cookie信息,否则认为获取登录配置选项
     *
     * @param cookies cookie信息
     * @return {Promise<LoginModuleData>} 异步Promise对象
     */
    login(cookies: Electron.Cookie[] | null): Promise<LoginModuleData>;

    /**
     * 退出登录
     *
     * @return {Promise<{ cookieURL: string, httpInfo: HttpInfo }>} 异步Promise对象
     */
    logout(): Promise<{ cookieURL: string, httpInfo: HttpInfo }>;

}