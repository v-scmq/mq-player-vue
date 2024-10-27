export type RequestRootHandler = {
  [k: string]: (path: string, req: Request, url: URL) => Response | Promise<Response>;
};

export type ApiHandlers = {
  [key: string]: (req: Request, url: URL) => Response | Promise<Response>;
};
