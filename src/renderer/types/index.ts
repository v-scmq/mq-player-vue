export type SongQuality =
  | 0 // 未设定
  | 1 // 普通品质
  | 2 // 高品质
  | 4; // 无损品质

export type MvQuality =
  | 0 // 未设定
  | 1 // 标清
  | 2 // 高清
  | 4 // 超清
  | 8; // 蓝光

/** 用户信息 */
export type User = {
  /* 登录用户账号 */
  id: string | number;
  /* 用户昵称 */
  nickName: string;
  /* 用户头像URI */
  avatar: string;
  /* 是否是vip */
  vip: boolean;
  /* vip等级 */
  level: number;
  /* vip等级图标 */
  levelIcon: string;
  /* 开通vip的时间 */
  startTime: string;
  /* vip到期时间 */
  endTime: string;
  /* 是否自动续费 */
  autoPay: boolean;

  /* 额外的信息 */
  [key: string]: any;
};

/** 歌手信息 */
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
  /** 所属平台id */
  platform?: number;
};

/** 专辑信息 */
export type Album = {
  /** 专辑id */
  id?: string | number;
  /** 专辑mid */
  mid?: string | number;
  /** 专辑名称 */
  name?: string;
  /** 所属歌手 */
  singer?: Singer[];
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
  /** 所属平台id */
  platform?: number;
};

/** 歌曲信息 */
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
  singer?: Singer[];
  /** 歌手名称 */
  singerName?: string;
  /** 专辑信息 */
  album?: Album;
  /** 播放时长 */
  duration?: string;
  /** 歌曲年份 */
  year?: string | number;
  /** 文件路径 */
  path?: string;
  /** 歌曲专辑封面 */
  cover?: string;
  /** 音频格式 */
  format?: string;
  /** 文件大小(如: 3.59MB) */
  size?: string;
  /** 音质 */
  quality?: SongQuality;
  /** vip 标识 */
  vip?: boolean;
  /** 付费专辑 标识 */
  payAlbum?: boolean;
  /** 所属平台id */
  platform?: number;
};

/** MV信息 */
export type Mv = {
  /** mv id */
  id?: string | number;
  /** mv vid */
  vid?: string | number;
  /** mv标题 */
  title?: string;
  /** 歌手信息 */
  singer?: string | Singer | Singer[];
  singerName?: string;
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
  /** 画质 */
  quality?: MvQuality;
  /** 所属平台id */
  platform?: number;
};

/** 歌单信息 */
export type Special = {
  /** 歌单id */
  id?: string | number;
  /** 歌单mid */
  mid?: string | number;
  /** 歌单名称 */
  name?: string;
  /** 歌单封面URL */
  cover?: string;
  /** 歌单简介 */
  introduce?: string;
  /** 歌单创建者 */
  creator?: string;
  /** 用户id */
  userId?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 1:所有人可见; 2:仅自己可见 */
  visible?: number | string;
  /** 所属平台id */
  platform?: number;
};

/** 歌词行数据 */
export type LyricLine = {
  /** 歌词开始时间(单位: 秒) */
  start: number;
  /** 歌词开始时间(单位: 秒) */
  end: number;
  /** 歌词内容 */
  content: string;
  /** 歌词翻译 */
  translation?: string;
};

/** 分页信息 */
export type Page = {
  /** 当前页 */
  current: number;
  /** 每页数据量大小 */
  size: number;
  /** 数据总量 */
  total?: number;
  /** 总页数 */
  pageCount?: number;
};

/** 已计算的分页信息 */
export type ComputedPage = Page & {
  /** 数据总量 */
  total: number;
  /** 总页数 */
  pageCount: number;
};

/** 标签信息 */
export type Tag = {
  /**  分类标签id */
  id?: string;
  /** 分类标签名 */
  name?: string;

  /** 额外的信息 */
  [key: string]: any;
};

/** 歌手分类标签 */
export type SingerTags = Tag[][];

/** MV分类标签信息 */
export type MvTags = Tag[][];

/** 歌单分类标签 */
export type SpecialTags = {
  /** 歌单分类(标签组)标题 */
  title: string;
  /** 歌单子分类标签列表 */
  items: Tag[];
}[];

/** 音乐排行榜子分类列表项 */
export type RankItem = {
  /** 分类id */
  id: string;
  /** 排行榜名称 */
  name: string;
  /** 排行榜图标URL */
  cover?: string;
};

/** 音乐排行榜分类信息 */
export type Rank = {
  /** 榜单分组id */
  id: string;
  /** 榜单分组标题 */
  title: string;
  /** 榜单子分类列表 */
  items: RankItem[];
};

export type DownloadItem = /*Electron.CreateInterruptedDownloadOptions &*/ {
  /******************* Electron.CreateInterruptedDownloadOptions *******************/
  /** 下载存储路径 */
  path: string;
  /** 整个下载资源URL的所有链(例如:重定向) */
  urlChain: string[];
  /** 资源MIME类型 */
  mimeType?: string;
  /** 已传输完成的字节偏移量 */
  offset: number;
  /** 资源总字节大小 */
  length: number;
  /** 上一次修改时间 */
  lastModified?: string;
  eTag?: string;
  /** 开始时间 */
  startTime?: number;
  /******************* Electron.CreateInterruptedDownloadOptions *******************/

  /** 下载任务id */
  id?: string;
  /** 文件名(含扩展名, 虽然可以从path属性中提取,但仍然定义出来) */
  name?: string;

  /** 状态 */
  state: 'progressing' | 'interrupted' | 'completed' | 'cancelled';

  /** 下载速率(若是number表示单位：字节/秒; 若是string表示单位为格式化后的速率)  */
  speed?: number | string;
  /** 已传输完成的百分比(已扩大100倍) */
  percent?: number;
  /** 已传输完成的大小(已格式化的文件大小) */
  received?: string;
  /** 资源总大小(经过格式化后的大小,如:5.6MB) */
  size?: string;
};

export type SetDownloadItem = Partial<Electron.CreateInterruptedDownloadOptions> & {
  path: string;
  type: 'create' | 'cancel' | 'pause' | 'resume';
};
