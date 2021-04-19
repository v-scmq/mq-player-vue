import {app, protocol, Tray, Menu, BrowserWindow, ipcMain, net} from 'electron';
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';

let iconPath = process.env.NODE_ENV === 'production' ?
    path.resolve(__dirname, 'icon') : 'public/icon';

// 方案必须在应用程序准备好之前注册
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}}
])

let appPath = app.getAppPath();
app.setPath('logs', `${appPath}/logs`);
app.setPath('temp', `${appPath}/temp`);
app.setPath('cache', `${appPath}/cache`);
app.setPath('appData', `${appPath}/appData`);
app.setPath('userData', `${appPath}/userData`);
app.setPath('crashDumps', `${appPath}/crashDumps`);

// 主进程浏览器窗口, 系统托盘
let mainWindow = null, tray = null;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        frame: false,
        backgroundColor: 'rgb(236, 236, 236)',
        webPreferences: {
            nodeIntegration: true,// process.env.ELECTRON_NODE_INTEGRATION
            enableRemoteModule: false,// 必须开启远程模块,否则不能使用在渲染进程中使用
            zoomFactor: 0.8, // 设置80%的默认缩放比例
            webSecurity: false, // 默认为true,设置为false关闭web安全策略(如同源策略)
        }
    })

    mainWindow.once("ready-to-show", () => {
        createTray();
        setWindowThumbBarButton();
        mainWindow.openDevTools();
        mainWindow.webContents.setZoomFactor(0.8);
    })

    // 若在生产环境
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL).then(() => mainWindow.show());
        mainWindow.webContents.openDevTools()
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        mainWindow.loadURL('app://./index.html').then(() => mainWindow.show());
    }

    // 当浏览器窗口关闭时,解除mainWindow引用指向
    mainWindow.once('closed', () => mainWindow = null);
    // 当浏览器窗口最大化时,发送窗口最大化消息到渲染进程
    mainWindow.on('maximize', () => mainWindow.webContents.send('maximized'));
    // 当浏览器窗口还原时,发送窗口还原消息到渲染进程
    mainWindow.on('unmaximize', () => mainWindow.webContents.send('restored'));

    // 在渲染进程中,请求最小化浏览器窗口
    ipcMain.on('window-minimize', () => mainWindow.minimize());

    // 在渲染进程中,请求最大化或还原浏览器窗口
    ipcMain.on('window-maximize-restore', () =>
        mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize());

    // 在渲染进程中,请求关闭浏览器窗口
    ipcMain.on('window-close', () => mainWindow.close());

    // 在渲染进程中,请求获取窗口状态.在主进程中返回状态到渲染进程
    ipcMain.handle('request-window-state', () => mainWindow.isMaximized());

    // 在渲染进程中,请求主进程清除浏览记录
    ipcMain.handle('request-clear-history', () => mainWindow.webContents.clearHistory());

    // 在渲染进程中,请求主进程发起网络请求,主进程将响应信息返回到渲染进程
    ipcMain.handle('net-request', handleNetRequest);
}

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法 有些API只能在事件发生后使用
app.on('ready', () => {
    // 注册自定义文件协议,解决高版本electron不能加载本地文件的问题,同时此方案仍然保留web安全策略
    // request请求包含原始请求URL和header等信息,callback回调用于将文件绝对路径传入并做响应信息处理
    protocol.registerFileProtocol('file', (request, callback) =>
        callback(decodeURI(request.url.replace('file:///', ''))));
    createWindow();
});

// 当所有窗口关闭后结束进程
app.on('window-all-closed', () => process.platform !== 'darwin' ? app.quit() : null);

// 在macOS上，当单击dock图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口。
app.on('activate', () => BrowserWindow.getAllWindows() ? createWindow() : null);

// 应请求以开发模式从父进程中干净地退出。
if (process.env.NODE_ENV !== 'production') {
    if (process.platform === 'win32') {
        process.on('message', data => data === 'graceful-exit' ? app.quit() : null)
    } else {
        process.on('SIGTERM', () => app.quit());
    }
}

const setWindowThumbBarButton = () => {
    let prevIcon = `${iconPath}/prev.png`, nextIcon = `${iconPath}/next.png`;
    let playIcon = `${iconPath}/play.png`, pauseIcon = `${iconPath}/pause.png`;

    let playing = false;

    mainWindow.setThumbarButtons([
        {
            tooltip: '上一曲',
            icon: prevIcon,
            click: () => console.info("prev...")
        },
        {
            tooltip: playing ? '暂停' : '播放',
            icon: playing ? pauseIcon : playIcon,
            click: () => console.info("play...")
        },
        {
            tooltip: '下一曲',
            icon: nextIcon,
            click: () => console.info("next...")
        }
    ]);
    mainWindow.setThumbnailClip({x: 0, y: 0, width: 200, height: 100});
}

const createTray = () => {
    // 注意tray需要声明为全局变量,否则会被自动回收对象,导致自动销毁系统托盘
    tray = new Tray(`${iconPath}/tray.ico`);
    let contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio', checked: true},
        {label: 'Item3', click: () => console.info("item3 clicked")},
        {label: "Item4"}
    ]);
    tray.setToolTip('MQ音乐,聆听世界的声音！');
    tray.setTitle("MQ音乐");
    tray.setContextMenu(contextMenu);
    tray.on("right-click", (keyEvent, rectangle) => {
        console.info("event = ", keyEvent);
        console.info("rect = ", rectangle);
    });
};

/**
 * 处理来自渲染进程准备发起的网络请求,最后将响应信息返回到渲染进程
 * @param event {IpcMainInvokeEvent} 渲染进程 => 主进程被调用事件
 * @param options {ClientRequestConstructorOptions} 从渲染进程传递过来的参数
 *  @return {Promise}
 */
const handleNetRequest = (event, options) => new Promise(resolve => {
    console.info('============== handleNetRequest ===============')
    console.info('config=>', options);

    let request = net.request(options), headers = options['headers'];
    // 若选项中存在header配置信息,则先设置请求头
    if (headers) {
        Object.keys(headers).forEach(key => request.setHeader(key, headers[key]));
    }

    // 监听网络响应
    request.on('response', response => {
        console.log('STATUS = ', response.statusCode);
        console.log('HEADERS = ', JSON.stringify(response.headers));
        console.info('STATUS-MESSAGE = ', response.statusMessage, '\n\n\n');

        // 接收响应数据
        let data = '';
        // 数据得到响应时,拼接响应数据
        response.on('data', chunk => data += chunk.toString());
        // 数据响应完成时,promise对象状态变为resolved以将数据返回
        response.on('end', () => resolve(data));
        // 数据响应失败
        response.on('error', () => response(null));
    });

    // 当前网络请求发生错误时
    request.on('error', error => {
        console.info('error=>', error);
        resolve(error.toString());
    });

    let data = options['data'];
    // post请求时且存在数据时,将数据通过输出流管道发送到目标服务器
    if ((options.method === 'post' || options.method === 'POST') && data) {
        // 写入数据(String | Buffer)
        data = ((data instanceof Buffer) || (typeof data) === 'string') ? data :
            (typeof data) === 'object' ? JSON.stringify(data) : data.toString();
        request.write(data);
    }

    // 当网络请求完成后
    request.on('finish', () => console.info('请求完成！'));
    request.end();
});

