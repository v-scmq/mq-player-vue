import {createServer} from 'http';
import {createReadStream, existsSync, statSync} from 'fs';
import {QQMusicSource} from './api/tencent';
import {DefaultSource} from './api/default';

const protocol = 'http';
const host = 'localhost';
const port = 9081;

// 本地服务器根路径
export const BASE_URL = `${protocol}://${host}:${port}`;

// 内容MIME类型
const MIME_TYPE = {
    '.aac': 'audio/mpeg', '.m4a': 'audio/mpeg', '.mp3': 'audio/mpeg', '.flac': 'audio/mpeg',
    '.mp4': 'video/mpeg', 'mkv': 'video/mpeg',
    '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml',
    '.svgz': 'image/svg+xml', '.json': 'application/json', '.wasm': 'application/wasm',
    default: 'application/octet-stream'
}

// 数据来源
const DATA_SOURCE_IMPL = {
    [DefaultSource.id]: DefaultSource,
    [QQMusicSource.id]: QQMusicSource
};

/**
 * 处理本地文件资源请求
 *
 * @param {module:http.IncomingMessage} request 客户端请求信息
 * @param {module:http.ServerResponse} response 服务器响应信息
 * @param {string} path 文件资源绝对路径
 */
const handleFileRequest = (request, response, path) => {
    if (path && existsSync(path)) {
        // 文件大小(字节)
        const size = statSync(path).size;
        // 分段传输时的数据字节范围请求头信息
        const range = request.headers.range;
        // 待响应状态码(若是分段传输,则状态码是206; 否则200)
        const code = range && range.indexOf('bytes=') === 0 ? 206 : 200;
        // 文件格式
        const format = path.substring(path.lastIndexOf('.'));
        // 分段传输时开始和结束的字节大小
        let start = 0, end = size;

        // 响应头信息
        const headers = {
            'Content-Type': MIME_TYPE[format] || MIME_TYPE.default,
            'Content-Length': size,
            'Access-Control-Allow-Origin': '*',
        };

        // Range请求头 => bytes=0-100 | bytes=0-
        if (code === 206) {
            const index = range.indexOf('-');
            if (index) {
                start = (range.substring(6, index) - 0) || 0;
                end = (range.substring(index + 1) - 0) || size;
            }

            // 分段传输时,结束位置不能到达文件大小,否则不能播放
            end = end === size ? --end : end;

            headers['Accept-Ranges'] = 'bytes';
            headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
        }

        // 创建文件输入流, 并为其指定读取的开始和结束范围
        const inputStream = createReadStream(path, {start, end});

        /** 关闭输入流, 然后结束响应 */
        const dispose = () => {
            inputStream.close();
            response.end();
        }

        response.once('close', dispose);
        response.once('finish', dispose);
        response.once('end', dispose);
        // inputStream.once('close', () => response.end());

        // 写入响应头信息到客户端
        response.writeHead(code, headers);
        // 连接 文件输入流 到 客户端响应(输出流) 之间的管道
        inputStream.pipe(response);

    } else {
        response.writeHead(404, {'content-type': 'text/html'})
        response.end('<html lang="zh"><head><title>404 Not Found</title></head><body>未找到指定资源</body></html>');
    }
};

/**
 * 处理post请求,并调用传入的callback方法获取数据
 *
 * @param {module:http.IncomingMessage} request 客户端请求信息
 * @param {module:http.ServerResponse} response 服务器响应信息
 * @param {(dataSource:Object, param:Object) => Promise<any>} callback 回调处理器, 用于自定义调用对象上的方法来获取数据
 */
const handlePostRequest = (request, response, callback) => {
    /** @type {Buffer[]} */
    const buffers = [];

    request.on('data', /** @param {Buffer} chunk */chunk => buffers.push(chunk));

    request.once('end', () => {
        // 获取请求参数
        try {
            /** @type {{platform:number, [key:string]:any}} */
            const param = JSON.parse(buffers.toString());
            // 根据平台id查找对应的数据源实现
            const dataSource = DATA_SOURCE_IMPL[param.platform];

            if (dataSource) {
                callback(dataSource, param).then(/** @type {{[key:string]:any, httpInfo: HttpInfo}} */data => {
                    // 写入 状态码 和 响应头信息 到客户端
                    response.writeHead(data.httpInfo.statusCode, data.httpInfo.headers);
                    // 删除状态码和响应头信息
                    delete data.httpInfo;
                    // 吸入数据到客户端
                    response.write(JSON.stringify(data));

                }).catch(reason => response.writeHead(200, {}).end(reason));

            } else {
                response.writeHead(200, {}).end('没有对应的数据源api实现此接口');
            }

        } catch (e) {
            response.writeHead(200).end('无效的参数！')
        }
    });

    request.once('error', () => response.writeHead(200).end('请求失败！'));
};

/**
 * 请求映射处理器
 *
 * @type {{[key:string]: Function}}
 */
const requestMappingHandler = {

    /**
     * 获取本地文件资源
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     * @param url {URL} 经过解析后的URL对象
     */
    '/api/file'(request, response, url) {
        console.info('url => ', url);
        console.info('path => ', url.searchParams.get('path'));
        handleFileRequest(request, response, url.searchParams.get('path'));
    },

    /**
     * 获取歌手列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/singers'(request, response) {
        // param: {platform:number, page: Page, tag: SingerTagsParam} = {};
        handlePostRequest(request, response, (dataSource, param) =>
            dataSource.singerList(param.tag, param.page));
    },

    /**
     * 获取歌手歌曲列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/singer/songs'(request, response) {
        // const param: {platform:number, page: Page, singer: Singer} = {};
        handlePostRequest(request, response, (dataSource, param) =>
            dataSource.singerSongList(param.singer, param.page));
    },

    /**
     * 获取歌手专辑列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/singer/albums'(request, response) {
        // const param: {platform:number, page: Page, singer: Singer} = {};
        handlePostRequest(request, response, (dataSource, param) =>
            dataSource.singerAlbumList(param.singer, param.page));
    },

    /**
     * 获取专辑歌曲列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/album/songs'(request, response) {
        handlePostRequest(request, response, (dataSource, param) =>
            dataSource.albumSongList(param.album, param.page));
    },

    /**
     * 获取歌手MV列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/singer/mvs'(request, response) {
        handlePostRequest(request, response, (dataSource, param) =>
            dataSource.singerMvList(param.singer, param.page));
    },

    /**
     * 获取歌单列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/specials'(request, response) {
        response.end();
    },


    /**
     * 获取歌单歌曲列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/special/songs'(request, response) {
        response.end();
    },

    /**
     * 获取MV列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/mvs'(request, response) {
        response.end();
    },

    /**
     * 获取榜单列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/ranks'(request, response) {
        response.end();
    },

    /**
     * 获取榜单歌曲列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/rank/songs'(request, response) {
        response.end();
    },


    /**
     * 获取歌曲搜索列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/search/songs'(request, response) {
        response.end();
    },

    /**
     * 获取专辑搜索列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/search/albums'(request, response) {
        response.end();
    },

    /**
     * 获取歌单搜索列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/search/specials'(request, response) {
        response.end();
    },

    /**
     * 获取MV搜索列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/search/mvs'(request, response) {
        response.end();
    },

    /**
     * 获取歌词
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/lyric'(request, response) {
        response.end();
    },


    /**
     * 获取歌手写真列表
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/singer/pic'(request, response) {
        response.end();
    },

    /**
     * 获取音频数据(以二进制数据流方式响应)
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/url/song'(request, response) {
        response.end();
    },

    /**
     * 获取MV数据(以二进制数据流方式响应)
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/url/mv'(request, response) {
        response.end();
    },

    /**
     * 获取封面图(以二进制数据流方式响应)
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/url/cover'(request, response) {
        response.end();
    },

    /**
     * 更通用的数据流请求响应
     *
     * @param {module:http.IncomingMessage} request 客户端请求信息
     * @param {module:http.ServerResponse} response 服务器响应信息
     */
    '/api/stream'(request, response) {
        response.end();
    }
};

// 创建HTTP服务
createServer((request, response) => {
    // 获取解析后的URL对象
    const url = new URL(`${BASE_URL}${request.url}`);
    // 获取URL路径字符串
    const path = url.pathname;
    const handler = requestMappingHandler[path];

    try {
        if (handler) {
            handler(request, response, url);
        } else {
            handleFileRequest(request, response, `${__dirname}/${path}`)
        }
    } catch (error) {
        response.writeHead(500, {'content-type': 'text/html'})
        response.end(`<html lang="zh"><head><title>500 Server Error</title></head><body>服务器发生了错误 ${error}</body></html>`);
    }

}).listen(port, host);
