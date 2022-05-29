// webpack默认配置可以通过 "vue inspect > output.js" 命令查看
const path = require('path');
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    runtimeCompiler: true,
    assetsDir: 'public',
    publicPath: isProd ? './' : '/',
    productionSourceMap: true,
    // 打包输出路径
    outputDir: 'dist_electron',

    // 关闭语法检查
    // lintOnSave: false,

    // webpack的相关配置
    configureWebpack: {
        entry: './src/renderer/main.ts',
        resolve: {
            extensions: ['.js', '.vue', '.json', '.ts', '.less'],
            alias: {'@': path.join(__dirname, 'src/renderer')}
        },

        // 性能警告修改
        performance: {
            hints: 'warning',
            // 入口起点的最大体积 整数类型（以字节为单位）
            maxEntrypointSize: 50000000,
            // 生成文件的最大体积 整数类型（以字节为单位 300k）
            maxAssetSize: 30000000,
            // 只给出 js 文件的性能提示
            assetFilter: function (assetFilename) {
                return assetFilename.endsWith('.js')
            }
        }
    },
    // chainWebpack: config => {
    ////分析插件
    // config.plugin("webpack-bundle-analyzer")
    //   .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin).end();
    // },

    // 构建时开启多进程处理 babel 编译
    //   parallel: require('os').cpus().length > 1,
    css: {
        // 是否使用css分离插件 ExtractTextPlugin
        extract: isProd,
        // 开启 CSS source maps?
        sourceMap: !isProd,
        // css预设器配置项
        loaderOptions: {
            less: {
                modifyVars: {
                    'primary-color': '#c62f2f',
                    'link-color': '#c62f2f',
                    'border-radius-base': '4px'
                },
                javascriptEnabled: true
            }
        },
        // 启用 CSS modules for all css / pre-processor files.
        requireModuleExtension: true
    },
    // 开发服务器http代理
    devServer: {
        open: !process.argv.includes('electron:serve'),
        host: 'localhost',
        port: 9080,
        https: false,
        hotOnly: false,
        proxy: {
            '/api': {
                target: 'http://localhost:9081/api',    // 代理 '/api'
                changeOrigin: true,                     // 是否跨域
                ws: true,                               // 代理长连接
                pathRewrite: {'^/api': ''}              // 重写路径,将路径替换,避免打包后,放到服务器,不能访问
            },
            '/socket': {
                target: 'ws://localhost:9999/',
                ws: true
            },
        }
    },
    // 第三方插件配置
    pluginOptions: {
        // vue-cli-plugin-electron-builder配置
        electronBuilder: {
            preload: 'src/main/preload.ts',         // 渲染页面预加载文件
            outputDir: 'dist_electron',             // 输出目录
            mainProcessFile: 'src/main/main.ts',    // 主进程文件
            mainProcessWatch: ['src/main'],         // 监听此目录下所有文件的变化
            customFileProtocol: '/',                // 自定义文件协议(使用/表示在服务器上的根路径), 默认是 'app://./'
            builderOptions: {
                win: {
                    icon: 'public/icon/icon.ico',
                    // 图标路径 windows系统中icon需要256*256的ico格式图片，更换应用图标亦在此处
                    target: [{
                        // 打包成一个独立的 exe 安装程序
                        target: 'nsis',
                        // 这个意思是打出来32 bit + 64 bit的包，但是要注意：这样打包出来的安装包体积比较大，所以建议直接打32的安装包。
                        arch: ['x64'] // 'ia32'
                    }]
                },
                dmg: {
                    contents: [
                        {x: 410, y: 150, type: 'link', path: '/Applications'},
                        {x: 130, y: 150, type: 'file'}
                    ]
                },
                linux: {icon: 'src/assets/icons/icon.png', target: 'AppImage'},
                mac: {icon: 'src/assets/icons/icon.icns'},
                files: ['**/*'],
                asar: false,
                nsis: {
                    // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装（one-click installer）
                    oneClick: false,
                    // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    allowElevation: true,
                    // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
                    allowToChangeInstallationDirectory: true,
                    // // 安装图标
                    installerIcon: 'public/icon/icon.ico',
                    // // 卸载图标
                    uninstallerIcon: 'public/icon/icon.ico',
                    // // 安装时头部图标
                    installerHeaderIcon: 'public/icon/icon.ico',
                    // 创建桌面图标
                    createDesktopShortcut: true,
                    // 创建开始菜单图标
                    createStartMenuShortcut: true
                }
            },
            chainWebpackMainProcess: config => {
                config.plugin('define').tap(args => {
                    args[0]['IS_ELECTRON'] = true
                    return args
                })
            },
            chainWebpackRendererProcess: config => {
                config.plugin('define').tap(args => {
                    args[0]['IS_ELECTRON'] = true
                    return args
                })
            }
        }
    }
}
