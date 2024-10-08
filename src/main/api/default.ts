import { DataSource } from '@/types';
import { readLyric } from '@/utils';

const platform = 0;

/** 默认的数据源API实现 */
export const DefaultSource: DataSource = {
  platform,

  async singerList(tag, page) {
    const list = [];
    for (let index = 1; index < 201; ++index) {
      list.push({
        mid: `mid-${index}`,
        name: `-singer-${index}-name`,
        cover: 'icon/default_cover.jpg',
        platform
      });
    }
    return {
      tags: {
        en: [
          { id: '0', name: '全部' },
          { id: '1', name: 'A' }
        ],
        sex: [
          { id: '0', name: '全部' },
          { id: '1', name: '男' },
          { id: '2', name: '女' }
        ],
        area: [{ id: '0', name: '全部' }],
        genre: [{ id: '0', name: '全部' }]
      },
      page,
      list,
      httpInfo: { statusCode: 200, headers: {} }
    };
  },

  async singerSongList(singer, page) {
    return { singer, page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async singerAlbumList(singer, page) {
    return { page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async albumSongList(album, page) {
    return { album, page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async singerMvList(singer, page) {
    return { page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async specialList(tag, page) {
    return { tags: [], page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async specialSongList(special, page) {
    return { special, page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async mvList(tag, page) {
    return { tags: { area: [], version: [] }, page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async rankSongList(item, page) {
    const value = JSON.parse(
      '{"page":{"current":1,"size":30,"total":100,"pageCount":4},"rankList":[{"id":0,"title":"巅峰榜","items":[{"id":"62,2021-11-24","name":"飙升榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000L9yGG2zhiFG.jpg"},{"id":"26,2021_46","name":"热歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003d6Awd0O79Md.jpg"},{"id":"27,2021-11-24","name":"新歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002sTsl43q60hW.jpg"},{"id":"4,2021-11-24","name":"流行指数榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000004Khv0S1i1cPq.jpg"},{"id":"52,2021-11-24","name":"腾讯音乐人原创榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003SrMeN2HtmDn.jpg"},{"id":"67,2021-11-24","name":"听歌识曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M0000030t4eu3FwGIy.jpg"},{"id":"201,","name":"MV榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002qxsIw0mCGSv.jpg"}]},{"id":1,"title":"地区榜","items":[{"id":"5,2021_46","name":"内地榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000WfCE73AUhXZ.jpg"},{"id":"59,2021_46","name":"香港地区榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003bKeJx1gSIn9.jpg"},{"id":"61,2021_46","name":"台湾地区榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003UF8GU2pICqU.jpg"},{"id":"3,2021_46","name":"欧美榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003CZMHg4Mog72.jpg"},{"id":"16,2021_46","name":"韩国榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002uv0H81wmIXB.jpg"},{"id":"17,2021_46","name":"日本榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001xvJMp243t6s.jpg"}]},{"id":2,"title":"特色榜","items":[{"id":"28,2021_46","name":"网络歌曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000WZ7my1ff478.jpg"},{"id":"63,2021_46","name":"DJ舞曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000MYrTY2MqNas.jpg"},{"id":"74,2021_46","name":"Q音快手榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000004Yx8930iTmOZ.jpg"},{"id":"60,2021_46","name":"抖音排行榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M0000038CpZW2iO2x6.jpg"},{"id":"64,2021_46","name":"综艺新歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003vydae3MSR34.jpg"},{"id":"29,2021_46","name":"影视金曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001P8SpK14Gswy.jpg"},{"id":"65,2021_46","name":"国风热歌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002O5vk234k7oj.jpg"},{"id":"58,2021_46","name":"说唱榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003lAV6j0VHpL4.jpg"},{"id":"57,2021_46","name":"电音榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001TZI9b3U5VnR.jpg"},{"id":"72,2021_46","name":"动漫音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002hhjha2SFsdX.jpg"},{"id":"73,2021_46","name":"游戏音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001Bbccw4CMZvg.jpg"},{"id":"70,2021_46","name":"达人音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002MU7em0soydS.jpg"},{"id":"36,2021_46","name":"K歌金曲榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003A6kU047prvs.jpg"},{"id":"131,2021_45","name":"大学生音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003B8k7d0CC09j.jpg"}]},{"id":3,"title":"全球榜","items":[{"id":"108,2021_46","name":"美国公告牌榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001eb6wK4WQ1cK.jpg"},{"id":"123,2021_47","name":"美国热门音乐榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003lVJOC4ZEwJB.jpg"},{"id":"129,2021_47","name":"韩国Melon榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000003MOyy90PzGOf.jpg"},{"id":"107,2021_47","name":"英国UK榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000000jq6zE4XpzZz.jpg"},{"id":"105,2021_47","name":"日本公信榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002oWJFp2Qe83l.jpg"},{"id":"126,2021_47","name":"JOOX本地热播榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000001xrOIy0VGRQD.jpg"},{"id":"130,2021_47","name":"香港TVB劲歌金榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000004HR6dd43AwT3.jpg"},{"id":"127,2021_47","name":"台湾KKBOX榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M000002WGWoV3fsTub.jpg"},{"id":"128,2021_47","name":"YouTube音乐排行榜","cover":"/api/stream?uri=http%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT003R500x500M0000009h9jy2tAMLZ.jpg"}]}],"list":[{"id":332882761,"mid":"002n8WAV4KfuPM","title":"爱情神话","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"000jHzwj4O8iOP","name":"爱情神话","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000jHzwj4O8iOP_1.jpg%3Fmax_age%3D2592000","year":"2021-11-23"},"duration":"04:26","year":"2021-11-23","vid":"","path":"/api/url/song?platform=1&mid=002n8WAV4KfuPM&id=332882761&quality=1"},{"id":331839675,"mid":"003UkWuI0E8U0l","title":"孤勇者","singer":[{"id":143,"mid":"003Nz2So3XXYek","name":"陈奕迅","title":"陈奕迅","type":0,"uin":0,"pmid":""}],"album":{"mid":"001uaPM93kxk1R","name":"孤勇者","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000001uaPM93kxk1R_3.jpg%3Fmax_age%3D2592000","year":"2021-11-08"},"duration":"04:16","year":"2021-11-08","vid":"y0041ywgpm7","path":"/api/url/song?platform=1&mid=003UkWuI0E8U0l&id=331839675&quality=1"},{"id":333430506,"mid":"001iCo0N30TafW","title":"选择 (Live)","singer":[{"id":596,"mid":"003xM8SD2WibJI","name":"林子祥","title":"林子祥","type":0,"uin":0,"pmid":""},{"id":24833,"mid":"002mze3U0NYXOM","name":"胡夏","title":"胡夏","type":0,"uin":0,"pmid":""}],"album":{"mid":"00158yZI3TQsPC","name":"中国梦之声·我们的歌第三季 第10期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M00000158yZI3TQsPC_2.jpg%3Fmax_age%3D2592000","year":"2021-11-21"},"duration":"04:27","year":"2021-11-21","vid":"s0041jbjx52","path":"/api/url/song?platform=1&mid=001iCo0N30TafW&id=333430506&quality=1"},{"id":203514624,"mid":"00375L600p9sxv","title":"像我这样的人 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"0001n7a82gh6IY","name":"明日之子 第8期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000001n7a82gh6IY_1.jpg%3Fmax_age%3D2592000","year":"2017-08-05"},"duration":"02:51","year":"2017-08-05","vid":"y0026hr4b5e","path":"/api/url/song?platform=1&mid=00375L600p9sxv&id=203514624&quality=1"},{"id":213224236,"mid":"000uhMwj387EBp","title":"牧马城市","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"001yHQzz2rm3lk","name":"老男孩 电视剧原声带","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000001yHQzz2rm3lk_1.jpg%3Fmax_age%3D2592000","year":"2018-03-29"},"duration":"04:18","year":"2018-03-29","vid":"k002671le5d","path":"/api/url/song?platform=1&mid=000uhMwj387EBp&id=213224236&quality=1"},{"id":102193483,"mid":"000NqZLy2lfXjT","title":"我们的歌","singer":[{"id":265,"mid":"001JDzPT3JdvqK","name":"王力宏","title":"王力宏","type":0,"uin":0,"pmid":""}],"album":{"mid":"002Zwh5p4HgecI","name":"改变自己","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002Zwh5p4HgecI_1.jpg%3Fmax_age%3D2592000","year":"2007-07-13"},"duration":"04:07","year":"2007-07-13","vid":"q0013x75hkk","path":"/api/url/song?platform=1&mid=000NqZLy2lfXjT&id=102193483&quality=1"},{"id":203451421,"mid":"003kLvu04bLGzi","title":"消愁 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"002xoonH2Bk7FR","name":"明日之子 第7期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002xoonH2Bk7FR_1.jpg%3Fmax_age%3D2592000","year":"2017-07-29"},"duration":"02:59","year":"2017-07-29","vid":"x00248tvbgv","path":"/api/url/song?platform=1&mid=003kLvu04bLGzi&id=203451421&quality=1"},{"id":331251776,"mid":"002Svoe23jftw0","title":"影子说","singer":[{"id":6144212,"mid":"001cw0Sr12ZLc4","name":"洛先生","title":"洛先生","type":0,"uin":0,"pmid":""}],"album":{"mid":"003pp4xV1Vztwu","name":"影子说","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003pp4xV1Vztwu_3.jpg%3Fmax_age%3D2592000","year":"2021-11-02"},"duration":"04:19","year":"2021-11-02","vid":"","path":"/api/url/song?platform=1&mid=002Svoe23jftw0&id=331251776&quality=1"},{"id":5089887,"mid":"004673lC2KA9z5","title":"相依为命","singer":[{"id":4284,"mid":"004DFS271osAwp","name":"陈小春","title":"陈小春","type":0,"uin":0,"pmid":""}],"album":{"mid":"003IJ0iE4AJ1xi","name":"陈小春金碟铁盒珍藏系列","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003IJ0iE4AJ1xi_1.jpg%3Fmax_age%3D2592000","year":"2008-09-25"},"duration":"03:57","year":"2008-09-25","vid":"h0012abhb4q","path":"/api/url/song?platform=1&mid=004673lC2KA9z5&id=5089887&quality=1"},{"id":280688800,"mid":"002BZinz35lH8D","title":"最后的莫西干人+谁能明白我","singer":[{"id":6777501,"mid":"003Oc68A4ZrUDn","name":"王小康","title":"王小康","type":0,"uin":0,"pmid":""}],"album":{"mid":"004QXvek0z5RUA","name":"最后的莫西干人+谁能明白我","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000004QXvek0z5RUA_1.jpg%3Fmax_age%3D2592000","year":"2020-10-21"},"duration":"03:21","year":"2020-10-21","vid":"","path":"/api/url/song?platform=1&mid=002BZinz35lH8D&id=280688800&quality=1"},{"id":331896479,"mid":"002LUKvT1NuNOm","title":"秒针 (Dj版)","singer":[{"id":4055289,"mid":"002ffRcI0XN8px","name":"阿梨粤","title":"阿梨粤","type":1,"uin":443824251,"pmid":""},{"id":9013795,"mid":"0014qOxU355jDk","name":"R7","title":"R7","type":0,"uin":0,"pmid":""}],"album":{"mid":"000Fzz1W4SHfqm","name":"秒针","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000Fzz1W4SHfqm_1.jpg%3Fmax_age%3D2592000","year":"2021-11-09"},"duration":"02:58","year":"2021-11-09","vid":"","path":"/api/url/song?platform=1&mid=002LUKvT1NuNOm&id=331896479&quality=1"},{"id":102066257,"mid":"002hXDfk0LX9KO","title":"听妈妈的话","singer":[{"id":4558,"mid":"0025NhlN2yWrP4","name":"周杰伦","title":"周杰伦","type":0,"uin":0,"pmid":""}],"album":{"mid":"002jLGWe16Tf1H","name":"依然范特西","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002jLGWe16Tf1H_1.jpg%3Fmax_age%3D2592000","year":"2006-09-05"},"duration":"04:25","year":"2006-09-05","vid":"u0012xltd8y","path":"/api/url/song?platform=1&mid=002hXDfk0LX9KO&id=102066257&quality=1"},{"id":7090,"mid":"001yZ7Tf0kudte","title":"爱，很简单","singer":[{"id":101,"mid":"002cK0F12szD9T","name":"陶喆","title":"陶喆","type":0,"uin":0,"pmid":""}],"album":{"mid":"003ROVwj4PqLPa","name":"陶喆同名专辑","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003ROVwj4PqLPa_1.jpg%3Fmax_age%3D2592000","year":"1997-12-06"},"duration":"04:29","year":"1997-12-06","vid":"x00111flj0l","path":"/api/url/song?platform=1&mid=001yZ7Tf0kudte&id=7090&quality=1"},{"id":332438548,"mid":"002Gd0jn1wU11x","title":"第51次原谅","singer":[{"id":6764673,"mid":"003nRjEX3diMiV","name":"刘艺雯","title":"刘艺雯","type":1,"uin":0,"pmid":""}],"album":{"mid":"004WSaGi331A99","name":"第51次原谅","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000004WSaGi331A99_1.jpg%3Fmax_age%3D2592000","year":"2021-11-13"},"duration":"03:59","year":"2021-11-13","vid":"","path":"/api/url/song?platform=1&mid=002Gd0jn1wU11x&id=332438548&quality=1"},{"id":320466101,"mid":"002ehZoP3KY9W8","title":"尾号6208","singer":[{"id":1264348,"mid":"001C8eOJ0f7yoq","name":"严浩翔","title":"严浩翔","type":0,"uin":0,"pmid":""}],"album":{"mid":"003Szv7f2resBD","name":"尾号6208","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003Szv7f2resBD_1.jpg%3Fmax_age%3D2592000","year":"2021-08-16"},"duration":"03:33","year":"2021-08-16","vid":"","path":"/api/url/song?platform=1&mid=002ehZoP3KY9W8&id=320466101&quality=1"},{"id":203705594,"mid":"002WLDmw0vkHtC","title":"借 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"002iBxBy3bAmCx","name":"明日之子 第11期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002iBxBy3bAmCx_1.jpg%3Fmax_age%3D2592000","year":"2017-08-26"},"duration":"03:34","year":"2017-08-26","vid":"p0024yo3a5g","path":"/api/url/song?platform=1&mid=002WLDmw0vkHtC&id=203705594&quality=1"},{"id":718475,"mid":"0027oMO61wWi55","title":"发如雪","singer":[{"id":4558,"mid":"0025NhlN2yWrP4","name":"周杰伦","title":"周杰伦","type":0,"uin":0,"pmid":""}],"album":{"mid":"0024bjiL2aocxT","name":"十一月的萧邦","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000024bjiL2aocxT_1.jpg%3Fmax_age%3D2592000","year":"2005-11-01"},"duration":"04:59","year":"2005-11-01","vid":"g0022gfiw3p","path":"/api/url/song?platform=1&mid=0027oMO61wWi55&id=718475&quality=1"},{"id":331850330,"mid":"002zQHGy0ao8TC","title":"探窗 (416女团热搜版)","singer":[{"id":5475574,"mid":"003EBdnp0sVReZ","name":"叶聪明","title":"叶聪明","type":1,"uin":0,"pmid":""},{"id":8413787,"mid":"003C2gNf1sHFHb","name":"ya妖精","title":"ya妖精","type":1,"uin":0,"pmid":""},{"id":4062736,"mid":"002zHaIr1Yqevs","name":"小淅儿","title":"小淅儿","type":1,"uin":994986865,"pmid":""},{"id":5173692,"mid":"000Sm8ZI1qbwgT","name":"边靖婷","title":"边靖婷","type":1,"uin":1143742236,"pmid":""},{"id":9149309,"mid":"002lowTs2jBD7c","name":"是可爱晨","title":"是可爱晨","type":1,"uin":0,"pmid":""},{"id":168296,"mid":"003W5e4R1SPbLY","name":"汐音社","title":"汐音社","type":2,"uin":0,"pmid":""}],"album":{"mid":"000hCOvC363Q6f","name":"探窗 (416女团热搜版)","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000hCOvC363Q6f_3.jpg%3Fmax_age%3D2592000","year":"2021-11-07"},"duration":"03:08","year":"2021-11-07","vid":"","path":"/api/url/song?platform=1&mid=002zQHGy0ao8TC&id=331850330&quality=1"},{"id":333318124,"mid":"002azdxu1orJa0","title":"花香","singer":[{"id":2141386,"mid":"001yqGOu1ymWvI","name":"徐梦洁","title":"徐梦洁","type":1,"uin":0,"pmid":""}],"album":{"mid":"001bDucW2jXUc4","name":"花香","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000001bDucW2jXUc4_1.jpg%3Fmax_age%3D2592000","year":"2021-11-22"},"duration":"03:59","year":"2021-11-22","vid":"","path":"/api/url/song?platform=1&mid=002azdxu1orJa0&id=333318124&quality=1"},{"id":307332919,"mid":"002IdsKB1F0YX1","title":"少年时代","singer":[{"id":4553007,"mid":"0039JTTG0s4SCv","name":"时代少年团","title":"时代少年团","type":2,"uin":0,"pmid":""}],"album":{"mid":"000io1950KoJSv","name":"舞象之年","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000io1950KoJSv_1.jpg%3Fmax_age%3D2592000","year":"2021-07-18"},"duration":"04:42","year":"2021-07-18","vid":"","path":"/api/url/song?platform=1&mid=002IdsKB1F0YX1&id=307332919&quality=1"},{"id":102896302,"mid":"003JZU0r2p15ta","title":"Love Love","singer":[{"id":164157,"mid":"002gC7Yc0KoAJ2","name":"金润吉","title":"金润吉","type":0,"uin":0,"pmid":""}],"album":{"mid":"002krpkf1Mt3mu","name":"慢慢走，欣赏啊","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000002krpkf1Mt3mu_1.jpg%3Fmax_age%3D2592000","year":"2015-07-17"},"duration":"02:57","year":"2015-07-17","vid":"o0025az57w2","path":"/api/url/song?platform=1&mid=003JZU0r2p15ta&id=102896302&quality=1"},{"id":333032084,"mid":"0025QQQ83VlFPP","title":"醺","singer":[{"id":183154,"mid":"003cdx43143O7n","name":"柏凝","title":"柏凝","type":0,"uin":0,"pmid":""}],"album":{"mid":"003P6P9J0X5NB6","name":"醺","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003P6P9J0X5NB6_2.jpg%3Fmax_age%3D2592000","year":"2021-11-20"},"duration":"02:25","year":"2021-11-20","vid":"","path":"/api/url/song?platform=1&mid=0025QQQ83VlFPP&id=333032084&quality=1"},{"id":214702782,"mid":"003hzeOV0LsPyx","title":"像我这样的人 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""},{"id":2213464,"mid":"0019IoYw3N98Nw","name":"徐航","title":"徐航","type":0,"uin":0,"pmid":""}],"album":{"mid":"003EiPHr1D6oc2","name":"嗨，唱起来 第12期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003EiPHr1D6oc2_1.jpg%3Fmax_age%3D2592000","year":"2018-07-13"},"duration":"02:51","year":"2018-07-13","vid":"","path":"/api/url/song?platform=1&mid=003hzeOV0LsPyx&id=214702782&quality=1"},{"id":286838574,"mid":"002UKWPs2VIRLI","title":"只有我一个人觉得？","singer":[{"id":4553007,"mid":"0039JTTG0s4SCv","name":"时代少年团","title":"时代少年团","type":2,"uin":0,"pmid":""}],"album":{"mid":"000io1950KoJSv","name":"舞象之年","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000io1950KoJSv_1.jpg%3Fmax_age%3D2592000","year":"2021-07-18"},"duration":"03:27","year":"2021-07-18","vid":"i00357clddj","path":"/api/url/song?platform=1&mid=002UKWPs2VIRLI&id=286838574&quality=1"},{"id":4830342,"mid":"001OyHbk2MSIi4","title":"十年","singer":[{"id":143,"mid":"003Nz2So3XXYek","name":"陈奕迅","title":"陈奕迅","type":0,"uin":0,"pmid":""}],"album":{"mid":"000GDz8k03UOaI","name":"黑白灰","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000GDz8k03UOaI_1.jpg%3Fmax_age%3D2592000","year":"2003-04-15"},"duration":"03:25","year":"2003-04-15","vid":"u00138j4hcs","path":"/api/url/song?platform=1&mid=001OyHbk2MSIi4&id=4830342&quality=1"},{"id":231911712,"mid":"002EKRp30g50rs","title":"呓语 (Live)","singer":[{"id":1507534,"mid":"001BHDR33FZVZ0","name":"毛不易","title":"毛不易","type":0,"uin":0,"pmid":""}],"album":{"mid":"004RZwia4aBTHJ","name":"我是唱作人 第4期","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000004RZwia4aBTHJ_1.jpg%3Fmax_age%3D2592000","year":"2019-05-03"},"duration":"04:55","year":"2019-05-03","vid":"w0030g9pqxi","path":"/api/url/song?platform=1&mid=002EKRp30g50rs&id=231911712&quality=1"},{"id":333492084,"mid":"000hvgXt2pjuqu","title":"리무진 (Feat. MINO) (Prod. GRAY) (Limousine)","singer":[{"id":4712068,"mid":"004KSCka1NfPiP","name":"BE′O (비오)","title":"BE′O (비오)","type":0,"uin":0,"pmid":""},{"id":183200,"mid":"000FWvLC2alyWL","name":"宋旻浩","title":"宋旻浩 (MINO)","type":0,"uin":0,"pmid":""}],"album":{"mid":"0036HZv21rAA8T","name":"쇼미더머니 10 Episode 3 (Show Me The Money 10 Episode 3)","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000036HZv21rAA8T_1.jpg%3Fmax_age%3D2592000","year":"2021-11-20"},"duration":"03:40","year":"2021-11-20","vid":"g00416516x5","path":"/api/url/song?platform=1&mid=000hvgXt2pjuqu&id=333492084&quality=1"},{"id":333494805,"mid":"002DuWey1nhOQE","title":"春日之花","singer":[{"id":3791374,"mid":"003OYnZ81g7rGR","name":"等一下就回家","title":"等一下就回家","type":0,"uin":0,"pmid":""}],"album":{"mid":"003uO2j0104BXq","name":"春日之花","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000003uO2j0104BXq_1.jpg%3Fmax_age%3D2592000","year":"2021-11-22"},"duration":"02:11","year":"2021-11-22","vid":"","path":"/api/url/song?platform=1&mid=002DuWey1nhOQE&id=333494805&quality=1"},{"id":331914756,"mid":"001uTC4A3i9hH5","title":"后来的风","singer":[{"id":9030108,"mid":"004OGjlR31ks1e","name":"陆三三","title":"陆三三","type":1,"uin":0,"pmid":""}],"album":{"mid":"0034rRlc0uS0Lc","name":"后来的风","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M0000034rRlc0uS0Lc_2.jpg%3Fmax_age%3D2592000","year":"2021-11-08"},"duration":"03:09","year":"2021-11-08","vid":"","path":"/api/url/song?platform=1&mid=001uTC4A3i9hH5&id=331914756&quality=1"},{"id":274684296,"mid":"003XqvzC0DhoQF","title":"姐姐真漂亮","singer":[{"id":4553007,"mid":"0039JTTG0s4SCv","name":"时代少年团","title":"时代少年团","type":2,"uin":0,"pmid":""}],"album":{"mid":"000io1950KoJSv","name":"舞象之年","cover":"/api/stream?uri=https%3A%2F%2Fy.gtimg.cn%2Fmusic%2Fphoto_new%2FT002R300x300M000000io1950KoJSv_1.jpg%3Fmax_age%3D2592000","year":"2021-07-18"},"duration":"03:16","year":"2021-07-18","vid":"z0034zamxma","path":"/api/url/song?platform=1&mid=003XqvzC0DhoQF&id=274684296&quality=1"}]}'
    );
    value.httpInfo = { statusCode: 200, headers: {} };
    return page && value;
  },

  async singerSearch(keyword) {
    return { list: [{ mid: '1S21239V', name: keyword, platform }], httpInfo: { statusCode: 200, headers: {} } };
  },

  async songSearch(keyword, page) {
    return { page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async albumSearch(keyword, page) {
    return { page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async mvSearch(keyword, page) {
    return { page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  async specialSearch(keyword, page) {
    return { page, list: [], httpInfo: { statusCode: 200, headers: {} } };
  },

  /**
   * 获取收藏的歌曲列表
   *
   * @param page 分页信息
   */
  async getLikeSongs(page) {
    return { page, list: [], httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 获取收藏的专辑列表
   *
   * @param page 分页信息
   */
  async getLikeAlbums(page) {
    return { page, list: [], httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 获取收藏的mv列表
   *
   * @param page 分页信息
   */
  async getLikeMvs(page) {
    return { page, list: [], httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 获取收藏的歌单列表
   *
   * @param page 分页信息
   */
  async getLikeSpecials(page) {
    return { page, list: [], httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 获取自建歌单(包含收藏歌曲的歌曲)
   */
  async getProfileSpecials() {
    return { list: [], httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 创建歌单(必须登录)
   *
   * @param special 歌单信息
   */
  async createSpecial(special) {
    return { state: false, message: '', httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 更新歌单信息
   *
   * @param special 歌单信息
   */
  async updateSpecial(special) {
    return { state: false, message: '', httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 移除自建歌单
   *
   * @param special 歌单信息
   */
  async removeSpecial(special) {
    return { state: false, message: '', httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 添加歌曲到歌单,当传入的歌单为null是默认指定为用户喜爱歌曲单
   *
   * @param songs 歌曲信息列表
   * @param special 歌单信息
   */
  async addSpecialSong(songs, special) {
    return { state: false, message: '', httpInfo: { statusCode: 403, headers: {} } };
  },

  /**
   * 从自建歌单中移除歌曲,当传入的歌单为null是默认指定为用户喜爱歌曲单
   *
   * @param songs 歌曲信息列表
   * @param special 歌单信息
   */
  async removeSpecialSong(songs, special) {
    return { state: false, message: '', httpInfo: { statusCode: 403, headers: {} } };
  },

  async getSongUrl(id, mid, quality) {
    return id && mid && quality ? '' : null;
  },

  async getMvUrl(vid, quality) {
    return vid && quality ? '' : null;
  },

  async getLyric(song) {
    if (!song.mid) {
      return [];
    }

    const lyric = `[ti:可惜没如果]\n[ar:林俊杰]\n[al:新地球]\n[by:]\n[offset:0]\n[00:00.00]可惜没如果 - 林俊杰 (JJ Lin)\n[00:01.55]词：林夕\n[00:03.10]曲：林俊杰\n[00:04.65]编曲：蔡政勋\n[00:06.20]制作人：许环良\n[00:07.75]吉他：Jamie Wilson\n[00:09.30]鼓：Brendan Buckley\n[00:10.85]贝斯：Kelly Wan\n[00:12.40]和声：林俊杰\n[00:13.95]和声编写：Billy Koh/林俊杰\n[00:15.51]配唱制作人：许环良\n[00:17.06]混音工程师：许环良\n[00:18.61]录音师：Billy Koh/李志清/Brendan Buckley/Shawn McGhee\n[00:20.16]录音室：THE JFJ LAB(Taipei)/Bloom Studio(Malaysia)/Hideout Studio(LV)\n[00:21.71]弦乐：周莹/周麓/印文竹/陈华超\n[00:23.26]混音室：Tweak Tone Labs(Beijing)\n[00:24.81]假如把犯得起的错\n[00:27.71]\n[00:28.59]能错的都错过\n[00:30.74]应该还来得及去悔过\n[00:34.76]\n[00:36.57]假如没把一切说破\n[00:39.78]\n[00:40.71]那一场小风波 将一笑带过\n[00:46.05]\n[00:47.27]在感情面前 讲什么自我\n[00:51.92]\n[00:52.75]要得过且过 才好过\n[00:58.05]\n[00:59.24]全都怪我\n[01:00.84]\n[01:01.83]不该沉默时沉默 该勇敢时软弱\n[01:07.78]如果不是我\n[01:10.76]误会自己洒脱 让我们难过\n[01:17.11]可当初的你 和现在的我\n[01:20.11]假如重来过\n[01:22.40]\n[01:23.09]倘若那天\n[01:24.65]\n[01:25.54]把该说的话好好说\n[01:28.74]该体谅的不执着\n[01:31.74]如果那天我\n[01:34.15]\n[01:34.77]不受情绪挑拨\n[01:37.75]你会怎么做\n[01:40.50]\n[01:41.09]那么多如果 可能如果我\n[01:44.16]可惜没如果 只剩下结果\n[01:49.93]\n[02:17.00]如果早点了解\n[02:19.72]那率性的你\n[02:22.06]\n[02:22.68]或者晚一点\n[02:24.90]\n[02:25.73]遇上成熟的我\n[02:28.72]不过 oh\n[02:32.32]全都怪我\n[02:34.72]不该沉默时沉默 该勇敢时软弱\n[02:40.72]如果不是我\n[02:43.82]误会自己洒脱 让我们难过\n[02:50.18]可当初的你 和现在的我\n[02:53.13]假如重来过\n[02:55.92]倘若那天\n[02:58.42]把该说的话好好说\n[03:01.67]该体谅的不执着\n[03:04.74]如果那天我\n[03:07.72]不受情绪挑拨\n[03:10.68]你会怎么做\n[03:14.03]那么多如果 可能如果我\n[03:17.13]可惜没如果 没有你和我\n[03:26.61]\n[03:32.70]都怪我\n[03:34.78]不该沉默时沉默 该勇敢时软弱\n[03:40.67]如果不是我\n[03:43.00]\n[03:43.68]误会自己洒脱 让我们难过\n[03:50.05]可当初的你 和现在的我\n[03:53.10]假如重来过\n[03:56.03]倘若那天\n[03:58.02]\n[03:58.61]把该说的话好好说\n[04:01.65]该体谅的不执着\n[04:04.83]如果那天我\n[04:07.69]不受情绪挑拨\n[04:10.71]你会怎么做\n[04:14.02]那么多如果 可能如果我\n[04:17.08]可惜没如果\n[04:20.67]\n[04:22.88]只剩下结果\n[04:28.15]\n[04:28.96]可惜没如果`;

    return readLyric(lyric, '');
  },

  async getSingerCovers(song) {
    return [song.path || ''];
  },

  async getHotKeys() {
    return [''];
  },

  async login(cookies) {
    if (cookies == null || cookies.length < 1) {
      // 访问受限
      return { user: null, reason: '不支持的操作！', httpInfo: { statusCode: 403, headers: {} } };
    }

    return {
      reason: '不支持的操作！',
      user: null,
      httpInfo: { statusCode: cookies ? 200 : 404, headers: {} }
    };
  },

  async logout() {
    // 访问受限
    return { cookieURL: '', httpInfo: { statusCode: 403, headers: {} } };
  }
};
