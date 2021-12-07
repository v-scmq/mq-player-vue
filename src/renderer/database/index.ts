/**
 * indexDB 数据库表
 */
type DataTable = {
    [key: string]: {
        name: string;
        keyPath: string;
        autoIncrement: boolean
    }
}

/**
 * indexDB 数据行类型
 */
type RowData = { id?: number | string, [key: string]: any };

/** 数据库表 */
const tables: DataTable = {
    user: {name: 'user', keyPath: 'uin', autoIncrement: false},
    localMusic: {name: 'local_music', keyPath: 'id', autoIncrement: true},
    playList: {name: 'play_list', keyPath: 'id', autoIncrement: true}
} as const;

/** 数据库连接实例 */
let database: IDBDatabase | null = null;
/** 打开数据库连接的队列 */
let openQueue: (<T>(value: T | PromiseLike<T>) => void)[] | null = null;

const db = {
    tables,

    /** 异步打开indexedDB */
    open() {
        return new Promise(resolve => {
            // 若数据库已经打卡成功
            if (database) {
                // 使用局部引用变量
                const queue = openQueue;
                // 将全局变量移除
                openQueue = null;

                // 立刻resolve第一次打开数据库请求
                resolve(null);
                // 循环resolve其他请求
                return queue && queue.forEach(resolve => resolve(null));
            }

            // 检测是否不是第一次调用
            const isNotFirst = !!openQueue;
            openQueue = openQueue || [];

            // 若不是第一次调用,则追加到请求队列中,并立刻结束当前方法执行
            if (isNotFirst) {
                return openQueue.push(resolve);
            }

            const dbFactory: IDBFactory = window.indexedDB;
            const request: IDBOpenDBRequest = dbFactory.open('data.db', 1);

            // 数据库打开成功
            request.onsuccess = () => {
                // 初始化indexDB数据库实例
                database = request.result;
                // 使用局部引用变量
                const queue = openQueue;
                // 将全局变量置为null
                openQueue = null;

                // 立刻resolve第一次打开数据库请求
                resolve(null);

                // 循环resolve其他请求
                if (queue && queue.length > 0) {
                    queue.forEach(resolve => resolve(null));
                }
            };

            // 数据库打开失败
            request.onerror = () => resolve(null);

            // 数据库打开被阻塞
            request.onblocked = () => resolve(null);

            // 数据库版本更新回调
            request.onupgradeneeded = () => {
                const db: IDBDatabase = request.result;
                const tableList = db.objectStoreNames;

                for (const table of Object.keys(tables)) {
                    const option = tables[table];

                    // 不考虑升级后,前后数据库表结构存在差异的情况(若真是那样,手动删除数据库即可)
                    if (!tableList.contains(option.name)) {
                        db.createObjectStore(option.name, option);
                    }
                }
            };
        });
    },

    /** 关闭数据库 */
    close() {
        if (database) {
            database.close();
            database = null;
        }
    },

    /***
     * 添加数据到指定数据库表中.
     *
     * 方法是异步执行的,方法会立即返回Promise对象. 需要注意的是,Promise对象状态只会由pending(进行中)转变为resolved(已成功),
     *     即使内部存在的操作错误也是通过resolve转变, 可以通过resolve方法回传的参数判断.
     *
     * @param table 数据库表名
     * @param data 单条或多条数据(理论上可以是任意的数据,但最佳还是一个对象或数组)
     * @return {Promise<boolean>} Promise对象(true:成功 或 false:失败)
     */
    insert<T extends RowData>(table: string, data: T | T[]): Promise<boolean> {
        return new Promise(resolve => {
            if (!database) {
                return resolve(false);
            }

            const transaction = database.transaction([table], 'readwrite');
            const objectStore = transaction.objectStore(table);

            if (data instanceof Array) {
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => resolve(false);

                for (const item of data) {
                    const request = objectStore.add(item);
                    request.onsuccess = () => item.id = request.result as number | string;
                }

            } else {
                const request = objectStore.add(data);

                request.onsuccess = () => resolve(!!(data.id = request.result as number | string))
                request.onerror = () => resolve(false);
            }
        });
    },

    /**
     * 根据主键值删除指定表的数据
     *
     * @param table 数据库表名
     * @param id 主键值
     * @returns {Promise<boolean>} Promise对象(true:成功 或 false:失败)
     */
    delete(table: string, id: number | string) {
        return new Promise(resolve => {
            if (!database) {
                return resolve(false);
            }

            const request = database.transaction([table], 'readwrite')
                .objectStore(table).delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    },

    /**
     * 根据数据中的存在的主键属性值更新到指定的数据库表中
     *
     * @param table 数据库表名
     * @param data 更新的数据
     * @return {Promise<boolean>} 异步Promise对象
     */
    update<T extends RowData>(table: string, data: T): Promise<boolean> {
        return new Promise(resolve => {
            if (!database) {
                return resolve(false);
            }

            const request = database.transaction([table], 'readwrite')
                .objectStore(table).put(data);

            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    },

    /**
     * 根据主键查询数据库表中的
     *
     * @param table 数据库表名
     * @param id 更新的数据
     * @return {Promise<T[]>} 异步Promise对象
     */
    query<T extends RowData>(table: string, id: string | number): Promise<T[]> {
        return new Promise(resolve => {
            if (!database) {
                return resolve([]);
            }

            const request: IDBRequest<T[]> =
                database.transaction([table], 'readonly')
                    .objectStore(table).get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
        });
    },

    /**
     * 自定义条件查询
     *
     * @param table 数据库表名
     * @param filter 数据记录过滤方法,方法需要返回一个boolean值,true:表示保留,false:废弃
     * @return {Promise<T[]>} 异步Promise对象
     */
    queryOfFilter<T extends RowData>(table: string, filter: (data: T) => boolean): Promise<T[]> {
        return new Promise(resolve => {
            if (!database) {
                return resolve([]);
            }

            const transaction = database.transaction([table], 'readonly');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.openCursor();

            const data: T[] = [];

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    filter(cursor.value) && data.push(cursor.value);
                    cursor.continue();
                }
            }

            transaction.oncomplete = () => resolve(data);
            transaction.onerror = () => resolve(data);
        });
    }
    ,

    /**
     * 查询数据库表中所有的数据
     *
     * @param table 数据库表名
     * @return {Promise<T[]>} 异步Promise对象
     */
    queryAll<T extends RowData>(table: string): Promise<T[]> {
        return new Promise(resolve => {
            if (!database) {
                return resolve([]);
            }

            const request: IDBRequest<T[]> =
                database.transaction([table], 'readonly')
                    .objectStore(table).getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
        });
    }
};

export default db;