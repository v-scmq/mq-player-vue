import {sleep} from '../utils';
import {createReadStream, existsSync, statSync} from 'fs';
import {request as httpsRequest} from 'https';
import {createServer, request as httpRequest, IncomingMessage, ServerResponse, IncomingHttpHeaders} from 'http';

import {HttpBaseResponse, DataSource, Song} from '../types';

import {QQMusicSource} from './api/tencent';
import {DefaultSource} from './api/default';

const protocol = 'http', host = 'localhost', port = process.env.NODE_ENV === 'production' ? 8888 : 9081;

// 本地服务器根路径
export const BASE_URL = `${protocol}://${host}:${port}`;

// 内容MIME类型
const MIME_TYPE: { [key: string]: string } = {
    '.aac': 'audio/mpeg', '.m4a': 'audio/mpeg', '.mp3': 'audio/mpeg', '.flac': 'audio/mpeg',
    '.mp4': 'video/mpeg', 'mkv': 'video/mpeg',
    '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml',
    '.svgz': 'image/svg+xml', '.json': 'application/json', '.wasm': 'application/wasm',
    default: 'application/octet-stream'
}

// 数据源
const DATA_SOURCE_IMPL = {
    [DefaultSource.platform]: DefaultSource,
    [QQMusicSource.platform]: QQMusicSource
} as { [key: string]: DataSource };

/**
 * 处理本地文件资源请求
 *
 * @param request 客户端请求信息
 * @param response 服务器响应信息
 * @param path 文件资源绝对路径
 */
const handleFileRequest = (request: IncomingMessage, response: ServerResponse, path: string) => {
    let stats;

    if (path && existsSync(path) && (stats = statSync(path)).isFile()) {
        // 文件大小(字节)
        const size = stats.size;
        // 分段传输时的数据字节范围请求头信息
        const range = <string>request.headers.range;
        // 待响应状态码(若是分段传输,则状态码是206; 否则200)
        const code = range && range.indexOf('bytes=') === 0 ? 206 : 200;
        // 文件格式
        const format = path.substring(path.lastIndexOf('.'));
        // 分段传输时开始和结束的字节大小
        let start = 0, end = size;

        // 响应头信息
        const headers: IncomingHttpHeaders = {
            'content-type': MIME_TYPE[format] || MIME_TYPE.default,
            'content-length': size.toString(),
            'access-control-allow-origin': '*',
        };

        // Range请求头 => bytes=0-100 | bytes=0-
        if (code === 206) {
            const index = range.indexOf('-');
            if (index) {
                // @ts-ignore
                start = (range.substring(6, index) - 0) || 0;
                // @ts-ignore
                end = (range.substring(index + 1) - 0) || size;
            }

            // 分段传输时,结束位置不能到达文件大小,否则不能播放
            end = end === size ? --end : end;

            headers['accept-ranges'] = 'bytes';
            headers['content-range'] = `bytes ${start}-${end}/${size}`;
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

        // 写入响应头信息到客户端
        response.writeHead(code, headers);
        // 连接 文件输入流 到 客户端响应(输出流) 之间的管道
        inputStream.pipe(response);

    } else {
        response.writeHead(404, {'content-type': 'text/html; charset=utf-8'}).end(
            '<html lang="zh"><head><title>404 Not Found</title></head><body>未找到指定资源</body></html>');
    }
};

/**
 * 请求处理回调方法.
 *
 * ①当返回值是null时, 表明未找到匹配的数据源api实现;
 * ②当返回值是Promise对象时, 表明已找到匹配的数据源api实现;
 * ③若抛出异常, 表明校验参数失败.
 */
type RequestCallback = (param: { [key: string]: any }) => Promise<HttpBaseResponse> | null;

/**
 * 处理post请求,并调用传入的callback方法获取数据
 *
 * @param request 客户端请求信息
 * @param response 服务器响应信息
 * @param callback 回调处理器, 用于自定义调用对象上的方法来获取数据
 */
const handlePostRequest = (request: IncomingMessage, response: ServerResponse, callback: RequestCallback) => {
    const buffers: Buffer[] = [];

    request.on('data', (chunk: Buffer) => buffers.push(chunk));

    request.once('end', () => {
        try {
            debugger;

            // 执行回调方法, 在回调方法中校验参数 
            // 注意: 若buffers是空数组, toString()后是空串, 但是这里不作处理它, 因为已经try catch
            const promise = callback(JSON.parse(buffers.toString()));

            // 不是promise对象, 中断后续处理
            if (!promise) {
                const headers = {'content-type': 'text/plain; charset=utf-8'};
                return response.writeHead(403, headers).end('没有数据源api实现此接口');
            }

            promise.then(data => {
                debugger;
                data = data || {};

                //  获取状态码 和 响应头
                const {httpInfo: {statusCode = 200, headers = {}} = {}} = data;

                // 从data对象上 删除 状态码 和 响应头信息
                delete data.httpInfo;

                // 若存在分页, 则全局统一计算数据分页页数
                data.page ? data.page.pageCount = Math.ceil((data.page.total || 1) / data.page.size) : null;

                // 原始数据(Object) => JSON字符串 => Buffer
                const buffer = Buffer.from(JSON.stringify(data));

                // 当内容大小与实际大小不一致时,将导致客户端不能正确响应
                // 策略: 指定正确的内容大小响应标头 或 删除内容大小响应标头
                headers['content-length'] = buffer.length.toString(); // delete headers['content-length'];

                // 重设响应内容类型标头
                headers['content-type'] = 'application/json; charset=utf-8';

                // 写入 状态信息 及 数据 到客户端
                response.writeHead(statusCode, headers).end(buffer);

            }).catch(reason => response.writeHead(500, {'content-type': 'text/plain; charset=utf-8'}).end(reason.message));

        } catch (e) {
            response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'}).end('无效的参数！')
        }
    });

    request.once('error', () => response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'}).end('请求失败！'));
};

/**
 * 处理流式类型数据的get请求
 *
 * @param request 客户端请求信息
 * @param response 服务器响应信息
 * @param url URL地址
 */
const handleStreamRequest = (request: IncomingMessage, response: ServerResponse, url: string) => {
    let uri: URL;

    try {
        uri = new URL(url);

    } catch (ignore) {
        // 拒绝访问
        response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'})
            .end('无效的URL');
        return;
    }

    /**
     * 处理响应
     *
     * @param newResponse 来自远程的响应信息
     */
    const handler = (newResponse: IncomingMessage) => {
        // 写入响应标头(注意:所有响应头都将会被写入到本地客户端)
        response.writeHead(newResponse.statusCode || 200, newResponse.headers);
        // 新的响应 (连接管道)=> 原来的响应
        newResponse.pipe(response);
    };

    // 发送到目标服务器的请求头
    const headers: IncomingHttpHeaders = {};

    // 获取浏览器发出的请求头
    for (const key in request.headers) {
        // "x-forwarded-host": "localhost:9080",
        // "x-forwarded-proto": "http",
        // "x-forwarded-port": "9080",
        // "x-forwarded-for": "127.0.0.1",
        if (key.startsWith('x-forwarded')) {
            // 以上类似的请求头不使用
            continue;
        }

        // 例如 "range": "bytes=0-", 这样的请求头是非常关键的, 会影响服务器的处理
        // 对于流媒体都有seek操作, 它必须依赖于请求头range 和 服务器的响应头 content-range、accept-ranges
        headers[key] = request.headers[key];
    }

    // 替换主机请求头(非必须)
    headers.host = uri.host;
    // 替换referer请求头
    headers.referer = url;
    // 替换浏览器标识
    headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

    // 请求配置选项
    const options = {headers, method: request.method || 'get'};

    // 发出新的请求(不同的协议, 使用不同的请求处理器发送)
    const newRequest = uri.protocol == 'https:'
        ? httpsRequest(url, options, handler)
        : httpRequest(url, options, handler);

    // 源请求 (连接管道)=> 新的请求
    request.pipe(newRequest);
};

type RequestMappingHandler = {
    [key: string]: (request: IncomingMessage, response: ServerResponse, url?: string | URL) => void
};

/**
 * 请求映射处理器
 */
const RequestMappingHandler: RequestMappingHandler = {
    /**
     * 获取本地文件资源
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     * @param url 经过解析后的URL对象
     */
    '/api/file'(request, response, url) {
        handleFileRequest(request, response, (<URL>url).searchParams.get('path') as string);
    },

    /**
     * 获取歌手列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/singers'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.singerList(param.tag, param.page)) : null;
        });
    },

    /**
     * 获取歌手歌曲列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/singer/songs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.singer.platform];
            return dataSource ? sleep().then(() => dataSource.singerSongList(param.singer, param.page)) : null;
        });
    },

    /**
     * 获取歌手专辑列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/singer/albums'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.singer.platform];
            return dataSource ? sleep().then(() => dataSource.singerAlbumList(param.singer, param.page)) : null;
        });
    },

    /**
     * 获取专辑歌曲列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/album/songs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.album.platform];
            return dataSource ? sleep().then(() => dataSource.albumSongList(param.album, param.page)) : null;
        });
    },

    /**
     * 获取歌手MV列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/singer/mvs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.singer.platform];
            return dataSource ? sleep().then(() => dataSource.singerMvList(param.singer, param.page)) : null;
        });
    },

    /**
     * 获取歌单列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/specials'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.specialList(param.tag, param.page)) : null;
        });
    },


    /**
     * 获取歌单歌曲列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/special/songs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.special.platform];
            return dataSource ? sleep().then(() => dataSource.specialSongList(param.special, param.page)) : null;
        });
    },

    /**
     * 获取MV列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/mvs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.mvList(param.tag, param.page)) : null;
        });
    },

    /**
     * 获取榜单列表和榜单响应的歌曲列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/ranks/songs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.rankSongList(param.item, param.page)) : null;
        });
    },

    /**
     * 获取歌手搜索列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/search/singers'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.singerSearch(param.keyword)) : null;
        });
    },

    /**
     * 获取歌曲搜索列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/search/songs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.songSearch(param.keyword, param.page)) : null;
        });
    },

    /**
     * 获取专辑搜索列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/search/albums'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.albumSearch(param.keyword, param.page)) : null;
        });
    },

    /**
     * 获取歌单搜索列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/search/specials'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.specialSearch(param.keyword, param.page)) : null;
        });
    },

    /**
     * 获取MV搜索列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/search/mvs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.mvSearch(param.keyword, param.page)) : null;
        });
    },

    '/api/like/songs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.getLikeSongs(param.page)) : null;
        });
    },

    '/api/like/albums'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.getLikeAlbums(param.page)) : null;
        });
    },

    '/api/like/mvs'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.getLikeMvs(param.page)) : null;
        });
    },

    '/api/like/specials'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.getLikeSpecials(param.page)) : null;
        });
    },

    '/api/profile/specials'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.getProfileSpecials()) : null;
        });
    },

    '/api/special/create'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.createSpecial(param.special)) : null;
        });
    },

    '/api/special/update'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.updateSpecial(param.special)) : null;
        });
    },

    '/api/special/remove'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.removeSpecial(param.special)) : null;
        });
    },

    '/api/special/songs/add'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.addSpecialSong(param.songs, param.special)) : null;
        });
    },

    '/api/special/songs/remove'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? sleep().then(() => dataSource.removeSpecialSong(param.songs, param.special)) : null;
        });
    },

    /**
     * 获取歌词
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/lyric'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? dataSource.getLyric(param as Song) : null;
        });
    },


    /**
     * 获取歌手写真列表
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/singer/pic'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? dataSource.getSingerCovers(param as Song) : null;
        });
    },

    /**
     * 获取登录选项配置(当参数中不包含cookie信息) 或 登录用户信息(当参数中包含cookie信息)
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/user/login'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? dataSource.login(param.cookies) : null;
        });
    },

    /**
     * 退出登录,并返回需要移除cookie的URL
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     */
    '/api/user/logout'(request, response) {
        handlePostRequest(request, response, param => {
            const dataSource = DATA_SOURCE_IMPL[param.platform];
            return dataSource ? dataSource.logout() : null;
        });
    },

    /**
     * 获取歌曲播放地址,然后以流的方式响应歌曲数据到客户端 <br>
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     * @param url 解析后的URL对象
     */
    '/api/url/song'(request, response, url) {
        try {
            // 歌曲id
            const id = (<URL>url).searchParams.get('id') as string;
            // 歌曲mid
            const mid = (<URL>url).searchParams.get('mid') as string;
            // 音质 => 1:标准 | 2:高品质 | 3:无损
            const quality = Number((<URL>url).searchParams.get('quality') || 1);
            // 数据源
            const dataSource = DATA_SOURCE_IMPL[(<URL>url).searchParams.get('platform') as string];
            // 错误消息
            const error = !dataSource ? '没有数据源api实现此接口' : !mid ? '歌曲mid无效' : null;

            if (error) {
                // 拒绝访问
                return response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'}).end(error);
            }

            dataSource.getSongUrl(id, mid, Math.min(Math.max(1, quality), 3))
                .then(url => handleStreamRequest(request, response, url || ''))
                .catch(reason => response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'})
                    .end(reason.message));

        } catch (e: any) {
            // 捕捉异常,在此处做出错误消息
            response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'}).end(e.message);
        }
    },

    /**
     * 获取歌曲播放地址,然后以流的方式响应歌曲数据到客户端 <br>
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     * @param url 解析后的URL对象
     */
    '/api/url/mv'(request, response, url) {
        try {
            // mv vid
            const vid = (<URL>url).searchParams.get('vid') as string;
            // 画质 => 1:标清 | 2:高清 | 3:超清 | 4:蓝光
            const quality = Number((<URL>url).searchParams.get('quality') || 1);
            // 数据源
            const dataSource = DATA_SOURCE_IMPL[(<URL>url).searchParams.get('platform') as string];
            // 错误消息
            const error = !dataSource ? '没有数据源api实现此接口' : !vid ? 'MV vid无效' : null;

            if (error) {
                // 拒绝访问
                return response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'}).end(error);
            }

            dataSource.getMvUrl(vid, Math.min(Math.max(1, quality), 4))
                .then(url => handleStreamRequest(request, response, url || ''))
                .catch(reason => response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'})
                    .end(reason.message));

        } catch (e: any) {
            // 捕捉异常,在此处做出错误消息
            response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'}).end(e.message);
        }
    },

    /**
     * 请求指定的站点, 并以数据流的方式响应 <br>
     * 示例: `api/stream/uri=${ encodeURIComponent('https://www.electronjs.org/') }`
     *
     * @param request 客户端请求信息
     * @param response 服务器响应信息
     * @param url 解析后的URL对象
     */
    '/api/stream'(request, response, url) {
        try {
            const uriParam = (<URL>url).searchParams.get('uri') as string;
            const uri = new URL(uriParam);

            // 若未指定uri参数 或 path部分和当前服务器中的当前路径相同(不考虑是否同源)
            // 则拒绝此次访问(通过指定以下方法的url参数为null)
            handleStreamRequest(request, response, uri.pathname === '/api/stream' ? '' : uriParam);

        } catch (e: any) {
            // 捕捉异常,在此处做出错误消息
            response.writeHead(403, {'content-type': 'text/plain; charset=utf-8'}).end(e.message);
        }
    }
};

// 创建HTTP服务
createServer((request: IncomingMessage, response: ServerResponse) => {
    try {
        debugger;
        // 获取解析后的URL对象
        const url = new URL(`${BASE_URL}${request.url}`);
        // 获取URL路径字符串 和 请求处理器
        const path = url.pathname, handler = RequestMappingHandler[path];

        if (handler) {
            handler(request, response, url);
        } else {
            handleFileRequest(request, response, `${__dirname}/${path}`)
        }

    } catch (e: any) {
        response.writeHead(500, {'content-type': 'text/html'}).end(
            `<html lang="zh"><head><title>500 Server Error</title></head><body>服务器发生了错误: ${e.message}</body></html>`);
    }

}).listen(port, host);
