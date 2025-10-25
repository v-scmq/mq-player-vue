import { List, isArray as isList } from '@/utils';

/**
 * indexDB 数据行类型
 */
type RowData = {
  id?: number | string;
  /** 额外的属性 */
  [key: string]: any;
};

/** 查询条件 */
type QueryCondition<T> = string | string[] | number | number[] | IDBKeyRange | ((data: T) => boolean);

/** 数据件数统计条件 */
type CountCondition<T> = string | number | IDBKeyRange | ((data: T) => boolean);

// null引用
const NULL_REF = null as any;
const UNDEFINED_REF = void 0;

// 所有涉及修改的操作模式
const WRITE_MODE: IDBTransactionMode = 'readwrite';
// 数据库工厂对象
const DB_FACTORY = indexedDB;
const NAMED_DB = import.meta.env.VITE_DB_NAME;

/** 数据库连接实例 */
let database: IDBDatabase = NULL_REF;
// 用于标识当前是否已经存在打开数据库的请求
let opening: Promise<boolean> | null = NULL_REF;

/** 执行此方法, 以检查数据库是否已打开,未打开, 则并尝试打开 */
const ensureOpen = () => {
  // 如果打开数据库操作还未完成,则直接返回它所对应的promise对象
  if (opening) {
    // 注意:这里必须先判断promise对象是否不为空,因为在打开数据库逻辑中出现2次对database变量的赋值操作
    return opening;
  }

  // 若数据库已经打开成功获得实例对象,则返回true
  if (database) {
    return true;
  }

  // 立即执行匿名函数,并将数据库打开请求(opening:Promise)引用为返回的Promise对象
  return (opening = (async () => {
    const keyPath = 'id';
    // 已经存在的数据库信息
    const dbMap: Record<string, number> = {};

    // 创建db名称到版本号的映射
    (await DB_FACTORY.databases()).forEach(db => (dbMap[<string>db.name] = <number>db.version));

    // 判断需要新创建书数据库
    let version = dbMap[NAMED_DB];
    let creatable = !version;

    // {key: TableName, value: 1(不存在) | 2(已存在)}
    let tables: { [key: string]: 1 | 2 } = {};
    __INDEXED_TABLES__.split(',').forEach(name => (tables[name] = 1));

    // 打开数据库(没有则新建)
    let req = DB_FACTORY.open(NAMED_DB, (version = version || 1));

    database = await new Promise<IDBDatabase>(resolve => {
      // 若是新创建数据库, 那么必须在版本升级事件中创建表
      if (creatable) {
        // 1.版本升级
        req.onupgradeneeded = () => {
          // 创建表的配置(不再提供定制化的主键方式,都统一由调用方生成主键,例如配置自动自增,随着时间推移导致数值过大溢出)
          const options: IDBObjectStoreParameters = { keyPath };

          for (const name in tables) {
            req.result.createObjectStore(name, options);
          }
        };
      }

      // 2.成功打开数据库时的回调(若版本号增加,那么会先回调版本升级事件)
      req.onsuccess = () => resolve(req.result);

      // 3.打开数据库失败时的回调
      req.onerror = () => resolve(NULL_REF);
    });

    // 监听close事件
    database.onclose = close;

    // 若是完全新建 或 数据库打开失败, 则中断后续处理
    if (creatable || !database) {
      // 将数据库打开请求重置为空引用
      opening = NULL_REF;
      return !!database;
    }

    // 检测是否需要创建不存在的表
    // 当前已经存在的表
    const storeNames = database.objectStoreNames;
    let deletesNames: string[] | null = null;

    for (let index = storeNames.length - 1; index >= 0; index -= 1) {
      const key = storeNames[index];

      if (tables[key]) {
        // 将表标记为已存在
        tables[key] = 2;
        // config.autoIncrement = false;
      } else {
        // 注意:删除表只能在版本升级事件中执行
        deletesNames && deletesNames.push(key);
        !deletesNames && (deletesNames = [key]);
      }
    }

    // 需要新创建的表(注意: 根据上面配置, 1:标识为需要新建;2:标识为已存在, 所以下面的筛选条件为小于2)
    const newTableNames = Object.keys(tables).filter(key => tables[key] < 2);

    // 若没有需要新创建的表, 则终止后续处理(***即使有需要删除的表,等待后续有新表创建时再执行删除***)
    if (newTableNames.length < 1) {
      opening = NULL_REF;
      return true;
    }

    // 关闭数据库连接
    database.close();
    // 版本号增加1, 重新打开数据库
    req = DB_FACTORY.open(NAMED_DB, version + 1);

    database = await new Promise(resolve => {
      // 1.版本升级
      req.onupgradeneeded = () => {
        // 创建表的配置(不再提供定制化的主键方式,都统一由调用方生成主键,例如配置自动自增,随着时间推移导致数值过大溢出)
        const options: IDBObjectStoreParameters = { keyPath };
        const db = req.result;

        // 创建表
        newTableNames.forEach(name => db.createObjectStore(name, options));
        // 删除表
        deletesNames?.forEach(name => db.deleteObjectStore(name));
      };

      // 2.成功打开数据库时的回调(若版本号增加,那么会先回调版本升级事件)
      req.onsuccess = () => resolve(req.result);

      // 3.打开数据库失败时的回调
      req.onerror = () => resolve(NULL_REF);
    });

    // 监听close事件
    database.onclose = close;

    // 将数据库打开请求重置为空引用
    opening = NULL_REF;

    return !!database;
  })());
};

export const db = {
  /** 关闭数据库连接 */
  close(event?: Event) {
    !event && database?.close();
    database = NULL_REF;
    opening = NULL_REF;
  },

  /**
   * 查询指定表的数据.
   *
   * <pre>
   * 1.当查询条件未指定,那么查询全部数据;
   * 2.当查询条件指定为单个字符串或数值, 那么作为单个id查询
   * 3.当查询条件指定为0个元素的数组, 那么查询全部数据
   * 4.当查询条件指定为1个元素以上的(必须是字符串或数值)数组,那么它们被作为id查询
   * 5.当指定为IDBKeyRange对象时,由其配置的主键值范围决定查询结果(参考https://developer.mozilla.org/docs/Web/API/IDBKeyRange)
   * 6.当指定了一个回调方法时,由返回值(true:保留,false:舍弃)决定
   * </pre>
   *
   * <pre>
   *  对于limit参数,必须是以下情况时适用:
   *  1.未指定(由条件参数取反结果决定, 如undefined)
   *  2.长度为0的数组
   *  3.IDBKeyRange对象
   * </pre>
   *
   * @param table 数据表(不允许为null)
   * @param condition 查询条件(可选, 必须是规定的类型)
   * @param limit 最大查询结果件数(可选, 取值范围[0, 2 ^ 31 - 1]区间的整数)
   */
  async query<T extends RowData>(table: string, condition?: QueryCondition<T>, limit?: number) {
    if (!(await ensureOpen())) {
      return [] as T[];
    }

    const transaction = database.transaction(table);
    const store = transaction.objectStore(table);

    // 当条件指定为一个回调方法
    if (typeof condition === 'function') {
      const data: T[] = [];

      const promise = new Promise<T[]>(resolve => {
        transaction.oncomplete = () => resolve(data);
        transaction.onerror = () => resolve(data);
      });

      const req = store.openCursor();
      const callback = condition as (data: T) => boolean;

      req.onsuccess = () => {
        const cursor = req.result;

        if (cursor) {
          const { value } = cursor as { value: T };
          callback(value) && data.push(value);

          cursor.continue();
        }
      };

      return await promise;
    }

    const isArray = isList(condition);
    const isRange = condition instanceof IDBKeyRange;
    const hasCondition = condition === 0 || condition;

    // 条件未指定 或 指定为0个元素的数组, 那么查询全部数据
    if (!hasCondition || (isArray && !condition.length) || isRange) {
      return await new Promise<T[]>(resolve => {
        // 注意:所有方法涉及IDBValidKey类型的参数,都不是实际支持数组传入的
        const req = store.getAll(isRange ? condition : UNDEFINED_REF, limit || UNDEFINED_REF);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve([]);
      });
    }

    // 统一调整为id数组
    const ids: string[] | number[] = isArray ? condition : ([condition] as string[] | number[]);

    const promise = new Promise<T[]>(resolve => {
      transaction.oncomplete = () => resolve(data.filter(Boolean));
      transaction.onerror = () => resolve(data);
    });

    const data = new List(ids.length);

    ids.forEach((id, index) => {
      const req = store.get(id);
      req.onsuccess = () => (data[index] = req.result);
    });

    return await promise;
  },

  /**
   * 统计指定表的数据件数
   *
   * <pre>
   * 1.当查询条件未指定, 那么统计全部数据
   * 2.当查询条件指定了有效的(必须是字符串或数值),那么被作为id统计查询
   * 3.当指定为IDBKeyRange对象时,由其配置的主键值范围决定统计结果(参考https://developer.mozilla.org/docs/Web/API/IDBKeyRange)
   * </pre>
   *
   * @param table 数据表(不允许为null)
   * @param condition 统计条件(必须是规定的类型)
   */
  async count<T>(table: string, condition?: CountCondition<T>) {
    if (!(await ensureOpen())) {
      return 0;
    }

    const transaction = database.transaction(table);
    const store = transaction.objectStore(table);

    if (typeof condition === 'function') {
      let count = 0;

      const promise = new Promise<number>(resolve => {
        transaction.oncomplete = () => resolve(count);
        transaction.onerror = () => resolve(count);
      });

      const req = store.openCursor();
      const callback = condition as (data: T) => boolean;

      req.onsuccess = () => {
        const cursor = req.result;

        if (cursor) {
          const { value } = cursor as { value: T };
          callback(value) && ++count;

          cursor.continue();
        }
      };

      return await promise;
    }

    const req = store.count(condition);

    return await new Promise<number>(resolve => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
  },

  /***
   * [添加/更新]数据到指定数据表中
   *
   * @param table 数据表(不允许为null)
   * @param data 单条或多条数据(不允许为null, 或数组元素内容不能是null)
   * @param update 指定是否明确作为更新(若为true,数据必须提供id属性的值)
   */
  async put<T extends RowData>(table: string, data: T | T[], update?: true) {
    if (!(await ensureOpen())) {
      return false;
    }

    const list = isList(data) ? data : [data];

    if (!list.length) {
      return false;
    }

    const transaction = database.transaction(table, WRITE_MODE);
    const store = transaction.objectStore(table);

    const promise = new Promise<boolean>(resolve => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
    });

    if (update) {
      list.forEach(item => store.put(item));
    } else {
      // id前缀
      const prefix = new Date().getTime().toString(36);
      // id后缀最大长度
      const maxLength = (list.length - 1).toString(36).length;

      list.forEach((item, index) => {
        if (!item.id) {
          item.id = `${prefix}-${index.toString(36).padStart(maxLength, '0')}`;
        }

        store.put(item);
      });
    }

    return await promise;
  },

  /**
   * 根据主键值删除指定表的数据
   *
   * @param table 数据表(不允许为null)
   * @param id 主键值(不允许为null,必须是规定的类型)
   */
  async delete(table: string, id: number | string | number[] | string[]) {
    if (!(await ensureOpen())) {
      return false;
    }

    const ids = isList(id) ? id : [id];
    const transaction = database.transaction(table, WRITE_MODE);
    const store = transaction.objectStore(table);

    const promise = new Promise<boolean>(resolve => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
    });

    // type IDBValidKey = number | string | Date | BufferSource | IDBValidKey[];
    // delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined>;
    // 注意: 根据以上类型声明,方法看上去是直接支持传入数组的,但根据文档说明和实际结果都不行, 所以只有循环删除
    ids.forEach(id => store.delete(id));

    return await promise;
  },

  /**
   * 清空指定表的所有数据
   *
   * @param table 数据表(不允许为null)
   */
  async clear(table: string) {
    if (!(await ensureOpen())) {
      return false;
    }

    const store = database.transaction(table, WRITE_MODE).objectStore(table);
    const req = store.clear();

    return await new Promise(resolve => {
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  }

  // , clearDB() {
  //   return new Promise<void>(resolve => {
  //     close();
  //
  //     let req = DB_FACTORY.deleteDatabase(NAMED_DB);
  //
  //     req.onsuccess = req.onerror = () => resolve();
  //   });
  // }
};
