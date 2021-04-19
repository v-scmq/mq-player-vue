export default {
    db: null,
    localMusicTable: "local_music",
    playListTable: "play_list",

    /** 异步打开indexedDB */
    open() {
        return new Promise(resolve => {
            let dbFactory = window.indexedDB;// || window.webkitIndexedDB;
            let request = this.request = dbFactory.open('data.db', 1);
            // 数据库打开成功
            request.onsuccess = event => resolve(this.db = event.target.result);
            // 数据库打开失败
            request.onerror = () => resolve(null, null);
            // 数据库打开被阻塞
            request.onblocked = () => resolve(null, null);
            // 数据库版本更新回调
            request.onupgradeneeded = event => {
                let db = event.target.result;
                let tableList = db.objectStoreNames;
                if (!tableList.contains(this.localMusicTable)) {
                    db.createObjectStore(this.localMusicTable, {keyPath: 'id', autoIncrement: true});
                }
                if (!tableList.contains(this.playListTable)) {
                    db.createObjectStore(this.playListTable, {keyPath: 'id', autoIncrement: true});
                }
            };
        });
    },

    /** 关闭数据库 */
    close() {
        this.db = this.db ? this.db.close() : null;
    },

    /***
     * 添加数据到指定数据库表中.
     *
     * 方法是异步执行的,方法会立即返回Promise对象. 需要注意的是,Promise对象状态只会由pending(进行中)转变为resolved(已成功),
     *     即使内部存在的操作错误也是通过resolve转变, 可以通过resolve方法回传的参数判断.
     *
     * @param table {String} 数据库表名
     * @param data {Object | Array} 单条或多条数据(理论上可以是任意的数据,但最佳还是一个对象或数组)
     * @returns {Promise} 只有resolve状态的Promise对象
     */
    insert(table, data) {
        return new Promise(resolve => {
            let transaction = this.db ? this.db.transaction([table], 'readwrite') : null;
            let objectStore = transaction ? transaction.objectStore(table) : null;
            if (!objectStore) return resolve(null);

            if (data instanceof Array) {
                transaction.oncomplete = event => resolve(event.target.returnValue);
                transaction.onerror = () => resolve(null);
                for (let item of data) {
                    let request = objectStore.add(item);
                    request.onsuccess = event => item.id = event.target.result;
                }

            } else if (data instanceof Object) {
                let request = objectStore.add(data);
                request.onsuccess = event => resolve(data.id = event.target.result);
                request.onerror = () => resolve(null);

            } else {
                resolve(null);
            }
        });
    },

    /**
     * 根据主键值删除指定表的数据
     * @param table {String} 数据库表名
     * @param primaryKeyValue 主键值
     * @returns {Promise} 只有resolve状态的Promise对象
     */
    delete(table, primaryKeyValue) {
        return new Promise(resolve => {
            let transaction = this.db ? this.db.transaction([table], 'readwrite') : null;
            let objectStore = transaction ? transaction.objectStore(table) : null;
            let request = objectStore ? objectStore.delete(primaryKeyValue) : null;

            if (!request) return resolve(null);

            request.onsuccess = event => resolve(event.target.result);
            request.onerror = () => resolve(null);
        });
    },

    /**
     * 根据数据中的存在的主键属性值更新到指定的数据库表中
     * @param table {String} 数据库表名
     * @param data {Object} 更新的数据
     * @returns {Promise} 只有resolve状态的Promise对象
     */
    update(table, data) {
        return new Promise(resolve => {
            let transaction = this.db ? this.db.transaction([table], 'readwrite') : null;
            let objectStore = transaction ? transaction.objectStore(table) : null;
            let request = objectStore ? objectStore.put(data) : null;

            if (!request) return resolve(null);

            request.onsuccess = event => resolve(event.target.result);
            request.onerror = () => resolve(null);
        });
    },

    /**
     * 根据主键查询数据库表中的
     * @param table {String} 数据库表名
     * @param primaryKeyValue 更新的数据
     * @returns {Promise} 只有resolve状态的Promise对象
     */
    query(table, primaryKeyValue) {
        return new Promise(resolve => {
            let transaction = this.db ? this.db.transaction([table], 'readonly') : null;
            let objectStore = transaction ? transaction.objectStore(table) : null;
            let request = objectStore ? objectStore.get(primaryKeyValue) : null;

            if (!request) return resolve(null);

            request.onsuccess = event => resolve(event.target.result);
            request.onerror = () => resolve(null);
        });
    },

    /**
     * 自定义条件查询
     * @param table {String} 数据库表名
     * @param filter {Function} 数据记录过滤方法,方法需要返回一个boolean值,true:表示保留,false:废弃
     * @returns {Promise} 只有resolve状态的Promise对象
     */
    queryOfFilter(table, filter) {
        return new Promise(resolve => {
            let transaction = this.db ? this.db.transaction([table], 'readonly') : null;
            let objectStore = transaction ? transaction.objectStore(table) : null;
            let request = objectStore ? objectStore.openCursor() : null;

            if (!request) return resolve(null);

            let data = [];
            request.onsuccess = cursor => {
                if ((cursor = cursor.target.result)) {
                    if (filter(cursor.value)) data.push(cursor.value);
                    cursor.continue();
                }
            }
            transaction.oncomplete = () => resolve(data);
            transaction.onerror = () => resolve(data);
        });
    },
    /**
     * 查询数据库表中所有的数据
     * @param table {String} 数据库表名
     * @returns {Promise} 只有resolve状态的Promise对象
     */
    queryAll(table) {
        return new Promise(resolve => {
            let transaction = this.db ? this.db.transaction([table], 'readonly') : null;
            let objectStore = transaction ? transaction.objectStore(table) : null;

            if (!objectStore) return resolve(null);

            let request = objectStore.getAll();
            request.onsuccess = event => resolve(event.target.result);
            request.onerror = () => resolve(null);
        });
    }
};
