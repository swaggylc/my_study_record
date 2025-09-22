---
date: 2025-09-23 01:15:24
title: commonJs的本质
permalink: /pages/0a3a49
categories:
  - src
  - javascript
---
# CommonJS 的本质

## 什么是 CommonJS？

CommonJS 是一种模块规范，最初用于 Node.js 环境，它定义了模块的导入、导出方式以及模块之间如何相互引用。理解 CommonJS 的本质对于掌握 Node.js 模块化机制至关重要。

## CommonJS 的核心概念

### 模块的导入与导出

在 CommonJS 规范中，每个文件都是一个独立的模块，拥有自己的作用域。模块通过 `require` 函数导入其他模块，通过 `module.exports` 或 `exports` 对象导出自身的成员。

### require 函数的工作原理

让我们通过一个实例和伪代码来深入理解 CommonJS 的本质：

#### 示例代码
::: code-group
```javascript [index.js]
const result = require("./a.js");
console.log(result);
```
```javascript [a.js]
this.a = 1;  // this 指向 module.exports
exports.b = 2;
exports = {
  c: 3,  // 这里重新赋值 exports，会断开与 module.exports 的引用关系
};
module.exports = {
  d: 4,  // 直接覆盖 module.exports
};
exports.e = 5;  // 此时 exports 已不再指向 module.exports，所以这个赋值无效
this.f = 6;  // 注意：当 module.exports 被重新赋值后，this 不会自动指向新的 module.exports
// 所以这个赋值不会反映到最终的导出结果中
```
:::
#### 运行结果

```
{ d: 4 }
```

## require 函数的伪代码实现

下面是 `require` 函数的简化伪代码实现，帮助我们理解其工作原理：

```javascript
function require(modulePath) {
  // 1. 找到模块的绝对路径
  const moduleAbsolutePath = getModuleAbsolutePath(modulePath);
  
  // 2. 判断缓存
  if (cache[moduleAbsolutePath]) {
    return cache[moduleAbsolutePath];
  }
  
  // 3. 执行模块代码 (通过辅助函数)
  function _require(exports, require, module, __filename, __dirname) {
    // 在这里执行模块中的代码
    // 例如上面的 a.js 中的代码就是在这里执行的
  }
  
  // 4. 准备并运行辅助函数
  var module = {
    exports: {},  // module.exports 初始化为空对象
  };
  var exports = module.exports;  // exports 是 module.exports 的引用
  
  // 得到模块文件的绝对路径和目录路径
  var __filename = moduleAbsolutePath;
  var __dirname = getDirname(__filename);
  
  // 调用辅助函数执行模块代码，this 指向 exports
  _require.call(exports, exports, require, module, __filename, __dirname);
  
  // 缓存模块导出的内容
  cache[moduleAbsolutePath] = module.exports;
  
  // 返回 module.exports
  return module.exports;
}
```

## CommonJS 的关键机制解析

### 1. exports 与 module.exports 的关系

- `exports` 是 `module.exports` 的一个引用（指针）
- 初始时，`exports === module.exports`
- `require` 函数最终返回的是 `module.exports`，而不是 `exports`
- 如果直接对 `exports` 赋值（如 `exports = {...}`），会断开与 `module.exports` 的引用关系

### 2. this 的指向

- 在模块中，`this` 初始指向 `module.exports`
- 当 `module.exports` 被重新赋值后，`this` 不会自动指向新的 `module.exports`，它仍然指向原来的对象

### 3. 模块缓存

- 每个模块只会被加载一次，加载后会被缓存
- 再次 `require` 同一个模块时，直接返回缓存的结果
- 缓存的键是模块的绝对路径

### 4. 模块的执行上下文

每个模块在执行时，会被包裹在一个函数中，该函数提供了 `exports`、`require`、`module`、`__filename` 和 `__dirname` 这五个参数。

## 示例代码的执行过程分析

让我们重新分析前面的示例代码的执行过程：

1. `index.js` 调用 `require("./a.js")`
2. 系统创建 `module` 对象，`module.exports` 初始化为空对象
3. `exports` 变量指向 `module.exports`
4. 执行 `a.js` 中的代码：
   - `this.a = 1`：此时 `this` 指向 `module.exports`，所以 `module.exports.a = 1`
   - `exports.b = 2`：此时 `exports` 仍指向 `module.exports`，所以 `module.exports.b = 2`
   - `exports = { c: 3 }`：重新赋值 `exports`，断开与 `module.exports` 的引用关系
   - `module.exports = { d: 4 }`：直接覆盖 `module.exports`，此时 `module.exports` 变为 `{ d: 4 }`
   - `exports.e = 5`：此时 `exports` 指向的是之前创建的 `{ c: 3 }`，与 `module.exports` 无关，所以这个赋值无效
   - `this.f = 6`：此时 `this` 仍然指向原来的 `module.exports` 对象（即包含 a 和 b 属性的对象），而不是新的 `module.exports`（即包含 d 属性的对象）
   - 所以这个赋值不会反映到最终的导出结果中
5. 最终 `require` 返回 `module.exports`，即 `{ d: 4 }`
6. `index.js` 中 `console.log(result)` 输出 `{ d: 4 }`

## 总结

CommonJS 的本质是通过函数作用域和闭包机制来实现模块的封装和隔离。每个模块在执行时都会被包裹在一个函数中，通过 `module.exports` 导出成员，通过 `require` 导入其他模块。理解 `exports` 与 `module.exports` 的关系，以及模块的执行过程，对于掌握 CommonJS 规范至关重要。

## 常见误区

1. **误区**：直接对 `exports` 赋值就能导出模块
   **正解**：必须通过 `module.exports` 或保持 `exports` 对 `module.exports` 的引用关系

2. **误区**：模块会被重复执行
   **正解**：模块只会被执行一次，之后会从缓存中读取

3. **误区**：`this` 在模块中指向全局对象
   **正解**：在 Node.js 模块中，`this` 指向 `module.exports`

通过深入理解 CommonJS 的本质，我们可以更好地使用 Node.js 的模块化系统，避免常见的错误和陷阱。
