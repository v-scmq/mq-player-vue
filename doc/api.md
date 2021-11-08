# MQ音乐 数据API

### 本地音乐

> 接口: /api/file?path=本地资源绝对路径 <br>
> 示例: /api/file?path=d:/scmq/music/叶炫清 - 九张机.mp3

### 第三方资源

参数说明
> platform &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = 1:腾讯 | 2:酷我 | 3:酷狗 <br>
> quality(song) = 1:标准 | 2:高品质 | 3:无损 <br>
> quality(mv) &nbsp;&nbsp; = 1:标清 | 2:高清 | 3:超清 | 4:蓝光 <br>

#### 歌手列表(post)

> 接口: /api/singers => data = {platform:number, page:number, pageSize:number, en:string, sex:string, genre:string, index:string} <br>
> 示例: /api/singers => data = {platform:1, page:1, pageSize:30} <br>
>
> 返回: <br>
> {
> tags:{
> en:[{id:1,name:"华语"}, {id:2,name:"欧美"}],
> sex:[{id:1,name:"男"}, {id:2,name:"女"}],
> genre:[], index:[]
> list:[{id:12394, mid:"239hmu", name:"叶炫清", cover:"/singer/cover/1.jpg", otherName:"", spell:"yxq"}]
> }

#### 歌手歌曲列表(post)

> 接口: /api/singer/songs => data = {platform:number, page:number, pageSize:number} <br>
> 示例: /api/singer/songs => data = {platform:1, page:1, pageSize:30} <br>
> 返回: [{duration, vid, singer, year, album, mid, id, title}]

#### 歌手专辑列表(post)

> 接口: /api/singer/albums => data = {platform:number, page:number, pageSize:number} <br>
> 示例: /api/singer/albums => data = {platform:1, page:1, pageSize:30} <br>
> 返回: [{singer:{}, mid, id, name, year, cover, songCount}]

#### 专辑歌曲列表(post)

> 接口: /api/album/songs => data = {platform:number, page:number, pageSize:number} <br>
> 示例: /api/album/songs => data = {platform:1, page:1, pageSize:30} <br>
> 返回: [{duration, vid, singer, year, album, mid, id, title}]

#### 歌手MV列表(post)

> 接口: /api/singer/mvs => data = {platform:number, page:number, pageSize:number} <br>
> 示例: /api/singer/mvs => data = {platform:1, page:1, pageSize:30} <br>
> 返回: [{singer, vid, title, cover, duration}]

#### 歌单列表(post)

> 接口: /api/specials => data = {platform:number, page:number, pageSize:number, tagId:string} <br>
> 示例: /api/specials => data = {platform:1, page:1, pageSize:30} <br>
> 返回: {tags:[{title, items:[{id, mame, sortType:[{id, name}]}]}], list:[{mid, name, cover, creator}]}

#### 歌单歌曲列表(post)

> 接口: /api/special/songs => data = {platform:number, page:number, pageSize:number, specialId:string} <br>
> 示例: /api/special/songs => data = {platform:1, page:1, pageSize:30} <br>
> 返回: {tags:[{title, items:[{id, mame, sortType:[{id, name}]}]}], list:[{duration, vid, singer, year, album, mid, id, title}]}

#### MV列表(post)

> 接口: /api/mvs => data = {platform:number, page:number, pageSize:number, area:string, version:string} <br>
> 示例: /api/mvs => data = {platform:1, page:1, pageSize:30} <br>
> 返回: {tags:{area:[{id, name}], version:[{id, name}]}, list:[{singer:{}, vid, title, cover, duration}]}

#### 榜单列表(post)

> 接口: /api/ranks => data = {platform:number, page:number, pageSize:number} <br>
> 示例: /api/ranks => data = {platform:1, page:1, pageSize:30} <br>
> 返回: [{id, title, items:[{id, name, cover}]}]

#### 榜单歌曲列表(post)

> 接口: /api/rank/songs => data = {platform:number, page:number, pageSize:number, rankItemId:string} <br>
> 示例: /api/rank/songs => data = {platform:1, page:1, pageSize:30} <br>
> 返回: [{duration, vid, singer, year, album, mid, id, title}]

#### 歌曲搜索(post)

> 接口: /api/search/songs => data = {platform:number, page:number, pageSize:number, keyword:string} <br>
> 示例: /api/search/songs => data = {platform:1, page:1, pageSize:30, keyword:'九张机'} <br>
> 返回: [{duration, vid, singer, year, album, mid, id, title}]

#### 专辑搜索(post)

> 接口: /api/search/albums => data = {platform:number, page:number, pageSize:number, keyword:string} <br>
> 示例: /api/search/albums => data = {platform:1, page:1, pageSize:30, keyword:'九张机'} <br>
> 返回: [{singer:{}, mid, id, name, year, cover, songCount}]

#### 歌单搜索(post)

> 接口: /api/search/specials => data = {platform:number, page:number, pageSize:number, keyword:string} <br>
> 示例: /api/search/specials => data = {platform:1, page:1, pageSize:30, keyword:'九张机'} <br>
> 返回: [{mid, name, cover, creator}]

#### MV搜索(post)

> 接口: /api/search/mvs => data = {platform:number, page:number, pageSize:number, keyword:string} <br>
> 示例: /api/search/mvs => data = {platform:1, page:1, pageSize:30, keyword:'九张机'} <br>
> 返回: [{mid, name, cover, creator}]

#### 歌词(post)

> 接口: /api/lyric => data = {platform:number, mid:string} <br>
> 示例: /api/lyric => data = {platform:1, mid:'1232v'} <br>
> 返回: [{millis:number, content:string}]

#### 歌手写真列表(post)

> 接口: /api/singer/pic => data = {platform:number, mid:string} <br>
> 示例: /api/singer/pic => data = {platform:1, mid:'1232v'} <br>
> 返回: ['url1', 'url2']

#### 歌曲URL(get)

> 接口: /api/url/song?quality=number&platform=number&mid=string&id=string <br>
> 示例: /api/url/song?quality=1&platform=1&mid=11111v&id=1000n <br>

#### MV URL(get)

> 接口: /api/url/mv?quality=number&platform=number&vid=string <br>
> 示例: /api/url/mv?quality=1&platform=1&vid=11111v <br>

#### cover URL(get)

> 接口: /api/url/cover?uri=string <br>
> 示例: /api/url/cover?uri=https://demo/1.jpg <br>

#### stream URL(get)

> 接口: /api/stream?uri=string <br>
> 示例: /api/stream?uri=https://demo/1.mp3 <br>
