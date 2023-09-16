import { rmSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import pkg from './package.json';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

export default defineConfig(({ command, mode }) => {
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '');
  const buildBaseDir = env.buildDir;
  rmSync(buildBaseDir, { recursive: true, force: true });

  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe;

  return {
    // 指定读取环境变量配置的目录
    //envDir: 'env',
    build: {
      outDir: `${buildBaseDir}/${env.VITE_SERVER_STATIC}`,
      assetsDir: ''
    },

    resolve: {
      alias: [{ find: '@', replacement: `${__dirname}/src/renderer` }]
    },

    plugins: [
      vue(),
      electron([
        {
          entry: 'src/main/preload/index.ts',
          onstart(options) {
            // 当预加载脚本构建完成时,通知渲染器进程重新加载页面,而不是重新启动整个Electron应用程序。
            options.reload();
          },
          vite: {
            build: {
              sourcemap: sourcemap,
              minify: isBuild,
              outDir: `${buildBaseDir}/main/preload`,
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
              }
            }
          }
        },
        {
          // 主进程入口文件
          entry: 'src/main/index.ts',
          onstart: options => void options.startup(),
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: `${buildBaseDir}/main`,
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
              }
            }
          }
        }
      ])
    ],
    server: {
      host: true,
      port: 3000,
      strictPort: true
      // open:true,
      // proxy: {
      //   '/api': {
      //     target: 'http://localhost:8080',
      //     changeOrigin: true
      //     // rewrite: path => path.replace(/^\/api/, '')
      //   }
      // }
    },
    clearScreen: false
  };
});
