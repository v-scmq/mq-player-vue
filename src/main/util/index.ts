import type { LyricLine } from '@/types';

/***************************************************************
 *                    module: TimeUtil                         *
 ***************************************************************/
/**
 * 将一个秒数时间值转换为 00:00 或 00:00:00的时间格式字符串
 *
 * @param second 总秒数
 */
export const formatTime = (second: number) => {
  // 浮点数转换为整数可以使用 0 ^ 1.23232 = 1
  second = 0 ^ second;
  let v = '';
  let n: number;

  // 获取总秒数包含的小时数
  if (second >= 3600) {
    n = 0 ^ (second / 3600);
    v += n < 10 ? '0' + n + ':' : n + ':';
    // 计算剩余的总秒数
    second %= 3600;
  }

  // 计算包含的分钟数如果小于60,则分钟数为0
  n = second < 60 ? 0 : 0 ^ (second / 60);
  // 如果数字小于10,补0
  v += n < 10 ? '0' + n + ':' : n + ':';
  // 计算秒数如果小于60,则秒数为time,否则为 time % 60
  n = second < 60 ? second : second % 60;
  return n < 10 ? v + '0' + n : v + n;
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
export const readLyric = (text: string, translation?: string): LyricLine[] => {
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
        ? map[keys[index + 1]].start // 当前行的结束时间指定为下一行的开始时间
        : 1 << 30; // 最后一行结束时间是接近无限的(相对于 移位运算 来说)

    return value;
  });

  // 去除所有空白行
  return list.filter(line => !!line.content);
};
