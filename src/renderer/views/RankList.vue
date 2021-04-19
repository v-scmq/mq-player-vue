<template>
  <div class='v-column'>
    <!--  在这里,这个按行排列的元素,必须设置在竖直方向上子元素填充整个父元素高度,且这个元素高度必须设定100%  -->
    <div class='v-row' style='align-items:stretch;height:100%;'>
      <Table :columns="columns" :data='list' style="flex:auto;" @row-dblclick="onCellClick"/>

      <accordion :list="tagType" @change='onRankChanged' style='flex:none'/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RankList',
  data: () => ({
    tagType: [],
    list: [],
    page: {current: 1, size: 30},
    area: 0,
    sex: null,
    en: null,
    columns: [
      {type: 'index', width: 100},
      {title: '歌曲', property: 'title'},
      {title: '歌手', property: 'singer.name', valueGetter: item => item.singer ? item.singer.name : null},
      {title: '专辑', property: 'album.name', valueGetter: item => item.album ? item.album.name : null},
      {title: '时长', property: 'duration', width: 100},
      {title: '大小', property: 'size', width: 100}
    ],
  }),
  async created() {

    console.info('rank-list.vue created ...')
    let data = '[{"name":"热门榜单","items":[{"name":"酷狗飙升榜","id":"6666"},{"name":"酷狗TOP500","id":"8888"},{"name":"网络红歌榜","id":"23784"},{"name":"酷狗雷达榜","id":"37361"},{"name":"华语新歌榜","id":"31308"},{"name":"酷狗分享榜","id":"21101"},{"name":"欧美新歌榜","id":"31310"},{"name":"DJ热歌榜","id":"24971"},{"name":"韩国新歌榜","id":"31311"},{"name":"日本新歌榜","id":"31312"},{"name":"国风新歌榜","id":"33161"},{"name":"粤语新歌榜","id":"31313"},{"name":"ACG新歌榜","id":"33162"},{"name":"综艺新歌榜","id":"46910"},{"name":"酷狗音乐人原创榜","id":"30972"},{"name":"5sing音乐榜","id":"22603"},{"name":"繁星音乐榜","id":"21335"}]},{"name":"特色音乐榜","items":[{"name":"电音热歌榜","id":"33160"},{"name":"影视金曲榜","id":"33163"},{"name":"酷狗说唱榜","id":"44412"},{"name":"粤语金曲榜","id":"33165"},{"name":"欧美金曲榜","id":"33166"},{"name":"小语种热歌榜","id":"36107"}]},{"name":"全球榜","items":[{"name":"美国BillBoard榜","id":"4681"},{"name":"英国单曲榜","id":"4680"},{"name":"日本公信榜","id":"4673"},{"name":"韩国Melon音乐榜","id":"38623"},{"name":"joox本地热歌榜","id":"42807"},{"name":"KKBOX风云榜","id":"42808"},{"name":"日本SPACE SHOWER榜","id":"46868"}]}]';
    data = JSON.parse(data);
    this.tagType = data;


    data = '[{"mid":"C552BE98FE9C1CC8CAC2CF4D36548C8A","vid":"36B7A0E7A42A5E2DD6B0EB7E9F15EAD3","format":"mp3","fileName":"金池 - 我陪你熬过了苦","year":"2020-06-15","duration":268355,"title":" 我陪你熬过了苦","singer":{"name":"金池 "},"album":{"mid":38037681,"name":"我陪你熬过了苦","cover":"http://imge.kugou.com/stdmusic/400/20200610/20200610153312883346.jpg"}},{"mid":"657A4A873A29DE8A16222488828AC129","vid":"","format":"mp3","fileName":"灼夭、戾格、小田音乐社 - 刺客","year":"2021-03-21","duration":194000,"title":" 刺客","singer":{"name":"灼夭、戾格、小田音乐社 "},"album":{"mid":42727613,"name":"刺客","cover":"http://imge.kugou.com/stdmusic/400/20210320/20210320112715102012.jpg"}},{"mid":"0FDCF4BFC05BAE2642BB04EE63D3FB1E","vid":"","format":"mp3","fileName":"王赫野 - 大风吹","year":"2021-03-11","duration":164000,"title":" 大风吹","singer":{"name":"王赫野 "},"album":{"mid":42382026,"name":"大风吹","cover":"http://imge.kugou.com/stdmusic/400/20210310/20210310150008717331.jpg"}},{"mid":"D699779349F155D3929DC56E89C07AC9","vid":"E82D8BBFBC8DA3529B10201CAC7F7243","format":"mp3","fileName":"南北组合(吉萍) - 明月夜","year":"2020-10-16","duration":237000,"title":" 明月夜","singer":{"name":"南北组合(吉萍) "},"album":{"mid":39595154,"name":"沉默是金(明月夜)","cover":"http://imge.kugou.com/stdmusic/400/20201016/20201016122102351644.jpg"}},{"mid":"8124C6AEE16E56BED9D0FED7AC3B6B26","vid":"A5C6B2F11CD6B2E8AB9006F2C9033B9B","format":"mp3","fileName":"马健涛 - 你是我唯一的执着","year":"2019-09-25","duration":232306,"title":" 你是我唯一的执着","singer":{"name":"马健涛 "},"album":{"mid":29137860,"name":"你是我唯一的执着","cover":"http://imge.kugou.com/stdmusic/400/20200927/20200927181304364003.jpg"}},{"mid":"605EE0833FFD1488EF87B5A71E2C9D79","vid":"","format":"mp3","fileName":"张鑫雨 - 爱难求情难断","year":"2020-08-27","duration":237000,"title":" 爱难求情难断","singer":{"name":"张鑫雨 "},"album":{"mid":39013065,"name":"爱难求情难断","cover":"http://imge.kugou.com/stdmusic/400/20210323/20210323172533960655.jpg"}},{"mid":"13F46083E098D57E50CE04300A3B8180","vid":"","format":"mp3","fileName":"等什么君 - 难渡","year":"2021-03-25","duration":161000,"title":" 难渡","singer":{"name":"等什么君 "},"album":{"mid":42921336,"name":"难渡","cover":"http://imge.kugou.com/stdmusic/400/20210324/20210324152254914948.jpg"}},{"mid":"19F31B2CEB41FF8EBA8BAB8D431CFC4F","vid":"","format":"mp3","fileName":"金池 - 谁不是","year":"2020-08-27","duration":242311,"title":" 谁不是","singer":{"name":"金池 "},"album":{"mid":39010476,"name":"谁不是","cover":"http://imge.kugou.com/stdmusic/400/20200826/20200826120007965816.jpg"}},{"mid":"0E18C0E1405168FA54738BC2397BBD98","vid":"9599A8849760EAF699E7850D84AA969A","format":"mp3","fileName":"张远 - 嘉宾","year":"2020-10-26","duration":333662,"title":" 嘉宾","singer":{"name":"张远 "},"album":{"mid":39699796,"name":"嘉宾","cover":"http://imge.kugou.com/stdmusic/400/20210315/20210315174418762108.jpg"}},{"mid":"69D2CEBD955F98DF608414105C261301","vid":"","format":"mp3","fileName":"乔玲儿 - 深情败给时间","year":"2020-10-25","duration":206706,"title":" 深情败给时间","singer":{"name":"乔玲儿 "},"album":{"mid":39662396,"name":"深情败给时间","cover":"http://imge.kugou.com/stdmusic/400/20201022/20201022180602330758.jpg"}},{"mid":"A96C2A30A3C203D9A31F1EA8DF3D05DB","vid":"1B08898EEBE6CD117C45D5CC5F9BB512","format":"mp3","fileName":"张茜 - 用力活着","year":"2020-07-29","duration":263314,"title":" 用力活着","singer":{"name":"张茜 "},"album":{"mid":38672208,"name":"用力活着","cover":"http://imge.kugou.com/stdmusic/400/20200728/20200728204904931197.jpg"}},{"mid":"104D1145BABD0338FF28D44B2349AA0B","vid":"B022CFF110364DDB5E9D90E0A2F5673F","format":"mp3","fileName":"付豪 - 心太懒","year":"2021-01-06","duration":245000,"title":" 心太懒","singer":{"name":"付豪 "},"album":{"mid":40966962,"name":"心太懒","cover":"http://imge.kugou.com/stdmusic/400/20210105/20210105152803441137.jpg"}},{"mid":"CD121C60F621B973FB7EC0C838A8D8F1","vid":"","format":"mp3","fileName":"小阿枫 - 偏爱","year":"2020-09-30","duration":233090,"title":" 偏爱","singer":{"name":"小阿枫 "},"album":{"mid":39395204,"name":"偏爱","cover":"http://imge.kugou.com/stdmusic/400/20200928/20200928141704303688.jpg"}},{"mid":"4F25A1D5FBE191E3BACFE0EDF49356C2","vid":"","format":"mp3","fileName":"阿康 - 最后的莫西干人 + 谁能明白我","year":"2020-10-21","duration":201482,"title":" 最后的莫西干人 + 谁能明白我","singer":{"name":"阿康 "},"album":{"mid":39641147,"name":"最后的莫西干人 + 谁能明白我","cover":"http://imge.kugou.com/stdmusic/400/20201020/20201020180405926884.jpg"}},{"mid":"3A7171E3C676A990AA6C4F812002F673","vid":"","format":"mp3","fileName":"李志洲 - 男人有泪不低头","year":"2021-02-28","duration":255000,"title":" 男人有泪不低头","singer":{"name":"李志洲 "},"album":{"mid":42053371,"name":"男人有泪不低头","cover":"http://imge.kugou.com/stdmusic/400/20210224/20210224174801715359.jpg"}},{"mid":"040F7966FDCF11B4EED35B67F159AAEE","vid":"","format":"mp3","fileName":"Bell玲惠 - 爱就一个字 (治愈版)","year":"2021-03-27","duration":248000,"title":" 爱就一个字 (治愈版)","singer":{"name":"Bell玲惠 "},"album":{"mid":42989466,"name":"爱就一个字 (治愈版)","cover":"http://imge.kugou.com/stdmusic/400/20210326/20210326221538295386.jpg"}},{"mid":"7D14C5BF9CAA65FCECFE00197157985E","vid":"","format":"mp3","fileName":"苏星婕 - 时空缝隙","year":"2021-03-10","duration":190000,"title":" 时空缝隙","singer":{"name":"苏星婕 "},"album":{"mid":42358081,"name":"时空缝隙","cover":"http://imge.kugou.com/stdmusic/400/20210309/20210309162222240508.jpg"}},{"mid":"2AF7BE37B31017057454591074DE4889","vid":"B8FF65A3D01671B5953B7DAC13D65297","format":"mp3","fileName":"林子祥 - 谁能明白我","year":"1984-12-01","duration":204572,"title":" 谁能明白我","singer":{"name":"林子祥 "},"album":{"mid":563214,"name":"林子祥创作歌集","cover":"http://imge.kugou.com/stdmusic/400/20200928/20200928011514968950.jpg"}},{"mid":"AA6F7E3CD8A018E1E03335D136FC3A9E","vid":"DABF152BD77BAB181ECCD07E9E73E521","format":"mp3","fileName":"黄品源、莫文蔚 - 那么爱你为什么","year":"1999-12-03","duration":264000,"title":" 那么爱你为什么","singer":{"name":"黄品源、莫文蔚 "},"album":{"mid":2996445,"name":"狠不下心","cover":"http://imge.kugou.com/stdmusic/400/20160907/20160907182625840593.jpg"}},{"mid":"68F9821FFBA97A50E20A600B4157075D","vid":"AC744055C87609CC91DD5A7439D5E115","format":"mp3","fileName":"李宗盛 - 鬼迷心窍","year":"1992-02-01","duration":260623,"title":" 鬼迷心窍","singer":{"name":"李宗盛 "},"album":{"mid":885056,"name":"杨佩佩精装大戏主题曲II","cover":"http://imge.kugou.com/stdmusic/400/20200909/20200909125802907061.jpg"}},{"mid":"EC2F249E4CCA0CF59F660876C54BEC1F","vid":"F543C802C4789013107488FD602E16AC","format":"mp3","fileName":"G.E.M.邓紫棋 - 再见","year":"2015-11-06","duration":206000,"title":" 再见","singer":{"name":"G.E.M.邓紫棋 "},"album":{"mid":555825,"name":"新的心跳","cover":"http://imge.kugou.com/stdmusic/400/20200909/20200909123836163176.jpg"}},{"mid":"CA8435928D528ACD8B9D356EB91A10F0","vid":"744C4B0E635D768A51645952C59FA649","format":"mp3","fileName":"二小姐 - 有没有一种思念永不疲惫","year":"2020-12-01","duration":239542,"title":" 有没有一种思念永不疲惫","singer":{"name":"二小姐 "},"album":{"mid":40348134,"name":"有没有一种思念永不疲惫","cover":"http://imge.kugou.com/stdmusic/400/20201130/20201130172304554640.jpg"}},{"mid":"9DF6A7528E389A44C7865AD1A29AB9E2","vid":"E633E5A23FB63FC106323EEA663C8FAF","format":"mp3","fileName":"FrogMonster - Remember Our Summer","year":"2020-07-16","duration":163160,"title":" Remember Our Summer","singer":{"name":"FrogMonster "},"album":{"mid":28273237,"name":"Remember Our Summer","cover":"http://imge.kugou.com/stdmusic/400/20210205/20210205112902297759.jpg"}},{"mid":"A1E71D8A9D1E9A80705A0756B8F219F0","vid":"D42E6C508EBC3F57A0D47B097DAAADEF","format":"mp3","fileName":"Twinbed - Trouble I\'m In","year":"2014-05-07","duration":200070,"title":" Trouble I\'m In","singer":{"name":"Twinbed "},"album":{"mid":620345,"name":"Trouble I\'m In","cover":"http://imge.kugou.com/stdmusic/400/20150716/20150716024144795887.jpg"}},{"mid":"A5C9484C7C3E92AD2D9499AADC9F05AF","vid":"24CCAA829D9838FA17EB3B9BC4AE2BB4","format":"mp3","fileName":"张子枫 - 举镜子的女孩","year":"2021-03-30","duration":280000,"title":" 举镜子的女孩","singer":{"name":"张子枫 "},"album":{"mid":43069649,"name":"举镜子的女孩","cover":"http://imge.kugou.com/stdmusic/400/20210329/20210329123904897252.jpg"}},{"mid":"8B27A52D2B327D072B8A79E5B0915954","vid":"","format":"mp3","fileName":"付豪、鹏鹏音乐 - 鬼迷心窍","year":"2021-03-01","duration":232000,"title":" 鬼迷心窍","singer":{"name":"付豪、鹏鹏音乐 "},"album":{"mid":42157642,"name":"鬼迷心窍","cover":"http://imge.kugou.com/stdmusic/400/20210301/20210301170205206014.jpg"}},{"mid":"961FCC8DABB082E662BFE22083DFC1B0","vid":"","format":"mp3","fileName":"苏贝贝 - 还是会想你","year":"2021-03-24","duration":195000,"title":" 还是会想你","singer":{"name":"苏贝贝 "},"album":{"mid":42922301,"name":"还是会想你(完整版)","cover":"http://imge.kugou.com/stdmusic/400/20210324/20210324164112772264.jpg"}},{"mid":"A72FD1726C82710619CD91789F81071B","vid":"56C73BD1C111BD43AA837423CFDA8901","format":"mp3","fileName":"郭顶 - 水星记","year":"2016-11-21","duration":325000,"title":" 水星记","singer":{"name":"郭顶 "},"album":{"mid":1823892,"name":"水星记","cover":"http://imge.kugou.com/stdmusic/400/20200812/20200812140103976892.jpg"}},{"mid":"0D5655A23FF5C243A131387C11710ACC","vid":"E9311EA5A2909EC100AFBB2996D48C81","format":"mp3","fileName":"阿桑 - 寂寞在唱歌","year":"2005-02-25","duration":270000,"title":" 寂寞在唱歌","singer":{"name":"阿桑 "},"album":{"mid":972917,"name":"寂寞在唱歌","cover":"http://imge.kugou.com/stdmusic/400/20171016/20171016101203221753.jpg"}},{"mid":"D0F1CA8F6E56549C7D060061BD99D16C","vid":"E2E27E22E23656D0A780023ACC690255","format":"mp3","fileName":"李荣浩 - 老街","year":"2010-09-09","duration":318000,"title":" 老街","singer":{"name":"李荣浩 "},"album":{"mid":964378,"name":"小黄","cover":"http://imge.kugou.com/stdmusic/400/20150718/20150718081938784291.jpg"}}]';
    let list = JSON.parse(data);
    // list.forEach(item => {
    // item.singer = item.singer.name;
    // item.album = item.album.name;
    // })
    console.info(this.list = list);
    // let list = await this.$source.impl.rankSongList(res[0].items[0], this.page);
    // console.info(JSON.stringify(list));
    // console.info(list);
    // this.$source.impl.rankList().then(async res => {
    //   this.tagType = res;
    //   console.info('res=>', res)
    //   console.info(JSON.stringify(res));
    //   let list = await this.$source.impl.rankSongList(res[0].items[0], this.page);
    //   console.info(list);
    //   console.info(JSON.stringify(list));
    //   this.$nextTick(() => this.list = list);
    // });

    // this.$source.impl.singerList(this.page, this.area, this.sex, this.en).then(res => this.list = res);
  },
  mounted() {
    // let nodes = this.$el.querySelectorAll('.list-view');
    // nodes.forEach(node => node.childNodes[0].classList.add('active'));
  },
  methods: {
    onRankChanged(event, v) {
      console.info(event, v);
      // let node = event.target;
      // if (node.classList.contains('item')) {
      //   node.parentNode.childNodes.forEach(item => item.classList.remove('active'));
      //   node.classList.add('active');
      // }
    },
    /**
     * 表格行单元格双击时的回调方法
     * @param row {Number} 行单元格索引
     */
    onCellClick(row) {
      let item = this.list[row];
      if (!item.path) {
        return;
      }

      let player = this.$player, playList = player.playList;
      player.index = row;
      playList.splice(0, playList.length, ...this.list);
      if (player.prepare(item)) {
        player.play();
      }
    },
  }
}
</script>

<style scoped>
.tag .item {
  cursor: pointer;
  border-radius: 1em;
  white-space: nowrap;
  margin: 0 0 0 0.5em;
  padding: 0.25em 0.75em;
  color: var(--text-base);
}

.tag .item:hover {
  color: var(--text-hover);
}

.tag .item.active {
  background: var(--fill-base);
  color: var(--text-active);
}
</style>
