import path from 'path';
import {app, BrowserWindow, ipcMain, Menu, shell, Tray} from 'electron';

import {ModalOpenOption} from '../types';
import NativeImage = Electron.NativeImage;
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;

// 检查是否是生产模式
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !app.requestSingleInstanceLock()) {
    // 若未能获得单个应用实例的锁,那么退出应用程序
    app.quit();

} else {
    /****************************************************************
     *  应用程序就绪之前,获取环境配置以及注册自定义协议和设置程序资源路径 *
     *  检查是否是 windows 平台                                      *
     ****************************************************************/
    const isWindows = process.platform === 'win32';

    // 获取图标路径
    const iconPath = isProduction ? path.resolve(__dirname, 'icon') : 'public/icon';

    // 创建本地服务器, 并获取本地服务器URL
    const {BASE_URL} = require('./server');

    // 方案必须在应用程序准备好之前注册
    // if (isProduction) {
    //     let scheme = {scheme: 'app', privileges: {secure: true, standard: true, corsEnabled: true}};
    //     protocol.registerSchemesAsPrivileged([scheme]);
    // }

    app.setPath('logs', `${app.getAppPath()}/logs`);
    app.setPath('temp', `${app.getAppPath()}/temp`);
    app.setPath('cache', `${app.getAppPath()}/cache`);
    app.setPath('appData', `${app.getAppPath()}/appData`);
    app.setPath('userData', `${app.getAppPath()}/userData`);
    app.setPath('crashDumps', `${app.getAppPath()}/crashDumps`);

    // 监听应用程序就绪事件,就绪后后创建浏览器窗口和注册自定义的协议等
    // 主进程浏览器窗口, 系统托盘, 模态框内容视图(BrowserView)
    let mainWindow: BrowserWindow, modal: BrowserWindow, tray: Tray;

    // 监听第2个应用程序实例,当程序被再次打开,那么聚焦显示主窗口
    app.on('second-instance', () => mainWindow.focus());

    // 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法 有些API只能在事件发生后使用
    app.on('ready', () => {
        // 创建浏览器主窗口
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            frame: false,
            backgroundColor: 'rgb(236, 236, 236)',
            webPreferences: {preload: `${__dirname}/preload.js`, nativeWindowOpen: true}
            // webPreferences: {
            //     nodeIntegration: false,             // 关闭NodeJS集成
            //     contextIsolation: true,             // 开启上下文隔离限制(从版本12.0开始默认为true)
            //     webSecurity: true,                  // 默认为true,设置为false将关闭web安全策略(如同源策略)
            //     enableRemoteModule: false,          // 关闭远程模块,(最佳方案:使用ipcMain和ipcRender代替)
            //     zoomFactor: 0.8,                    // 设置浏览器窗口为80%的默认缩放比例(窗口显示后设置,否则很容易失效)
            //     preload: `${__dirname}/preload.js`
            // }
        });

        // 若在生产环境
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            // 加载开发模式服务器的URL
            mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL).then(onReady);
            mainWindow.webContents.openDevTools();
        } else {
            // 从自定义协议加载首页html文件
            mainWindow.loadURL(`${BASE_URL}/index.html`).then(onReady);
        }

        // 当浏览器窗口关闭时,解除mainWindow引用指向
        mainWindow.once('closed', () => mainWindow = null as any);
        // 当浏览器窗口最大化时,发送窗口最大化消息到渲染进程
        mainWindow.on('maximize', async () =>
            mainWindow.webContents.send('maximize', true));
        // 当浏览器窗口还原时,发送窗口还原消息到渲染进程
        mainWindow.on('unmaximize', async () =>
            mainWindow.webContents.send('maximize', false));

        // 在渲染进程中,请求最小化浏览器窗口
        ipcMain.handle('window-minimize', async () => mainWindow.minimize());

        // 在渲染进程中,请求最大化或还原浏览器窗口
        ipcMain.handle('window-maximize-restore', async () =>
            mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize());

        // 在渲染进程中,请求获取窗口状态.在主进程中返回状态到渲染进程
        ipcMain.handle('get-window-state', async () => mainWindow.isMaximized());

        // 在渲染进程中,请求主进程清除浏览记录
        ipcMain.handle('clear-history', async () => mainWindow.webContents.clearHistory());

        // 在渲染进程中,请求主进程打开浏览器视图,主进程将Cookie信息返回到渲染进程
        ipcMain.handle('open-modal', handleOpenModal);
        // 在渲染进程中,请求主进程删除指定URL下的所有Cookie信息
        ipcMain.handle('remove-all-cookie', handleRemoveAllCookie);

        // 获取应用程序运行时进程所在的根路径
        ipcMain.handle('get-app-path', async () => app.getAppPath());

        // 关闭计算机
        ipcMain.handle('shutdown', shutdown);
    });

    // 当所有窗口关闭后结束进程
    app.on('window-all-closed', () => {
        app.releaseSingleInstanceLock();
        app.quit();
    });

    // 在macOS上，当单击dock图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口。
    // app.on('activate', () => BrowserWindow.getAllWindows() ? createWindow() : null);

    // 应请求以开发模式从父进程中干净地退出。
    if (!isProduction) {
        if (isWindows) {
            process.on('message', data => data === 'graceful-exit' ? app.quit() : null)
        } else {
            process.on('SIGTERM', () => app.quit());
        }
    }

    /** 窗口已就绪,此时可以显示 */
    let onReady = () => {
        // 显示窗口(将onReady方法设置为null,以便释放方法对象)
        onReady = null as any;
        mainWindow.show();
        // 若不是windows平台,不创建系统托盘和设置任务栏缩略图
        if (!isWindows) {
            return
        }

        // 设置浏览器窗口为80%的默认缩放比例
        // 1 => 1 ; 1.25 => 0.8 ;  =>> zoomFactor = 1 / 屏幕缩放比例
        mainWindow.webContents.setZoomFactor(0.8);

        // 注意tray需要声明为全局变量,否则会被自动回收对象,导致自动销毁系统托盘
        tray = new Tray(`${iconPath}/tray.ico`);
        const contextMenu = Menu.buildFromTemplate([
            {label: 'Item1', type: 'radio'},
            {label: 'Item2', type: 'radio', checked: true},
            {label: 'Item3', click: () => console.info("item3 clicked")},
            {label: "Item4"}
        ]);
        tray.setTitle("MQ音乐");
        tray.setToolTip('MQ音乐,聆听世界的声音！');
        tray.setContextMenu(contextMenu);
        tray.on("right-click", (keyEvent, rectangle) => {
            console.info("event = ", keyEvent);
            console.info("rect = ", rectangle);
        });

        // windows平台下,设置任务栏缩略图
        const prevIcon = `${iconPath}/prev.png` as unknown as NativeImage;
        const nextIcon = `${iconPath}/next.png` as unknown as NativeImage;
        const playIcon = `${iconPath}/play.png` as unknown as NativeImage;
        const pauseIcon = `${iconPath}/pause.png` as unknown as NativeImage;

        const playing = false;

        mainWindow.setThumbarButtons([
            {tooltip: '上一曲', icon: prevIcon, click: () => console.info("prev...")},
            {
                tooltip: playing ? '暂停' : '播放',
                icon: playing ? pauseIcon : playIcon,
                click: () => console.info("play...")
            },
            {tooltip: '下一曲', icon: nextIcon, click: () => console.info("next...")}
        ]);
        // mainWindow.setThumbnailClip({x: 0, y: 0, width: 1920, height: 1080});
    };

    /**
     * 处理来自渲染进程请求打开模态框,最后将页面的Cookie信息返回到渲染进程
     * @param event 渲染进程 => 主进程被调用事件
     * @param options 从渲染进程传递过来的参数
     * @return {Promise<string>} 异步Promise对象
     */
    const handleOpenModal = (event: IpcMainInvokeEvent, options: string | ModalOpenOption) => new Promise(resolve => {
        const option: ModalOpenOption = (typeof options) === 'string' ? JSON.parse(<string>options) : options;

        // 若指定了预加载文件名(不包含扩展名),则获取需要执行预加载文件的全路径
        const preload = option.preloadName && `${__dirname}${isProduction ? '' : '/../public'}/${option.preloadName}.js`;

        // 若模态框未初始化,则先初始化(窗口圆角效果, 需要设置窗口透明且不能打开开发者工具,否则无效果)
        modal = new BrowserWindow({
            width: option.width, height: option.height, parent: mainWindow, modal: true,
            show: false, resizable: false, frame: false, transparent: true,
            webPreferences: {webSecurity: false, preload, nativeWindowOpen: true}
        });

        // 加载指定的URL
        modal.loadURL(option.url).then();
        // 设置页面缩放比例为80%
        modal.once('ready-to-show', () => {
            modal.show();
            modal.webContents.setZoomFactor(0.8);
        });

        // 当页面开始导航(页面跳转)
        modal.webContents.on('will-navigate', (event, url) => {
            if (option.indexURL === url) {
                let _resolve: any = resolve;
                // 将resolve方法对象设置为null, 以便在close事件中检测是否resolve过(虽然重复resolve不会有影响)
                resolve = null as unknown as any;

                const url = option.indexURL;
                const cookies = modal.webContents.session.cookies;

                cookies.get({url}).then(cookieArray => {
                    cookieArray.forEach(cookie => {
                        cookies.set({...cookie, url, sameSite: 'no_restriction', secure: true}).then();
                    });
                    _resolve(JSON.stringify(cookieArray));
                    _resolve = null;
                });

                modal.webContents.closeDevTools();
                modal.close();
            }
        });

        // 当模态框准备关闭时
        modal.once('close', () => {
            if (modal) {
                modal.webContents.closeDevTools();
                // destroy()方法返回值是void, modal将断开引用
                modal.destroy();
                modal = null as unknown as BrowserWindow;
            }
            resolve && resolve(null);
        });

        // 设置窗口打开处理器
        modal.webContents.setWindowOpenHandler(details => {
            // 使用系统默认浏览器打开模态框内的连接
            shell.openExternal(details.url).then();
            // 拒绝新窗口打开模态框内的所有连接
            return {action: 'deny'};
        });
    });

    /**
     * 处理来自渲染进程请求删除指定URL下的cookie信息
     * @param event 渲染进程 => 主进程被调用事件
     * @param url cookie对应的URL
     * @return {Promise<string>} 异步Promise对象
     */
    const handleRemoveAllCookie = (event: IpcMainInvokeEvent, url: string) => new Promise(resolve => {
        const cookies = mainWindow.webContents.session.cookies;
        cookies.get({url}).then(cookieArray => cookieArray.forEach(cookie => cookies.remove(url, cookie.name)));
        resolve(null);
    });

    /**
     * 立即关闭本地计算机
     *
     * @param event 渲染进程 => 主进程被调用事件
     * @param force 指定是否强制执行关机(仅适用于windows)
     */
    const shutdown = async (event: IpcMainInvokeEvent, force: boolean) => {
        // shutdown 命令用法:
        // windows系统可在cmd  输入 "shutdown ?"      查看
        // linux  系统可在终端 输入 "shutdown --help" 查看

        const command = process.platform === 'win32' ?
            `shutdown -p${force ? ' -f' : ''}` : 'shutdown -h now';

        const childProcess = require('child_process');
        childProcess.exec(command, (error: any) => app.exit(error ? -1 : 0));
    };
}