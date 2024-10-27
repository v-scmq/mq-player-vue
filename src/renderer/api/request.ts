import { Message } from '@/components/message';

export type ResponseEntity<T> = {
  type: 'success' | 'info' | 'warning' | 'error';
  message?: string;
  data?: T;
};

type ResponseData<T> = {
  data: T;
  error: boolean;
};

/** 从全局获取fetch方法,后续不再通过window使用 */
const send = fetch;

export const post = async <T>(url: string, payload?: string | Record<string, any> | any[]) => {
  if (import.meta.env.DEV) {
    const schema = import.meta.env.VITE_SERVER_PROTOCOL;
    const domain = import.meta.env.VITE_SERVER_DOMAIN;

    url = `${schema}://${domain}/${import.meta.env.VITE_SERVER_API}/${url}`;
  } else {
    url = `/${import.meta.env.VITE_SERVER_API}/${url}`;
  }

  let res: Response;

  const options: RequestInit = { method: 'POST' };

  if (payload) {
    if (typeof payload === 'string') {
      options.body = payload;
    } else {
      options.body = JSON.stringify(payload);
      options.headers = { 'Content-Type': 'application/json;charset=UTF-8' };
    }
  }

  try {
    res = await send(url, options);
  } catch (e: any) {
    Message({ message: e.message, type: 'error', duration: 6000 });
    return { error: true } as ResponseData<T>;
  }

  let body: ResponseEntity<T>;

  try {
    body = await res.json();
  } catch (error) {
    body = { message: '未知错误！', type: 'error' };
  }

  const { message, type, data } = body;

  message && Message({ message, type, duration: 6000 });
  return { data: data, error: type === 'error' } as ResponseData<T>;
};
