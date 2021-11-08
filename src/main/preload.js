const fs = require('fs');
import * as mm from 'music-metadata';
import {contextBridge, ipcRenderer} from 'electron';

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
     * @param {Function} callback 待执行回调方法
     */
    setOnWindowMaximized: callback => ipcRenderer.on('maximized', callback),

    /**
     * 当窗口还原时,执行特定的回调方法
     *
     * @param {Function} callback 待执行回调方法
     */
    setOnWindowRestore: callback => ipcRenderer.on('restored', callback),

    /**
     * @typedef ModalOpenOption 打开模态框时所需的配置选项
     *
     * @property {string} url URL地址
     * @property {string} indexURL 重定向后的首页地址
     * @property {number} width 模态框宽度
     * @property {number} height 模态框高度
     * @property {string} preloadName 模态框预加载js文件名
     */

    /**
     * 打开一个模态框,并获取所加载页面的cookie信息
     *
     * @param {ModalOpenOption} param 打开模态框的配置选项
     * @returns {Promise<string>} 返回模态框(窗口)所加载的页面的cookie信息
     */
    openModal: param => ipcRenderer.invoke('open-modal', JSON.stringify(param)),

    /**
     * 移除指定网页的cookie信息
     *
     * @param {string} url 需要移除cookie的URL
     * @returns {Promise<any>}
     */
    removeAllCookie: (url) => ipcRenderer.invoke('remove-all-cookie', url),

    /** 清除浏览器历史记录 */
    clearHistory: () => ipcRenderer.invoke('clear-history'),

    /**
     * 使用Electron原生网络层API发出网络请求
     *
     * @param options 网络请求配置选项
     * @returns {Promise<any>} http/https响应内容
     */
    netRequest: options => ipcRenderer.invoke('net-request', options),

    /**
     * 解析媒体文件,并获取媒体元数据信息
     *
     * @param {string} path 媒体资源路径
     * @param {mm.IOptions} options 解析配置选项
     * @returns {Promise<mm.IAudioMetadata>} 媒体元数据信息
     */
    parseFile: (path, options = undefined) => mm.parseFile(path, options),

    /**
     * 创建指定路径的目录(文件夹)
     *
     * @param {string} path 文件夹路径
     */
    mkDirs: path => fs.mkdirSync(path, {recursive: true}),

    /**
     * 强制删除一个目录
     *
     * @param {string} path 目录路径
     */
    rmDir: path => fs.rmdirSync(path, {recursive: true}),

    /**
     * 强制删除文件
     *
     * @param {string} path 文件路径
     */
    rmFile: path => fs.rmSync(path, {force: true, recursive: true}),

    /**
     * 将数据(Buffer)写入到指定的文件中.
     *
     * @param {string} path 文件路径
     * @param {string | NodeJS.ArrayBufferView} buffer 数据
     */
    writeFile: (path, buffer) => fs.writeFileSync(path, buffer),

    /**
     * 读取指定路径的文件
     *
     * @param {string} path 文件路径
     * @param {{ encoding?: null | undefined; flag?: string | undefined; }} options 配置选项
     * @returns {Buffer} Buffer类型的二进制数据
     */
    readFile: (path, options) => fs.readFileSync(path, options),

    /**
     * 通过检查文件系统，检查指定路径是否存在
     *
     * @param {string} path 文件或目录 路径
     * @returns {boolean} 若指定的路径是否存在,则返回true
     */
    exists: path => fs.existsSync(path),

    /**
     * 检查指定路径的是否是文件. 不能在此处直接返回路径状态信息, 因为 module:fs.Stats是一个类,
     * 它所包含的的方法是不能直接在隔离后的渲染进程中所用, 必须返回一个简单类型的数据
     *
     * @param {string} path 目标路径
     * @returns {boolean} 若是指定路径是文件,则返回true
     */
    isFile: path => fs.statSync(path).isFile(),

    /**
     * 检查指定路径的是否是目录(文件夹). 不能在此处直接返回路径状态信息, 因为 module:fs.Stats是一个类,
     * 它所包含的的方法是不能直接在隔离后的渲染进程中所用, 必须返回一个简单类型的数据
     *
     * @param {string} path 目标路径
     * @returns {boolean} 若是指定路径是目录,则返回true
     */
    isDirectory: path => fs.statSync(path).isDirectory(),

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
    shutdown: force => ipcRenderer.invoke('shutdown', force)
});