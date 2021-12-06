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
type RowData = { id?: number, [key: string]: any };

/** 数据库表 */
const tables: DataTable = {
    user: {name: 'user', keyPath: 'uin', autoIncrement: false},
    localMusic: {name: 'local_music', keyPath: 'id', autoIncrement: true},
    playList: {name: 'play_list', keyPath: 'id', autoIncrement: true}
}

/** 数据库连接实例 */
let dataBase: any = null;
/** 打开数据库连接的队列 */
let openQueue: (<T>(value: T | PromiseLike<T>) => void)[] | null = null;

const db = {
    tables: tables,

    /** 异步打开indexedDB */
    open() {
        return new Promise(resolve => {
            // 若数据库已经打卡成功
            if (dataBase) {
                // 使用局部引用变量
                const queue = openQueue;
                // 将全局变量移除
                openQueue = null;

                // 立刻resolve第一次打开数据库请求
                resolve(null);
                // 循环resolve其他请求
                return queue && queue.forEach(resolveItem => resolveItem(null));
            }

            // 检测是否不是第一次调用
            const isNotFirst = !!openQueue;
            openQueue = openQueue || [];
            // 若不是第一次调用,则追加到请求队列中,并立刻结束当前方法执行
            if (isNotFirst) {
                return openQueue.push(resolve);
            }

            const dbFactory: IDBFactory = window.indexedDB;// || window.webkitIndexedDB;
            const request: IDBOpenDBRequest = dbFactory.open('data.db', 1);

            // 数据库打开成功
            request.onsuccess = event => {
                // 使用局部引用变量
                const queue = openQueue;
                // 将全局变量移除
                openQueue = null;

                // 立刻resolve第一次打开数据库请求
                resolve(dataBase = (event.target as any).result);
                // 循环resolve其他请求
                if (queue && queue.length > 0) {
                    queue.forEach(resolveItem => resolveItem(null));
                }
            };

            // 数据库打开失败
            request.onerror = () => resolve(null);
            // 数据库打开被阻塞
            request.onblocked = () => resolve(null);
            // 数据库版本更新回调
            request.onupgradeneeded = event => {
                const db = (event.target as any).result;
                const tableList = db.objectStoreNames;
                for (const table of Object.keys(this.tables)) {
                    const option = this.tables[table];
                    if (!tableList.contains(option.name)) {
                        db.createObjectStore(option.name, option);
                    }
                }
            };
        });
    },

    /** 关闭数据库 */
    close() {
        if (dataBase) {
            dataBase.close();
            dataBase = null;
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
            const transaction = dataBase.transaction([table], 'readwrite');
            const objectStore = transaction ? transaction.objectStore(table) : null;
            if (!objectStore) return resolve(false);

            if (data instanceof Array) {
                transaction.oncomplete = (event: any) => resolve(event.target.returnValue);
                transaction.onerror = () => resolve(false);

                for (const item of data) {
                    const request = objectStore.add(item);
                    request.onsuccess = (event: any) => item.id = event.target.result;
                }

            } else {
                const request = objectStore.add(data);

                request.onsuccess = (event: any) => {
                    resolve(data.id = event.target.result);
                };
                request.onerror = () => resolve(false);

            }
        });
    },

    /**
     * 根据主键值删除指定表的数据
     *
     * @param table 数据库表名
     * @param id 主键值
     * @returns {Promise<boolean>} 只有resolve状态的Promise对象
     */
    delete(table: string, id: number | string) {
        return new Promise(resolve => {
            const transaction = dataBase && dataBase.transaction([table], 'readwrite');
            const objectStore = transaction && transaction.objectStore(table);
            const request = objectStore && objectStore.delete(id);

            if (!request) return resolve(false);

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
            const transaction = dataBase && dataBase.transaction([table], 'readwrite');
            const objectStore = transaction && transaction.objectStore(table);
            const request = objectStore && objectStore.put(data);

            if (!request) return resolve(false);

            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    },

    /**
     * 根据主键查询数据库表中的
     *
     * @param table 数据库表名
     * @param id 更新的数据
     * @return {Promise<T[]>} 只有resolve状态的Promise对象
     */
    query<T extends RowData>(table: string, id: string | number): Promise<T[]> {
        return new Promise(resolve => {
            const transaction = dataBase && dataBase.transaction([table], 'readonly');
            const objectStore = transaction && transaction.objectStore(table);
            const request = objectStore && objectStore.get(id);

            if (!request) return resolve([]);

            request.onsuccess = (event: any) => resolve(event.target.result);
            request.onerror = () => resolve([]);
        });
    },

    /**
     * 自定义条件查询
     *
     * @param table 数据库表名
     * @param filter 数据记录过滤方法,方法需要返回一个boolean值,true:表示保留,false:废弃
     * @return {Promise<T>} 只有resolve状态的Promise对象
     */
    queryOfFilter<T extends RowData>(table: string, filter: (data: T) => boolean): Promise<T[]> {
        return new Promise(resolve => {
            const transaction = dataBase && dataBase.transaction([table], 'readonly');
            const objectStore = transaction && transaction.objectStore(table);
            const request = objectStore && objectStore.openCursor();

            if (!request) return resolve([]);

            const data: T[] = [];

            request.onsuccess = (cursor: any) => {
                if ((cursor = cursor.target.result)) {
                    if (filter(cursor.value)) data.push(cursor.value);
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
            const transaction = dataBase && dataBase.transaction([table], 'readonly');
            const objectStore = transaction && transaction.objectStore(table);

            if (!objectStore) return resolve([]);

            const request = objectStore.getAll();
            request.onsuccess = (event: any) => resolve(event.target.result);
            request.onerror = () => resolve([]);
        });
    }
};

export default db;