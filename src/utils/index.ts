/***************************************************************
 *                    module: URIUtil                          *
 ***************************************************************/

/**
 * 获取本地文件资源在本地服务器上的API接口地址 <br>
 *
 * 注意: 原有文件路径需要经过 {@link encodeURIComponent} 编码URI
 * {@link encodeURI} 是 编码部分字符
 * {@link encodeURIComponent} 是编码更多字符(如'/' 和 '&' 也会被编码) 编码URI
 *
 * @param {string} path 文件绝对路径
 *
 * @return {string} 文件在本地服务器上的API接口地址
 */
export const getFileURL = (path: string) => `/api/file?path=${encodeURIComponent(path.replaceAll('\\', '/'))}`;

/**
 * 获取流式响应API接口地址
 *
 * @param {string} url URL地址字符串
 * @return {string} 流式响应API接口地址
 */
export const getStreamURI = (url: string) => `/api/stream?uri=${url ? encodeURIComponent(url) : ''}`;

/**
 * 获取歌曲在本地服务器上的URI地址
 *
 * @param {number} platform     音乐平台id
 * @param {string | number} id  歌曲id
 * @param {string} mid          歌曲mid
 * @param {number} quality      歌曲音质等级
 * @return {string}             歌曲资源在本地服务器上的URI
 */
export const getSongURI = (platform: number, id: string | number, mid: string, quality: number) =>
    `/api/url/song?platform=${platform}&mid=${mid}&id=${id}&quality=${quality}`;

/**
 * 获取Mv在本地服务器上的URI地址
 *
 * @param {number} platform     音乐平台id
 * @param {string} vid          Mv vid
 * @param {number} quality      Mv 画质等级
 * @return {string}             Mv 资源在本地服务器上的URI
 */
export const getMvURI = (platform: number, vid: string, quality: number) =>
    `/api/url/song?platform=${platform}&mid=${vid}&quality=${quality}`;


/***************************************************************
 *                    module: TimeUtil                         *
 ***************************************************************/

/**
 * 将毫秒时间值转换为 00:00 或 00:00:00的时间格式字符串
 *
 * @param {number} millis 毫秒时间值
 * @return {string} 毫秒表示的时间字符串
 */
export const millisToString = (millis: number) => {
    // 先将总毫秒数转换为总秒数,然后交给总秒数转换为标准时间值的方法处理
    return secondToString(millis / 1000);
}

/**
 * 将一个秒数时间值转换为 00:00 或 00:00:00的时间格式字符串
 *
 * @param {number} value 总秒数
 * @return {string} 秒数表示的标准时间字符串
 */
export const secondToString = (value: number) => {
    // 浮点数转换为整数可以使用 0 ^ 1.23232 = 1
    value = 0 ^ value;
    let v = '', number;
    // 获取总秒数包含的小时数
    if (value >= 3600) {
        number = 0 ^ value / 3600;
        v += number < 10 ? '0' + number + ':' : number + ':';
        // 计算剩余的总秒数
        value %= 3600;
    }
    // 计算包含的分钟数如果小于60,则分钟数为0
    number = value < 60 ? 0 : 0 ^ value / 60;
    // 如果数字小于10,补0
    v += number < 10 ? '0' + number + ':' : number + ':';
    // 计算秒数如果小于60,则秒数为time,否则为 time % 60
    number = value < 60 ? value : value % 60;
    return number < 10 ? v + '0' + number : v + number;
}


/****************************************************************
 *                    module: FileUtil                          *
 ****************************************************************/

/**
 * 解决字符序列不能用于Windows操作系统平台的文件或文件夹名称.
 * 对于Windows平台,文件或文件夹名称一定不能包含 “{@code / \ * ? " : | < >}”中的任一字符.
 *
 * @param {string | Array | Object} name 文件或文件夹名称
 * @return {string} 标准的文件或文件夹名称
 */
export const resolveFileName = (name: string) => {
    if (!name) return name;

    const values = [...name];
    let replace;
    for (let index = values.length - 1; index >= 0; --index) {
        const c = values[index] = name.charAt(index);
        if (c === '/' || c === '\\' || c === '*' || c === '?' || c === '"'
            || c === ':' || c === '|' || c === '<' || c === '>') {
            values[index] = '~';
            replace = true;
        }
    }
    return replace ? values.join('') : name;
};


/**
 * 文件大小格式化
 *
 * @param {number} scale 精度
 * @param {number} size  文件字节大小
 * @return {string}      返回格式化后的文件大小的字符串表示
 */
export const toFileSize = (scale = 2, size: number) => {
    const B = 1024;
    if (size < B) {
        return `${size}B`;
    }

    const KB = 1048576;
    if (size < KB) {
        return `${(size / B).toFixed(scale)}KB`;
    }
    const MB = 1073741824;
    if (size < MB) {
        return `${(size / KB).toFixed(scale)}MB`;
    }
    // let GB = 1099511627776L;
    if (size < 1099511627776) {
        return `${(size / MB).toFixed(scale)}GB`;
    }
    return '';
};

/**
 *  从文件对象获取歌手名称、歌曲标题、专辑(使用标题)、文件大小、文件路径(临时URL创建)
 *
 * @param {File} file 文件对象
 * @param {boolean} isElectron 是否在Electron进程中
 * @return {{path: String, singer: String, size: String, album: String, title: String}} 媒体基本信息
 */
export const getMediaInfo = (file: File, isElectron: boolean) => {
    let title = file.name;
    title = title.substring(0, title.lastIndexOf('.'))
    const index = title.indexOf('-');
    const singer = title.substring(0, index);
    title = title.substring(index + 1);

    // 若是electron 不再获取 文件大小和路径
    const size = isElectron ? null : toFileSize(2, file.size);
    const path = isElectron ? null : URL.createObjectURL(file);

    return {title, album: title, singer, size, path};
};

/**
 * 转换歌手信息, 确保它应该是一个数组
 *
 * @param {Song | Mv | Album} value 歌手信息
 * @return {Singer[]} 歌手信息列表
 */
export const convertSinger = (value: any) =>
    value.singer instanceof Array ? value.singer :
        value.singer instanceof Object ? [value.singer] :
            value.singer ? [{name: value.singer}] : [];


/*****************************************************************
 *                    module: ThreadUtil                         *
 *****************************************************************/

/**
 * 睡眠指定的时间
 *
 * @param {number} timeout 睡眠超时(单位:毫秒)
 * @return {Promise<null>} 异步Promise对象
 */
export const sleep = (timeout = 3000) => new Promise(resolve =>
    setTimeout(() => resolve(null), Math.max(timeout, 3000)));


/*****************************************************************
 *                   module: MD5Util (来源于互联网)               *
 *****************************************************************/

/**
 * 获取字符序列对应的MD5字符序列
 *
 * @param {string} sequence {String} 需要转换的字符串
 * @returns {string} 原字符序列对应的MD5字符序列
 */
export const md5 = (sequence: string) => {
    const md5RotateLeft = (value: number, shiftBits: number) => {
        return (value << shiftBits) | (value >>> (32 - shiftBits));
    };

    const md5AddUnsigned = (x: number, y: number) => {
        const lx8 = (x & 0x80000000);
        const ly8 = (y & 0x80000000);
        const lx4 = (x & 0x40000000);
        const ly4 = (y & 0x40000000);
        const value = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
        if (lx4 & ly4) {
            return (value ^ 0x80000000 ^ lx8 ^ ly8);
        }
        if (lx4 | ly4) {
            if (value & 0x40000000) {
                return (value ^ 0xC0000000 ^ lx8 ^ ly8);
            } else {
                return (value ^ 0x40000000 ^ lx8 ^ ly8);
            }
        } else {
            return (value ^ lx8 ^ ly8);
        }
    }

    const md5F = (x: number, y: number, z: number) => {
        return (x & y) | ((~x) & z);
    }

    const md5G = (x: number, y: number, z: number) => {
        return (x & z) | (y & (~z));
    }

    const md5H = (x: number, y: number, z: number) => {
        return (x ^ y ^ z);
    }

    const md5I = (x: number, y: number, z: number) => {
        return (y ^ (x | (~z)));
    }

    const md5FF = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
        a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5F(b, c, d), e), g));
        return md5AddUnsigned(md5RotateLeft(a, f), b);
    }

    const md5GG = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
        a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5G(b, c, d), e), g));
        return md5AddUnsigned(md5RotateLeft(a, f), b);
    }

    const md5HH = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
        a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5H(b, c, d), e), g));
        return md5AddUnsigned(md5RotateLeft(a, f), b);
    }

    const md5II = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
        a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5I(b, c, d), e), g));
        return md5AddUnsigned(md5RotateLeft(a, f), b);
    }

    const md5ConvertToWordArray = (sequence: string) => {
        const numberOfWordsTemp1 = sequence.length + 8;
        const numberOfWordsTemp2 = (numberOfWordsTemp1 - (numberOfWordsTemp1 % 64)) / 64;
        const numberOfWords = (numberOfWordsTemp2 + 1) * 16;
        const wordArray = Array(numberOfWords - 1);
        let wordCount, bytePosition = 0, byteCount = 0;
        while (byteCount < sequence.length) {
            wordCount = (byteCount - (byteCount % 4)) / 4;
            bytePosition = (byteCount % 4) * 8;
            wordArray[wordCount] = (wordArray[wordCount] | (sequence.charCodeAt(byteCount) << bytePosition));
            byteCount++;
        }
        wordCount = (byteCount - (byteCount % 4)) / 4;
        bytePosition = (byteCount % 4) * 8;
        wordArray[wordCount] = wordArray[wordCount] | (0x80 << bytePosition);
        wordArray[numberOfWords - 2] = sequence.length << 3;
        wordArray[numberOfWords - 1] = sequence.length >>> 29;
        return wordArray;
    }

    const md5WordToHex = (value: number) => {
        let hexValue = '', hexValueTemp = '', byte: number, count;
        for (count = 0; count <= 3; count++) {
            byte = (value >>> (count * 8)) & 255;
            hexValueTemp = '0' + byte.toString(16);
            hexValue = hexValue + hexValueTemp.substring(hexValueTemp.length - 2);
        }
        return hexValue;
    }

    const md5Utf8Encode = (sequence: string) => {
        sequence = sequence.replace(/\r\n/g, '\n');
        let value = '';
        for (let n = 0; n < sequence.length; n++) {
            const c = sequence.charCodeAt(n);
            if (c < 128) {
                value += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                value += String.fromCharCode((c >> 6) | 192);
                value += String.fromCharCode((c & 63) | 128);
            } else {
                value += String.fromCharCode((c >> 12) | 224);
                value += String.fromCharCode(((c >> 6) & 63) | 128);
                value += String.fromCharCode((c & 63) | 128);
            }
        }
        return value;
    }

    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    const x = md5ConvertToWordArray(md5Utf8Encode(sequence));
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
        const AA = a, BB = b, CC = c, DD = d;

        a = md5FF(a, b, c, d, x[k], S11, 0xD76AA478);
        d = md5FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = md5FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = md5FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = md5FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = md5FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = md5FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = md5FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = md5FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = md5FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = md5FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = md5FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = md5FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = md5FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = md5FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = md5FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = md5GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = md5GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = md5GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = md5GG(b, c, d, a, x[k], S24, 0xE9B6C7AA);
        a = md5GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = md5GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = md5GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = md5GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = md5GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = md5GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = md5GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = md5GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = md5GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = md5GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = md5GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = md5GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = md5HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = md5HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = md5HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = md5HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = md5HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = md5HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = md5HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = md5HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = md5HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = md5HH(d, a, b, c, x[k], S32, 0xEAA127FA);
        c = md5HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = md5HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = md5HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = md5HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = md5HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = md5HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = md5II(a, b, c, d, x[k], S41, 0xF4292244);
        d = md5II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = md5II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = md5II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = md5II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = md5II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = md5II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = md5II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = md5II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = md5II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = md5II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = md5II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = md5II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = md5II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = md5II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = md5II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = md5AddUnsigned(a, AA);
        b = md5AddUnsigned(b, BB);
        c = md5AddUnsigned(c, CC);
        d = md5AddUnsigned(d, DD);
    }
    return md5WordToHex(a) + md5WordToHex(b) + md5WordToHex(c) + md5WordToHex(d);
}