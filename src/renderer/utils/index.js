export class TimeUtil {
    /**
     * 将毫秒时间值转换为 00:00 或 00:00:00的时间格式字符串
     *
     * @param millis {Number} 毫秒时间值
     * @return {String} 毫秒表示的时间字符串
     */
    static millisToString(millis) {
        // 先将总毫秒数转换为总秒数,然后交给总秒数转换为标准时间值的方法处理
        return this.secondToString(millis / 1000);
    }

    /**
     * 将一个秒数时间值转换为 00:00 或 00:00:00的时间格式字符串
     *
     * @param value {Number} 总秒数
     * @return {String} 秒数表示的标准时间字符串
     */
    static secondToString(value) {
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
}

export class FileUtil {
    /**
     * 解决字符序列不能用于Windows操作系统平台的文件或文件夹名称.
     * 对于Windows平台,文件或文件夹名称一定不能包含 “{@code / \ * ? " : | < >}”中的任一字符.
     *
     * @param name {String | Array | Object} 文件或文件夹名称
     * @return String 标准的文件或文件夹名称
     */
    static resolveFileName(name) {
        if (!name) return name;

        let replace, values = [...name];
        for (let index = values.length - 1; index >= 0; --index) {
            let c = values[index] = name.charAt(index);
            if (c === '/' || c === '\\' || c === '*' || c === '?' || c === '"'
                || c === ':' || c === '|' || c === '<' || c === '>') {
                values[index] = '~';
                replace = true;
            }
        }
        return replace ? values.join('') : name;
    }


    /**
     * 文件大小格式化
     *
     * @param scale {Number} 精度
     * @param size {Number} 文件字节大小
     * @return {String} 返回格式化后的文件大小的字符串表示
     */
    static toFileSize(scale, size) {
        let B = 1024;
        if (size < B) {
            return `${size}B`;
        }
        let KB = 1048576;
        if (size < KB) {
            return `${(size / B).toFixed(2)}KB`;
        }
        let MB = 1073741824;
        if (size < MB) {
            return `${(size / KB).toFixed(2)}MB`;
        }
        // let GB = 1099511627776L;
        if (size < 1099511627776) {
            return `${(size / MB).toFixed(2)}GB`;
        }
        return "";
    }

    /**
     *  从文件对象获取歌手名称、歌曲标题、专辑(使用标题)、文件大小、文件路径(临时URL创建)
     * @param file {File} 文件对象
     * @param isElectron {boolean} 是否在Electron进程中
     * @return {{path: String, singer: String, size: String, album: String, title: String}} 媒体基本信息
     */
    static getMediaInfo(file, isElectron) {
        let title = file.name;
        title = title.substring(0, title.lastIndexOf('.'))
        let index = title.indexOf('-');
        let singer = title.substring(0, index);
        title = title.substring(index + 1);

        // 若是electron 不再获取 文件大小和路径
        let size = isElectron ? null : FileUtil.toFileSize(2, file.size);
        let path = isElectron ? null : URL.createObjectURL(file);

        return {title, album: title, singer, size, path};
    }
}