const fs = require('fs');
import * as mm from 'music-metadata';
import {contextBridge, ipcRenderer} from 'electron';

import {ModalOpenOption, WindowStateListener} from '../types';

// 将api注入到window对象上
contextBridge.exposeInMainWorld('electron', {
    /** 设置窗口最小化 */
    setWindowMinimize: () => ipcRenderer.invoke('window-minimize'),

    /** 设置最大化或还原窗口 */
    setWindowMaximizeOrRestore: () => ipcRenderer.invoke('window-maximize-restore'),

    /**
     * 获取窗口状态(这里特指是否非全屏的最大化)
     *
     * @returns {Promise<boolean>} 异步Promise对象,最大化为true
     * */
    getWindowState: () => ipcRenderer.invoke('get-window-state'),

    /**
     * 当窗口最小化时,执行特定的回调方法
     *
     * @param callback 待执行回调方法. 若为null将移除监听器
     * @param callbackId  回调方法句柄id(用于关联Function对象, 需要保证唯一性)
     */
    onWindowStateChange: (callback: WindowStateListener | null, callbackId: string) => {
        const channel = 'maximize';

        if (callback) {
            /*
             * TODO 从渲染进程传到preload中的callback已经不是同一个Function对象,
             *      可理解为方法 实参 和 形参 不是通一个Function对象
             *  解决方案: 从方法参数传递一个唯一关联callback(Function)的id, 在preload中为发生了变化的callback绑定id
             */
            (<any>callback)['$callbackId'] = callbackId;
            ipcRenderer.addListener(channel, callback);

        } else {
            // 获取所有监听器, 循环找callbackId, 若找到匹配的则移除
            ipcRenderer.listeners(channel).forEach((listener: any) => {
                if (listener['$callbackId'] === callbackId) {
                    ipcRenderer.removeListener(channel, listener);
                    delete listener['$callbackId'];
                }
            });
        }
    },


    /**
     * 打开一个模态框,并获取所加载页面的cookie信息
     *
     * @param param 打开模态框的配置选项
     * @returns {Promise<string>} 返回模态框(窗口)所加载的页面的cookie信息
     */
    openModal: (param: ModalOpenOption): Promise<string> =>
        ipcRenderer.invoke('open-modal', JSON.stringify(param)),

    /**
     * 移除指定网页的cookie信息
     *
     * @param url 需要移除cookie的URL
     * @returns {Promise<any>}
     */
    removeAllCookie: (url: string) => ipcRenderer.invoke('remove-all-cookie', url),

    /** 清除浏览器历史记录 */
    clearHistory: () => ipcRenderer.invoke('clear-history'),

    /**
     * 解析媒体文件,并获取媒体元数据信息
     *
     * @param path 媒体资源路径
     * @param options 解析配置选项
     * @returns {Promise<mm.IAudioMetadata>} 媒体元数据信息
     */
    parseFile: (path: string, options: mm.IOptions | undefined) => mm.parseFile(path, options),

    /**
     * 创建指定路径的目录(文件夹)
     *
     * @param path 文件夹路径
     */
    mkDirs: (path: string) => fs.mkdirSync(path, {recursive: true}),

    /**
     * 强制删除一个目录
     *
     * @param path 目录路径
     */
    rmDir: (path: string) => fs.rmdirSync(path, {recursive: true}),

    /**
     * 强制删除文件
     *
     * @param path 文件路径
     */
    rmFile: (path: string) => fs.rmSync(path, {force: true, recursive: true}),

    /**
     * 将数据(Buffer)写入到指定的文件中.
     *
     * @param path 文件路径
     * @param buffer 数据
     */
    writeFile: (path: string, buffer: string | NodeJS.ArrayBufferView) => fs.writeFileSync(path, buffer),

    /**
     * 读取指定路径的文件
     *
     * @param path 文件路径
     * @param options 配置选项
     * @returns {Buffer} Buffer类型的二进制数据
     */
    readFile: (path: string, options: { encoding?: null | undefined; flag?: string | undefined }) =>
        fs.readFileSync(path, options),

    /**
     * 通过检查文件系统，检查指定路径是否存在
     *
     * @param path 文件或目录 路径
     * @returns {boolean} 若指定的路径是否存在,则返回true
     */
    exists: (path: string) => fs.existsSync(path),

    /**
     * 检查指定路径的是否是文件. 不能在此处直接返回路径状态信息, 因为 module:fs.Stats是一个类,
     * 它所包含的的方法是不能直接在隔离后的渲染进程中所用, 必须返回一个简单类型的数据
     *
     * @param path 目标路径
     * @returns {boolean} 若是指定路径是文件,则返回true
     */
    isFile: (path: string) => fs.statSync(path).isFile(),

    /**
     * 检查指定路径的是否是目录(文件夹). 不能在此处直接返回路径状态信息, 因为 module:fs.Stats是一个类,
     * 它所包含的的方法是不能直接在隔离后的渲染进程中所用, 必须返回一个简单类型的数据
     *
     * @param path 目标路径
     * @returns {boolean} 若是指定路径是目录,则返回true
     */
    isDirectory: (path: string) => fs.statSync(path).isDirectory(),

    /**
     * 获取应用程序运行时进程所在的根路径
     *
     * @return {Promise<string>} 应用程序运行时进程所在的根路径
     */
    getAppPath: () => ipcRenderer.invoke('get-app-path'),

    /**
     * 关闭计算机
     *
     * @param {boolean} force 是否强制关机
     * @returns {Promise<any>} Promise对象
     */
    shutdown: (force: boolean) => ipcRenderer.invoke('shutdown', force)
});