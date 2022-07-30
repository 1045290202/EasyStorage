# EasyStorage

封装localStorage，无需关注读取和写入的数据类型（程序自动转换数据类型），支持同时添加删除读取修改多个数据

### 支持数据类型

- 空（Null）
- 数字（Number）
- 字符串（String）
- 布尔值（Boolean）
- 数组（Array）
- 日期（Date）
- 集合（Set）
- 键值对（Map）
- 对象（Object）

### 例子

```typescript
import EasyStorage from "./EasyStorage";

let foo: boolean = EasyStorage.getInstance().getItem("foo", false); // 之前未存储过foo的值，返回默认的false
console.log(foo); // false

EasyStorage.getInstance().setItem("foo", true); // 存储foo的值为true
foo = EasyStorage.getInstance().getItem("foo", false); // 已存储过foo的值，返回true
console.log(foo); // true

EasyStorage.getInstance().removeItem("foo"); // 删除foo的值
foo = EasyStorage.getInstance().getItem("foo", false); // foo的值被删除，返回默认的false
console.log(foo); // false
```
_以上为基础方法，其他方法可以参考[EasyStorage.ts](EasyStorage.ts)的源码_
