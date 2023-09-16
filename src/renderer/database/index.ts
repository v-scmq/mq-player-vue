/**
 * indexDB 数据表
 */
type DataTable = {
  /** 数据表名 */
  readonly name: string;
  /** 主键字段名 */
  readonly keyPath: string;
  /** 是否自增 */
  readonly autoIncrement: boolean;
};

/**
 * indexDB 数据行类型
 */
type RowData = {
  /** id(不一定是主键, 取决于配置的keyPath) */
  id?: number | string;
  /** 额外的属性 */
  [key: string]: any;
};

/**
 * indexedDB 数据表map
 */
export const tables = {
  /** 用户信息表 */
  user: { name: 'user', keyPath: 'uin', autoIncrement: false } as DataTable,
  /** 本地音乐信息表 */
  localMusic: { name: 'local-music', keyPath: 'id', autoIncrement: true } as DataTable,
  /** 播放列表信息表 */
  playList: { name: 'play-list', keyPath: 'id', autoIncrement: true } as DataTable,
  /** 歌词信息表 */
  lyrics: { name: 'lyrics', keyPath: 'mid', autoIncrement: false } as DataTable
} as const;

/**
 * 打开indexDB的请求队列
 */
type OpenQueueResolvers = { locked?: boolean } & ((value: void | PromiseLike<void>) => void)[];

/** 数据库连接实例 */
let database: IDBDatabase | null = null;
/** 打开数据库连接的队列 */
const openQueue: OpenQueueResolvers = [];

/**
 * 将队列中的resolve方法依次调用, 从而promise的状态从pending 变成 resolved
 */
const resolveQueue = () => {
  // 移除请求队列的锁定状态
  delete openQueue.locked;
  const queue = openQueue.splice(0);

  // 循环resolve其他请求
  for (const resolver of queue) {
    resolver();
  }
};

export const db = {
  /** 异步打开indexedDB */
  open() {
    return new Promise<void>(resolve => {
      // 若数据库已经打开成功
      if (database) {
        return resolve();
      }

      // 将resolve方法放入请求队列中
      openQueue.push(resolve);

      // 若请求队列已被标记为锁住状态
      if (openQueue.locked) {
        // 则不执行后续操作
        return;
      }

      // 将请求队列标记为锁住状态
      openQueue.locked = true;

      const dbFactory: IDBFactory = window.indexedDB;
      const request: IDBOpenDBRequest = dbFactory.open('data.db', 1);

      // 数据库打开成功
      request.onsuccess = () => {
        // 初始化indexDB数据库实例
        database = request.result;

        resolveQueue();
      };

      // 数据库打开失败
      request.onerror = () => resolveQueue();

      // 数据库打开被阻塞
      request.onblocked = () => resolveQueue();

      // 数据库版本更新回调
      request.onupgradeneeded = () => {
        const db: IDBDatabase = request.result;
        const tableList = db.objectStoreNames;

        for (const property in tables) {
          const table = tables[property as keyof typeof tables];

          // 不考虑升级后,前后数据表结构存在差异的情况(若真是那样,手动删除数据库即可)
          if (!tableList.contains(table.name)) {
            db.createObjectStore(table.name, table);
          }
        }
      };
    });
  },

  /** 关闭数据库 */
  close() {
    database && database.close();
    database = null;
  },

  /***
   * 添加数据到指定数据表中
   *
   * @param table 数据表
   * @param data 单条或多条数据
   */
  insert<T extends RowData>(table: DataTable, data: T | T[]): Promise<boolean> {
    return new Promise(resolve => {
      if (!database) {
        return resolve(false);
      }

      const transaction = database.transaction([table.name], 'readwrite');
      const objectStore = transaction.objectStore(table.name);

      if (data instanceof Array) {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);

        // 若主键自增
        if (table.autoIncrement) {
          // 主键字段名
          const key = table.keyPath as 'id';

          for (const item of data) {
            const request = objectStore.add(item);
            request.onsuccess = () => (item[key] = request.result as number);
          }
        } else {
          for (const item of data) {
            objectStore.add(item);
          }
        }
      } else {
        const request = objectStore.add(data);

        request.onsuccess = () => {
          // 若主键自增
          if (table.autoIncrement) {
            // 主键字段名
            const key = table.keyPath as 'id';

            data[key] = data.id = request.result as number | string;
          }

          resolve(true);
        };

        request.onerror = () => resolve(false);
      }
    });
  },

  /**
   * 根据主键值删除指定表的数据
   *
   * @param table 数据表
   * @param id 主键值
   */
  delete(table: DataTable, id: number | string) {
    return new Promise(resolve => {
      if (!database) {
        return resolve(false);
      }

      const request = database.transaction([table.name], 'readwrite').objectStore(table.name).delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  },

  /**
   * 根据数据中的存在的主键属性值更新到指定的数据表中
   *
   * @param table 数据表名
   * @param data 更新的数据
   */
  update<T extends RowData>(table: DataTable, data: T): Promise<boolean> {
    return new Promise(resolve => {
      if (!database) {
        return resolve(false);
      }

      const request = database.transaction([table.name], 'readwrite').objectStore(table.name).put(data);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  },

  /**
   * 根据主键查询数据表中的
   *
   * @template T
   * @param table 数据表名
   * @param id 更新的数据
   */
  query<T extends RowData>(table: DataTable, id: string | number): Promise<T[]> {
    return new Promise(resolve => {
      if (!database) {
        return resolve([]);
      }

      const request: IDBRequest<T[]> = database.transaction([table.name], 'readonly').objectStore(table.name).get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  },

  /**
   * 自定义条件查询
   *
   * @template T
   * @param table 数据表名
   * @param filter 数据记录过滤方法 (方法需要返回一个boolean值 => true:表示保留; false:废弃)
   */
  queryOfFilter<T extends RowData>(table: DataTable, filter: (data: T) => boolean): Promise<T[]> {
    return new Promise(resolve => {
      if (!database) {
        return resolve([]);
      }

      const transaction = database.transaction([table.name], 'readonly');
      const objectStore = transaction.objectStore(table.name);
      const request = objectStore.openCursor();

      const data: T[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          filter(cursor.value) && data.push(cursor.value);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve(data);
      transaction.onerror = () => resolve(data);
    });
  },

  /**
   * 查询数据表中所有的数据
   *
   * @template T
   * @param table 数据表名
   */
  queryAll<T extends RowData>(table: DataTable): Promise<T[]> {
    return new Promise(resolve => {
      if (!database) {
        return resolve([]);
      }

      const request: IDBRequest<T[]> = database.transaction([table.name], 'readonly').objectStore(table.name).getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  }
};
