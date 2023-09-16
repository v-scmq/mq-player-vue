/***************************************************************
 *                    module: URIUtil                          *
 ***************************************************************/

import { LyricLine, Singer } from '@/types';

/**
 * 获取本地文件资源在本地服务器上的API接口地址 <br>
 *
 * 注意: 原有文件路径需要经过 {@link encodeURIComponent} 编码URI
 * {@link encodeURI} 是 编码部分字符
 * {@link encodeURIComponent} 是编码更多字符(如'/' 和 '&' 也会被编码) 编码URI
 *
 * @param path 文件绝对路径
 */
export const getFileURL = (path: string) => `/api/file?path=${encodeURIComponent(path.replaceAll('\\', '/'))}`;

/**
 * 获取流式响应API接口地址
 *
 * @param url URL地址字符串
 */
export const getStreamURI = (url: string) => `/api/stream?uri=${url ? encodeURIComponent(url) : ''}`;

/**
 * 获取歌曲在本地服务器上的URI地址
 *
 * @param platform     音乐平台id
 * @param id  歌曲id
 * @param mid          歌曲mid
 * @param quality      歌曲音质等级
 */
export const getSongURI = (platform: number, id: string | number, mid: string, quality: number) =>
  `/api/url/song?platform=${platform}&mid=${mid}&id=${id}&quality=${quality}`;

/**
 * 获取Mv在本地服务器上的URI地址
 *
 * @param platform 音乐平台id
 * @param vid      Mv vid
 * @param quality  Mv 画质等级
 */
export const getMvURI = (platform: number, vid: string, quality: number) =>
  `/api/url/song?platform=${platform}&mid=${vid}&quality=${quality}`;

/***************************************************************
 *                    module: TimeUtil                         *
 ***************************************************************/

/**
 * 将毫秒时间值转换为 00:00 或 00:00:00的时间格式字符串
 *
 * @param millis 毫秒时间值
 */
export const millisToString = (millis: number) => {
  // 先将总毫秒数转换为总秒数,然后交给总秒数转换为标准时间值的方法处理
  return secondToString(millis / 1000);
};

/**
 * 将一个秒数时间值转换为 00:00 或 00:00:00的时间格式字符串
 *
 * @param value 总秒数
 */
export const secondToString = (value: number) => {
  // 浮点数转换为整数可以使用 0 ^ 1.23232 = 1
  value = 0 ^ value;
  let v = '',
    number;
  // 获取总秒数包含的小时数
  if (value >= 3600) {
    number = 0 ^ (value / 3600);
    v += number < 10 ? '0' + number + ':' : number + ':';
    // 计算剩余的总秒数
    value %= 3600;
  }
  // 计算包含的分钟数如果小于60,则分钟数为0
  number = value < 60 ? 0 : 0 ^ (value / 60);
  // 如果数字小于10,补0
  v += number < 10 ? '0' + number + ':' : number + ':';
  // 计算秒数如果小于60,则秒数为time,否则为 time % 60
  number = value < 60 ? value : value % 60;
  return number < 10 ? v + '0' + number : v + number;
};

/****************************************************************
 *                    module: FileUtil                          *
 ****************************************************************/

/**
 * 解决字符序列不能用于Windows操作系统平台的文件或文件夹名称.
 * 对于Windows平台,文件或文件夹名称一定不能包含 “{@code / \ * ? " : | < >}”中的任一字符.
 *
 * @param name 文件或文件夹名称
 */
export const resolveFileName = (name: string) => {
  if (!name) return name;

  const values = [...name];
  let replace;
  for (let index = values.length - 1; index >= 0; --index) {
    const c = (values[index] = name.charAt(index));
    if (
      c === '/' ||
      c === '\\' ||
      c === '*' ||
      c === '?' ||
      c === '"' ||
      c === ':' ||
      c === '|' ||
      c === '<' ||
      c === '>'
    ) {
      values[index] = '~';
      replace = true;
    }
  }

  return replace ? values.join('') : name;
};

/**
 * 文件大小格式化
 *
 * @param scale 精度
 * @param size 文件字节大小
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
 * @param file 文件对象
 * @param isElectron 是否在Electron进程中
 */
export const getMediaInfo = (file: File, isElectron: boolean) => {
  let title = file.name;
  title = title.substring(0, title.lastIndexOf('.'));
  const index = title.indexOf('-');
  const singer = title.substring(0, index);
  title = title.substring(index + 1);

  // 若是electron 不再获取 文件大小和路径
  const size = isElectron ? null : toFileSize(2, file.size);
  const path = isElectron ? null : URL.createObjectURL(file);

  return { title, album: title, singer, size, path };
};

/**
 * 转换歌手信息, 确保它应该是一个数组
 *
 * @param value 歌手信息
 * @param platform 歌手所属平台
 */
export const convertSinger = (value: string | Singer | Singer[], platform: number) => {
  if (!value) {
    return [];
  }

  const list: Singer[] =
    value instanceof Array ? value : typeof value === 'string' ? [{ name: value } as Singer] : [value];

  for (const singer of list) {
    singer.platform = platform;
  }

  return list;
};

/*****************************************************************
 *                    module: LyricUtil                          *
 *****************************************************************/

/**
 * 读取并转换歌词内容
 *
 * @param text 歌词文本内容
 * @param translation 歌词翻译文本内容
 */
export const readLyric = (text: string, translation: string): LyricLine[] => {
  debugger;

  // 若标准的歌词文本不存在, 则尝试使用翻译文本
  if (!text && translation) {
    // 翻译文本作为普通歌词文本解析
    text = translation;
    // 不再单独解析翻译文本
    translation = '';
  }

  // 将歌词内容按换行符切割
  const lyrics = text ? text.split(/\r\n|\r|\n/) : [];
  // 将歌词翻译内容按换行符切割
  const translations = translation ? translation.split(/\r\n|\r|\n/) : [];

  // “[00:50.80][01:20.90] 歌词” =>
  // {'00:50.80'对应的秒数: LyricLine, '01:20.90'对应的秒数: LyricLine}
  const map: { [key: string]: LyricLine } = {};

  // 每行歌词的时间正则匹配表达式
  const regex = /\[(\d+):(\d{1,2})\.(\d{1,2})]/g;

  // 解析歌词内容
  for (const line of lyrics) {
    if (!line) {
      continue;
    }

    // 尝试匹配当前行的歌词信息
    const matched = line.matchAll(regex);
    // 将匹配信息转换为普通数组
    const matchedArray = matched ? Array.from(matched) : null;

    if (!matchedArray || matchedArray.length === 0) {
      continue;
    }

    // 获取最后一个匹配项
    const lastMatched = matchedArray[matchedArray.length - 1];
    // 歌词文本内容的起始索引
    const start = (lastMatched.index || 0) + lastMatched[0].length;
    // 获取歌词文本
    const content = line.slice(start);

    for (const item of matchedArray) {
      // 提取匹配到的总秒数
      const second = Number(item[1]) * 60 + Number(item[2]);
      // 提取匹配到的毫秒数(乘以10后才是毫秒值)
      const millis = Number(item[3]) * 10;
      // 转换为总秒数
      const start = second + millis * 0.001;

      // 记录歌词行信息 (将 总秒数 转换为 总毫秒数 然后作为对象的key,
      //                注意: 必须使用整数作为对象的key, 否则顺序得不到保证)
      map[second * 1000 + millis] = { start, end: -1, content };
    }
  }

  // 解析歌词翻译内容
  for (const translation of translations) {
    if (!translation) {
      continue;
    }

    // 尝试匹配当前行的歌词信息
    const matched = translation.matchAll(regex);
    // 将匹配信息转换为普通数组
    const matchedArray = matched ? Array.from(matched) : null;

    if (!matchedArray || matchedArray.length === 0) {
      continue;
    }

    // 获取最后一个匹配项
    const lastMatched = matchedArray[matchedArray.length - 1];
    // 歌词文本内容的起始索引
    const start = (lastMatched.index || 0) + lastMatched[0].length;
    // 获取歌词文本
    const content = translation.slice(start);

    // 若翻译文本是 '//' , 则跳过
    if (content === '//') {
      continue;
    }

    for (const item of matchedArray) {
      // 提取匹配到的总秒数
      const second = Number(item[1]) * 60 + Number(item[2]);
      // 提取匹配到的毫秒数(乘以10后才是毫秒值)
      const millis = Number(item[3]) * 10;

      // 获取已经读取并转换的歌词信息
      const lyricLine = map[second * 1000 + millis];

      // 若存在则为其指定翻译文本
      lyricLine && (lyricLine.translation = content);
    }
  }

  const keys = Object.keys(map),
    max = keys.length - 1;

  // 将map信息对象转为数组对象
  const list = keys.map((key, index) => {
    const value = map[key];

    value.end =
      index < max
        ? // 当前行的结束时间指定为下一行的开始时间
          map[keys[index + 1]].start
        : // 最后一行结束时间是接近无限的(相对于 移位运算 来说)
          1 << 30;

    return value;
  });

  // 去除所有空白行
  return list.filter(line => !!line.content);
};

/*****************************************************************
 *                    module: ThreadUtil                         *
 *****************************************************************/

/**
 * 睡眠指定的时间
 *
 * @param timeout 睡眠超时(单位:毫秒)
 */
export const sleep = (timeout = 3000) =>
  new Promise<null>(resolve => setTimeout(() => resolve(null), Math.max(timeout, 3000)));

/*****************************************************************
 *                   module: MD5Util (来源于互联网)               *
 *****************************************************************/

/**
 * 获取字符序列对应的MD5字符序列
 *
 * @param sequence 需要转换的字符串
 */
export const md5 = (sequence: string) => {
  const md5RotateLeft = (value: number, shiftBits: number) => {
    return (value << shiftBits) | (value >>> (32 - shiftBits));
  };

  const md5AddUnsigned = (x: number, y: number) => {
    const lx8 = x & 0x80000000;
    const ly8 = y & 0x80000000;
    const lx4 = x & 0x40000000;
    const ly4 = y & 0x40000000;
    const value = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (lx4 & ly4) {
      return value ^ 0x80000000 ^ lx8 ^ ly8;
    }
    if (lx4 | ly4) {
      if (value & 0x40000000) {
        return value ^ 0xc0000000 ^ lx8 ^ ly8;
      } else {
        return value ^ 0x40000000 ^ lx8 ^ ly8;
      }
    } else {
      return value ^ lx8 ^ ly8;
    }
  };

  const md5F = (x: number, y: number, z: number) => {
    return (x & y) | (~x & z);
  };

  const md5G = (x: number, y: number, z: number) => {
    return (x & z) | (y & ~z);
  };

  const md5H = (x: number, y: number, z: number) => {
    return x ^ y ^ z;
  };

  const md5I = (x: number, y: number, z: number) => {
    return y ^ (x | ~z);
  };

  const md5FF = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
    a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5F(b, c, d), e), g));
    return md5AddUnsigned(md5RotateLeft(a, f), b);
  };

  const md5GG = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
    a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5G(b, c, d), e), g));
    return md5AddUnsigned(md5RotateLeft(a, f), b);
  };

  const md5HH = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
    a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5H(b, c, d), e), g));
    return md5AddUnsigned(md5RotateLeft(a, f), b);
  };

  const md5II = (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => {
    a = md5AddUnsigned(a, md5AddUnsigned(md5AddUnsigned(md5I(b, c, d), e), g));
    return md5AddUnsigned(md5RotateLeft(a, f), b);
  };

  const md5ConvertToWordArray = (sequence: string) => {
    const numberOfWordsTemp1 = sequence.length + 8;
    const numberOfWordsTemp2 = (numberOfWordsTemp1 - (numberOfWordsTemp1 % 64)) / 64;
    const numberOfWords = (numberOfWordsTemp2 + 1) * 16;
    const wordArray = Array(numberOfWords - 1);
    let wordCount,
      bytePosition = 0,
      byteCount = 0;
    while (byteCount < sequence.length) {
      wordCount = (byteCount - (byteCount % 4)) / 4;
      bytePosition = (byteCount % 4) * 8;
      wordArray[wordCount] = wordArray[wordCount] | (sequence.charCodeAt(byteCount) << bytePosition);
      byteCount++;
    }
    wordCount = (byteCount - (byteCount % 4)) / 4;
    bytePosition = (byteCount % 4) * 8;
    wordArray[wordCount] = wordArray[wordCount] | (0x80 << bytePosition);
    wordArray[numberOfWords - 2] = sequence.length << 3;
    wordArray[numberOfWords - 1] = sequence.length >>> 29;
    return wordArray;
  };

  const md5WordToHex = (value: number) => {
    let hexValue = '',
      hexValueTemp = '',
      byte: number,
      count;
    for (count = 0; count <= 3; count++) {
      byte = (value >>> (count * 8)) & 255;
      hexValueTemp = '0' + byte.toString(16);
      hexValue = hexValue + hexValueTemp.substring(hexValueTemp.length - 2);
    }
    return hexValue;
  };

  const md5Utf8Encode = (sequence: string) => {
    sequence = sequence.replace(/\r\n/g, '\n');
    let value = '';
    for (let n = 0; n < sequence.length; n++) {
      const c = sequence.charCodeAt(n);
      if (c < 128) {
        value += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        value += String.fromCharCode((c >> 6) | 192);
        value += String.fromCharCode((c & 63) | 128);
      } else {
        value += String.fromCharCode((c >> 12) | 224);
        value += String.fromCharCode(((c >> 6) & 63) | 128);
        value += String.fromCharCode((c & 63) | 128);
      }
    }
    return value;
  };

  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  const S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  const S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  const x = md5ConvertToWordArray(md5Utf8Encode(sequence));
  let a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a,
      BB = b,
      CC = c,
      DD = d;

    a = md5FF(a, b, c, d, x[k], S11, 0xd76aa478);
    d = md5FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = md5FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = md5FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = md5FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = md5FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = md5FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = md5FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = md5FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = md5FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = md5FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = md5FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = md5FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = md5FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = md5FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = md5FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = md5GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = md5GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = md5GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = md5GG(b, c, d, a, x[k], S24, 0xe9b6c7aa);
    a = md5GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = md5GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = md5GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = md5GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = md5GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = md5GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = md5GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = md5GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = md5GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = md5GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = md5GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = md5GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = md5HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = md5HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = md5HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = md5HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = md5HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = md5HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = md5HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = md5HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = md5HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = md5HH(d, a, b, c, x[k], S32, 0xeaa127fa);
    c = md5HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = md5HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = md5HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = md5HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = md5HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = md5HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = md5II(a, b, c, d, x[k], S41, 0xf4292244);
    d = md5II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = md5II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = md5II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = md5II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = md5II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = md5II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = md5II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = md5II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = md5II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = md5II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = md5II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = md5II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = md5II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = md5II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = md5II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = md5AddUnsigned(a, AA);
    b = md5AddUnsigned(b, BB);
    c = md5AddUnsigned(c, CC);
    d = md5AddUnsigned(d, DD);
  }
  return md5WordToHex(a) + md5WordToHex(b) + md5WordToHex(c) + md5WordToHex(d);
};
