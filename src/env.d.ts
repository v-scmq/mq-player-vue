/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** app id */
  readonly VITE_APP_ID: string;
  /** app name */
  readonly VITE_APP_NAME: string;
  /** 自定义的标准协议名称 */
  readonly VITE_SERVER_PROTOCOL: string;
  /** 自定义服务域名 */
  readonly VITE_SERVER_DOMAIN: string;
  /** 静态资源代理访问接口 */
  readonly VITE_SERVER_STATIC: string;
  /** 本地资源代理访问接口 */
  readonly VITE_SERVER_FILE: string;
  /** 第三方代理访问接口 */
  readonly VITE_SERVER_PROXY: string;
  /** 服务提供API接口 */
  readonly VITE_SERVER_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module NodeJS {
  interface Process {
    env: {
      VITE_DEV_SERVER_URL: string;
      [key: string]: string;
    };
  }
}
