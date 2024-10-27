type Utils = {
  toList(files: FileList): File[];
  toList(list: DOMStringList): string[];
};

export const List = Array;

export const isArray = List.isArray;

export const toList: Utils['toList'] = ((list: FileList | DOMStringList) => {
  const array = new List(list.length);

  for (let i = list.length - 1; i >= 0; --i) {
    array[i] = list[i];
  }

  return array;
}) as any;

export const debounce = (fn: Function, wait = 1000, immediate?: boolean) => {
  let timer: number | null = null;

  return function (...args: any) {
    // @ts-ignore
    const ctx = this;
    timer && clearTimeout(timer);

    if (immediate && !timer) fn.apply(ctx, args);
    setTimeout(() => fn.apply(ctx, args), wait);
  };
};

/***************************************************************
 *                    module: TimeUtil                         *
 ***************************************************************/
/**
 * 将一个秒数时间值转换为 00:00 或 00:00:00的时间格式字符串
 *
 * @param value 总秒数
 */
export const formatTime = (value: number) => {
  // 浮点数转换为整数可以使用 0 ^ 1.23232 = 1
  value = 0 ^ value;
  let v = '';
  let num: number;

  // 获取总秒数包含的小时数
  if (value >= 3600) {
    num = 0 ^ (value / 3600);
    v += num < 10 ? '0' + num + ':' : num + ':';
    // 计算剩余的总秒数
    value %= 3600;
  }

  // 计算包含的分钟数如果小于60,则分钟数为0
  num = value < 60 ? 0 : 0 ^ (value / 60);
  // 如果数字小于10,补0
  v += num < 10 ? '0' + num + ':' : num + ':';
  // 计算秒数如果小于60,则秒数为time,否则为 time % 60
  num = value < 60 ? value : value % 60;
  return num < 10 ? v + '0' + num : v + num;
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
export const toFileSize = (size: number, scale = 2) => {
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
  return `${(size / MB).toFixed(scale)}GB`;
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
