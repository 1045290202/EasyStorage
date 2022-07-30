/**
 * @Author: 1045290202
 * @Time: 2022-07-30 下午 7:28
 * @File: EasyStorage.ts
 * @Description:
 * 封装localStorage，无需关注读取和写入的数据类型（程序自动转换数据类型），支持同时添加删除读取修改多个数据
 *
 * 暂时支持以下数据类型：
 * - 空（Null）
 * - 数字（Number）
 * - 字符串（String）
 * - 布尔值（Boolean）
 * - 数组（Array）
 * - 日期（Date）
 * - 集合（Set）
 * - 键值对（Map）
 * - 对象（Object）
 */

export default class EasyStorage {
    
    protected static _instance: any = null;
    
    public static getInstance<T extends {}>(this: new () => T): T {
        if (!(<any>this)._instance) {
            (<any>this)._instance = new this();
        }
        return (<any>this)._instance as T;
    }
    
    /**
     * 变量名的前缀
     * @private
     */
    private _prefixName: string = null;
    
    /**
     * 变量名的前缀，可以传项目名称（英文），以区分不同项目的相同变量名。会影响到LocalStorage的最终变量名称
     * @param prefixName
     */
    public set prefixName(prefixName: string) {
        this._prefixName = prefixName;
    }
    
    /**
     * 同时存入多条数据
     * @param keysAndValues
     */
    public setItems(keysAndValues: { key: string, value: any, handledFunction?: (unhandledStorageStr: string) => string }[]) {
        keysAndValues.forEach(({key, value, handledFunction}) => {
            this.setItem(key, value, handledFunction);
        });
    }
    
    /**
     * 本地存储一条数据
     * @param key
     * @param value 默认值
     * @param handledFunction 处理函数，对序列化以后的字符串再做一遍处理，比如加密等
     */
    public setItem(key: string, value: any, handledFunction?: (unhandledStorageStr: string) => string) {
        let storageStr: string = "";
        switch (true) {
            case value == null: {
                storageStr = new EasyStorageData(EasyStorageType.None, null).toString();
                break;
            }
            case typeof value === "number": {
                storageStr = new EasyStorageData(EasyStorageType.Number, value).toString();
                break;
            }
            case typeof value === "string": {
                storageStr = new EasyStorageData(EasyStorageType.String, value).toString();
                break;
            }
            case typeof value === "boolean": {
                storageStr = new EasyStorageData(EasyStorageType.Boolean, value).toString();
                break;
            }
            case value instanceof Array: {
                storageStr = new EasyStorageData(EasyStorageType.Array, value).toString();
                break;
            }
            case value instanceof Date: {
                storageStr = new EasyStorageData(EasyStorageType.Date, value).toString();
                break;
            }
            case value instanceof Set: {
                storageStr = new EasyStorageData(EasyStorageType.Set, Array.from(value)).toString();
                break;
            }
            case value instanceof Map: {
                storageStr = new EasyStorageData(EasyStorageType.Map, Array.from(value)).toString();
                break;
            }
            case typeof value === "object": {
                storageStr = new EasyStorageData(EasyStorageType.Object, value).toString();
                break;
            }
            default: {
                throw new Error("暂不支持的数据类型，请转换后再使用");
            }
        }
        
        const handledStorageStr: string = handledFunction == null ? storageStr : handledFunction(storageStr);
        if (this._prefixName == null) {
            localStorage.setItem(key, handledStorageStr);
        } else {
            localStorage.setItem(`${this._prefixName}_${key}`, handledStorageStr);
        }
    }
    
    /**
     * 同时读取多条数据
     * @param keysAndDefaultValues
     */
    public getItems<T>(keysAndDefaultValues: { key: string, defaultValue: T }[]): T[] {
        const items: any[] = [];
        keysAndDefaultValues.forEach(
            ({key, defaultValue, handledFunction}:
                { key: string, defaultValue: T, handledFunction: (storageStr: string) => string }) => {
                items.push(this.getItem(key, defaultValue, handledFunction));
            },
        );
        
        return items;
    }
    
    /**
     * 本地读取一条数据，需要传入默认值
     * @param key
     * @param defaultValue
     * @param handledFunction 处理函数，对序列化以后的字符串再做一遍处理，比如解密等
     */
    public getItem<T>(key: string, defaultValue: T, handledFunction?: (storageStr: string) => string) {
        let item: any;
        if (this._prefixName == null) {
            item = localStorage.getItem(key);
        } else {
            item = localStorage.getItem(`${this._prefixName}_${key}`);
        }
        let obj: any;
        if (!item || item === "") {
            obj = defaultValue;
        } else {
            const handledStorageStr: string = handledFunction == null ? item : handledFunction(item);
            if (!this._isEasyStorageObject(key, handledStorageStr)) {
                obj = handledStorageStr;
            } else {
                // 反序列化
                const easyStorageData: IEasyStorageData = JSON.parse(handledStorageStr);
                switch (EasyStorageType[easyStorageData.type]) {
                    case EasyStorageType.None: {
                        obj = null;
                        break;
                    }
                    case EasyStorageType.Number: {
                        obj = easyStorageData.value;
                        break;
                    }
                    case EasyStorageType.String: {
                        obj = easyStorageData.value;
                        break;
                    }
                    case EasyStorageType.Boolean: {
                        obj = easyStorageData.value;
                        break;
                    }
                    case EasyStorageType.Array: {
                        obj = easyStorageData.value;
                        break;
                    }
                    case EasyStorageType.Date: {
                        obj = new Date(easyStorageData.value);
                        break;
                    }
                    case EasyStorageType.Set: {
                        obj = new Set(easyStorageData.value);
                        break;
                    }
                    case EasyStorageType.Map: {
                        obj = new Map(easyStorageData.value);
                        break;
                    }
                    case EasyStorageType.Object: {
                        obj = easyStorageData.value;
                        break;
                    }
                    default: {
                        obj = easyStorageData.value;
                        break;
                    }
                }
            }
        }
        return obj;
    }
    
    /**
     * 获取所有localStorage
     * @param handledFunction 处理函数，对序列化以后的字符串再做一遍处理，比如解密等
     */
    public getAllItems(handledFunction?: (storageStr: string) => string) {
        const items: { key: string, value: any }[] = [];
        for (let i: number = 0, l = localStorage.length; i < l; i++) {
            const key: string = localStorage.key(i);
            items.push({
                key,
                value: this.getItem(key, null, handledFunction),
            });
        }
        return items;
    }
    
    /**
     * 返回所有键
     */
    public getAllKeys() {
        const keys: string[] = [];
        for (let i: number = 0, l = localStorage.length; i < l; i++) {
            const key: string = localStorage.key(i);
            keys.push(key);
        }
        return keys;
    }
    
    /**
     * 是否存在某个键
     * @param key
     */
    public hasKey(key: string) {
        if (this._prefixName == null) {
            return localStorage.getItem(key) != null;
        } else {
            return localStorage.getItem(`${this._prefixName}_${key}`) != null;
        }
    }
    
    /**
     * 删除多条记录
     * @param keys
     */
    public removeItems(keys: string[]) {
        keys.forEach(key => this.removeItem(key));
    }
    
    /**
     * 删除单条记录
     * @param key
     */
    public removeItem(key: string) {
        if (this._prefixName == null) {
            localStorage.removeItem(key);
        } else {
            localStorage.removeItem(`${this._prefixName}_${key}`);
        }
    }
    
    /**
     * 是否是EasyStorage对象字符串
     * @param key
     * @param str
     * @private
     */
    protected _isEasyStorageObject(key: string, str: string) {
        try {
            let obj = JSON.parse(str);
            if (typeof obj === "object" && "type" in obj && "value" in obj && typeof obj["type"] === "string") {
                return true;
            } else {
                console.warn(`The value of variable "${key}" is not "${EasyStorage.name}" object，returns a normal string.`);
                return false;
            }
        } catch (e) {
            console.warn(`The value of variable "${key}" is not "${EasyStorage.name}" object，returns a normal string.`);
            return false;
        }
    }
    
}

/**
 * EasyStorage的存储类型，不要随便修改EasyStorageType的key！！！
 * @enum EasyStorageType
 */
enum EasyStorageType {
    None = -1,
    String = 0,
    Number,
    Boolean,
    Array,
    Object,
    Date,
    Set,
    Map,
}

interface IEasyStorageData {
    type: string,
    value: any,
}

/**
 * @class EasyStorageData
 * EasyStorage的数据
 */
class EasyStorageData implements IEasyStorageData {
    public type: string = EasyStorageType[EasyStorageType.None];
    public value: any = "";
    
    constructor(type: EasyStorageType, value: any) {
        this.type = EasyStorageType[type];
        this.value = value;
        return this;
    }
    
    /**
     * 序列化
     */
    public toString() {
        return JSON.stringify(this);
    }
    
}


/**
 * 可以直接在浏览器控制台中调用 EasyStorage.getInstance().xxx()
 */
if (window != null) {
    window["EasyStorage"] = EasyStorage;
}