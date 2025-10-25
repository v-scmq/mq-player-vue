import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import { defineConfig, loadEnv } from 'vite';
import { terser } from 'rollup-plugin-terser';
import { rmSync } from 'node:fs';
import pkg from './package.json';

import type { ESBuildOptions } from 'vite';

/**
 * 将任意一个参数转为可选的
 *
 * @param apply true:返回传入的值, 否则为undefined
 * @param value 配置选项 或 配置选项值
 */
const optional = <T>(apply: boolean, value: T) => {
  return apply ? value : undefined;
};

export default defineConfig(({ command, mode }) => {
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '');
  const buildBaseDir = env.buildDir;
  rmSync(buildBaseDir, { recursive: true, force: true });

  const isServe = command === 'serve';
  const isBuild = command === 'build';

  // 因为node版本趋于一个较新状态,无需考虑主进程部分代码兼容性问题
  const nodeTarget = `node${process.versions.node}`;

  /** 生产环境模式下, electron相关(主进程,预加载脚本)部分代码所使用的插件 */
  const electronPlugins = optional(isBuild, [
    // 使用terser插件将代码中的注释移除,并压缩代码
    terser({
      compress: {
        inline: true,
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false
        // beautify: false,
        // inline_script: true,
        // max_line_len: Number.MAX_SAFE_INTEGER
      }
    })
  ]);

  return {
    // 指定读取环境变量配置的目录
    //envDir: 'env',

    define: {
      __INDEXED_TABLES__: JSON.stringify(
        Object.keys(env)
          .filter(k => k.startsWith('VITE_TABLE_'))
          .map(k => env[k])
          .join(',')
      )
    },

    build: {
      target: ['esnext'],
      assetsDir: '',
      outDir: `${buildBaseDir}/${env.VITE_SERVER_STATIC}`,
      rollupOptions: {
        output: {
          hashCharacters: 'base36',
          assetFileNames: '[hash].[ext]',
          chunkFileNames: '[hash].js',
          entryFileNames: '[hash].js'
        }
      }
    },

    // 仅在打包时配置(渲染进程部分有效)
    esbuild: optional<ESBuildOptions>(isBuild, {
      drop: ['console', 'debugger'],
      legalComments: 'none'
    }),

    resolve: {
      alias: [{ find: '@', replacement: `${__dirname}/src/renderer` }]
    },

    plugins: [
      vue(),
      electron([
        {
          // entry: 'src/preload/index.ts',
          // 当预加载脚本构建完成时,通知渲染器进程重新加载页面,而不是重新启动整个Electron应用程序。
          onstart: ({ reload }) => reload(),
          vite: {
            build: {
              sourcemap: isServe,
              target: [nodeTarget],
              minify: optional(isBuild, 'terser'),
              outDir: `${buildBaseDir}/preload`,
              lib: { entry: 'src/preload/index.ts', name: 'index', formats: ['cjs'] },
              rollupOptions: {
                // @ts-ignore
                plugins: electronPlugins,
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
                output: { inlineDynamicImports: true, entryFileNames: '[name].cjs' }
              }
            }
          }
        },
        {
          // 主进程入口文件
          entry: 'src/main/index.ts',
          onstart: ({ startup }) => startup(),
          vite: {
            build: {
              sourcemap: isServe,
              target: [nodeTarget],
              minify: optional(isBuild, 'terser'),
              outDir: `${buildBaseDir}/main`,
              rollupOptions: {
                // @ts-ignore
                plugins: electronPlugins,
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
                output: { inlineDynamicImports: true }
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
