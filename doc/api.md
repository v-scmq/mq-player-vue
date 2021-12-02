# MQ音乐 数据API

### 本地音乐

> 接口: /api/file?path=本地资源绝对路径 <br>
> 示例: /api/file?path=d:/scmq/music/叶炫清 - 九张机.mp3

### 第三方资源

参数说明
> platform &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = 1:x | 2:y | 3:z <br>
> quality(song) = 1:标准 | 2:高品质 | 3:无损 <br>
> quality(mv) &nbsp;&nbsp; = 1:标清 | 2:高清 | 3:超清 | 4:蓝光 <br>

#### 歌手列表(post)

> 接口: /api/singers => data = {platform:number, page:Page, tag:SingerTagsParam},
> 示例: /api/singers => data = {platform:1, page:{page:1, size:30}, tag:{area:'1', en:'A'} } <br>
> 返回: {page:Page, tags:SingerTags, list:Singer[]}

#### 歌手歌曲列表(post)

> 接口: /api/singer/songs => data = {platform:number, page:Page, singer:Singer} <br>
> 示例: /api/singer/songs => data = {platform:1, page:{current:1, size:30}, singer:{mid:"1234v"}} <br>
> 返回: {page:Page, singer:Singer | null, list:Song[]}

#### 歌手专辑列表(post)

> 接口: /api/singer/albums => data = {platform:number, page:Page, singer:Singer} <br>
> 示例: /api/singer/albums => data = {platform:1, page:{current:1, size:30}, singer:{mid:"1234v"}} <br>
> 返回: {page:Page, list:Album[]}

#### 专辑歌曲列表(post)

> 接口: /api/album/songs => data = {platform:number, page:Page, album:Album} <br>
> 示例: /api/album/songs => data = {platform:1, page:{current:1, size:30}, album:{mid:"t02kl"}} <br>
> 返回: {page:Page, album:Album | null, list:Song[]}

#### 歌手MV列表(post)

> 接口: /api/singer/mvs => data = {platform:number, page:Page, singer:Singer} <br>
> 示例: /api/singer/mvs => data = {platform:1, page:{current:1, size:30}, singer:{mid:"1234v"}} <br>
> 返回: {page:Page, list:MV[]}

#### 歌单列表(post)

> 接口: /api/specials => data = {platform:number, page:Page, tag:Tag} <br>
> 示例: /api/specials => data = {platform:1, page:{current:1, size:30}, tag:{id:1}} <br>
> 返回: {tags:SpecialTags[], page:Page, list:Special[]}

#### 歌单歌曲列表(post)

> 接口: /api/special/songs => data = {platform:number, page:Page, special:Special} <br>
> 示例: /api/special/songs => data = {platform:1, page:{current:1, size:30}, special:{id:'1sdlt0'}} <br>
> 返回: {page:Page, special:Special, list:Song[]}

#### MV列表(post)

> 接口: /api/mvs => data = {platform:number, page:Page, tag:{area:string, version:string}} <br>
> 示例: /api/mvs => data = {platform:1, page:{current:1, size:30}, tag:{area:'1', version:'2'}} <br>
> 返回: {page:Page, tags:MvTags, list:Mv[]}

#### 榜单及歌曲列表(post)

> 接口: /api/ranks/songs => data = {platform:number, page:Page, item:RankItem} <br>
> 示例: /api/ranks/songs => data = {platform:1, page:{current:1, size:30}, item:{id:'1slv'}} <br>
> 返回: {page:Page, rankList:Rank[], list:Song[]}

#### 歌手搜索(post)

> 接口: /api/search/singers => data = {platform:number, keyword:string} <br>
> 示例: /api/search/singers => data = {platform:1, keyword:'九张机'} <br>
> 返回: {list:Singer[]}

#### 歌曲搜索(post)

> 接口: /api/search/songs => data = {platform:number, page:Page, keyword:string} <br>
> 示例: /api/search/songs => data = {platform:1, page:{current:1, size:30}, keyword:'九张机'} <br>
> 返回: {page:Page, list:Song[]}

#### 专辑搜索(post)

> 接口: /api/search/albums => data = {platform:number, page:Page, keyword:string} <br>
> 示例: /api/search/albums => data = {platform:1, page:{current:1, size:30}, keyword:'九张机'} <br>
> 返回: {page:Page, list:Album[]}

#### 歌单搜索(post)

> 接口: /api/search/specials => data = {platform:number, page:Page, keyword:string} <br>
> 示例: /api/search/specials => data = {platform:1, page:{current:1, size:30}, keyword:'九张机'} <br>
> 返回: {page:Page, list:Special[]}

#### MV搜索(post)

> 接口: /api/search/mvs => data = {platform:number, page:Page, keyword:string} <br>
> 示例: /api/search/mvs => data = {platform:1, page:{current:1, size:30}, keyword:'九张机'} <br>
> 返回: {page:Page, list:Mv[]}

#### 歌词(post)

> 接口: /api/lyric => data = {platform:number, mid:string} <br>
> 示例: /api/lyric => data = {platform:1, mid:'1232v'} <br>
> 返回: [{millis:number, content:string}]

#### 歌手写真列表(post)

> 接口: /api/singer/pic => data = {platform:number, mid:string} <br>
> 示例: /api/singer/pic => data = {platform:1, mid:'1232v'} <br>
> 返回: ['url1', 'url2']

#### 获取登录配置选项 或 开始登录

> 接口: /api/user/login => data = {platform:number, cookies:Electron.Cookie[]} <br>
> 示例: /api/user/login => data = {platform:1, cookie:[]} <br>
> 返回: {option:ModalOpenOption} | {reason:string | null, user:User | null}

#### 退出登录

> 接口: /api/user/logout => data = {platform:number} <br>
> 示例: /api/user/logout => data = {platform:1} <br>
> 返回: {cookieURL:string}

#### 歌曲URL(get)

> 接口: /api/url/song?platform=number&mid=string&id=string&quality=number <br>
> 示例: /api/url/song?platform=1&mid=11111v&id=1000n&quality=1 <br>

#### MV URL(get)

> 接口: /api/url/mv?platform=number&vid=string&quality=number <br>
> 示例: /api/url/mv?platform=1&vid=11111v&quality=1 <br>

#### stream URL(get)

> 接口: /api/stream?uri=string <br>
> 示例: /api/stream?uri=https://demo/1.mp3 <br>
