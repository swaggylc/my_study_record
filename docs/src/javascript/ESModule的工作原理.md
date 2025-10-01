---
date: 2025-10-01 10:22:18
title: ESModule的工作原理
permalink: /pages/a24ee0
categories:
  - src
  - javascript
---

# ESModule的工作原理

ESModule（ECMAScript Module）是JavaScript官方标准的模块化解决方案，具有静态分析、依赖提升等特性。下面我们来详细了解ESModule的工作原理。

## ESModule的主要特性

1. **静态分析**：ESModule在编译时就能确定模块的依赖关系，不需要在运行时才能确定。
2. **依赖提升**：ESModule的导入会被提升到模块的顶部，无论在代码中什么位置声明。
3. **严格模式**：ESModule默认在严格模式下运行。
4. **值引用**：ESModule导出的是值的引用，而不是值的拷贝。
5. **动态导入**：支持动态导入语法`import()`，实现按需加载。

## 第一步：模块解析

将模块的相对路径转换为完整的URL地址：

```html
<script src="./main.js" type="module"> </script>
                |
                |
                👇
        www.xxxx.com/main.js
```

下载相应文件，读取并解析（注意：不是运行）文件内容。

解析目的：找到该文件中所有的静态导入语句。只找模块的顶层导入，在块级作用域中写导入语句是会报错的，并且会将所有的顶层导入提到代码的最前。

```javascript
import a from "./a.js"
import b from "./b.js"
```

由于此时是没有运行任何代码，所以from后不能使用字符串拼接，只能使用普通字符串。

解析后同时下载a.js和b.js两个文件，又对两个模块进行同样的操作...

## 第二步：模块执行

找到最初的模块，从上往下依次执行，直到导出语句。

每个模块都会建立相应的映射关系，可以看作一个表格：

| default | 'a'  |
| ------- | ---- |
|         |      |

| default | 'b'  |
| ------- | ---- |
|         |      |

注意：如果已经运行过的模块会直接跳过。

如果运行到动态导入语句，则重复上述步骤（注意：这里是异步的，不会等待模块下载完成，而是直接往后执行，待该模块完成解析和执行后，运行then中的回调函数）：

```javascript
import('./foo.js').then((res)=>{
    console.log(res.default)
})
```

## ESModule的执行顺序

ESModule的执行遵循深度优先的后序遍历原则：

1. **构建依赖图**：首先解析所有模块，构建完整的依赖关系图
2. **深度优先遍历**：按照深度优先的方式遍历依赖图
3. **后序执行**：子模块先于父模块执行，确保依赖模块在被使用前已经初始化完成

```javascript
// main.js
import { value } from './moduleA.js'
console.log('main.js执行')
console.log(value)

// moduleA.js
import { value as bValue } from './moduleB.js'
export const value = bValue + 1
console.log('moduleA.js执行')

// moduleB.js
export const value = 42
console.log('moduleB.js执行')

// 执行顺序：
// 1. moduleB.js执行
// 2. moduleA.js执行
// 3. main.js执行
// 4. 43
```

## ESModule与CommonJS的区别

| 特性 | ESModule | CommonJS |
|------|----------|----------|
| 加载时机 | 编译时加载（静态） | 运行时加载（动态） |
| 导出方式 | 值引用 | 值拷贝 |
| 执行时机 | 异步执行 | 同步执行 |
| this指向 | undefined | module.exports |
| 循环依赖 | 支持，导出引用 | 部分支持，导出未完成对象 |

## 循环依赖处理

ESModule能够很好地处理循环依赖问题：

```javascript
// a.js
import { b } from './b.js'
console.log('a.js执行', b)
export const a = 'a'

// b.js
import { a } from './a.js'
console.log('b.js执行', a)
export const b = 'b'

// 输出：
// b.js执行 undefined
// a.js执行 b
// 注意：在b.js中，a模块还未执行完成，所以a的值为undefined
```

## 总结

ESModule作为JavaScript官方的模块化标准，相比CommonJS具有诸多优势：
- 静态分析使得构建工具可以进行更好的优化
- 依赖提升避免了一些运行时错误
- 值引用使得模块间可以更好地共享状态
- 动态导入支持按需加载，优化性能

理解ESModule的工作原理对于现代JavaScript开发至关重要，特别是在使用构建工具如Webpack、Vite等时，能够更好地优化项目结构和性能。

