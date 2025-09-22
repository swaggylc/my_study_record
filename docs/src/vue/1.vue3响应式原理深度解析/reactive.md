---
date: 2025-09-22 18:44:31
title: reactive
permalink: /pages/316f25
categories:
  - src
  - vue
  - reactive
---
# reactive.js 响应式代理创建实现详解

## 概述

`reactive.js`是Vue响应式系统的核心文件之一，负责实现响应式代理的创建。这个文件定义了`reactive`函数，它是Vue 3响应式系统中最基础的API之一，用于将普通JavaScript对象转换为响应式对象。通过这个转换，对象的属性访问和修改会被拦截，从而实现依赖收集和触发更新的功能。

## 完整代码

```javascript
import handlers from './handles.js';
import { isObject } from './utils.js';

// 存储原始对象到响应式代理的映射
const rawToReactive = new WeakMap();
// 存储响应式代理到原始对象的映射
const reactiveToRaw = new WeakMap();

// 创建响应式对象
export function reactive(target) {
  return createReactiveObject(target);
}

// 创建响应式对象的核心函数
function createReactiveObject(target) {
  // 检查目标是否为对象
  if (!isObject(target)) {
    return target;
  }
  // 检查目标是否已经是响应式对象
  if (target.__isReactive) {
    return target;
  }
  // 检查目标是否已经有对应的响应式代理
  let existingProxy = rawToReactive.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // 创建代理
  const proxy = new Proxy(target, handlers);
  // 存储映射关系
  rawToReactive.set(target, proxy);
  reactiveToRaw.set(proxy, target);
  // 标记为响应式对象
  Object.defineProperty(target, '__isReactive', {
    configurable: true,
    enumerable: false,
    value: true,
  });
  return proxy;
}

// 检查对象是否是响应式的
export function isReactive(value) {
  return value && value.__isReactive === true;
}

// 将响应式对象转换回原始对象
export function toRaw(observed) {
  let raw = observed;
  while (reactiveToRaw.has(raw)) {
    raw = reactiveToRaw.get(raw);
  }
  return raw;
}
```

## 核心概念

### 1. 响应式代理的创建

`reactive.js`的核心功能是使用JavaScript的`Proxy` API创建响应式代理。代理是一个特殊的对象，它可以拦截对目标对象的各种操作，如属性访问、修改、删除等。通过这些拦截器（在`handles.js`中定义），Vue能够在适当的时机进行依赖收集和触发更新。

### 2. 映射关系的维护

为了避免重复创建响应式代理，并能够在需要时获取原始对象，`reactive.js`使用了两个WeakMap来维护映射关系：
- `rawToReactive`：存储原始对象到响应式代理的映射
- `reactiveToRaw`：存储响应式代理到原始对象的映射

使用WeakMap的好处是不会阻止键（对象）被垃圾回收，有助于避免内存泄漏。

### 3. 响应式标记

为了标识一个对象是响应式的，`reactive.js`会在原始对象上定义一个不可枚举的`__isReactive`属性，并将其值设置为`true`。这个标记在`handles.js`的拦截器中被使用，以识别响应式对象。

## 函数详细解释

### 1. reactive函数

```javascript
export function reactive(target) {
  return createReactiveObject(target);
}
```

**功能**：将普通JavaScript对象转换为响应式对象。

**参数**：
- `target`：要转换为响应式的目标对象

**返回值**：
- 如果`target`不是对象，返回`target`本身
- 如果`target`已经是响应式对象或已有对应的响应式代理，返回已有的响应式代理
- 否则，返回一个新创建的响应式代理

**应用场景**：这是Vue 3响应式系统的主要入口之一，用于创建响应式数据。

### 2. createReactiveObject函数

```javascript
function createReactiveObject(target) {
  // 检查目标是否为对象
  if (!isObject(target)) {
    return target;
  }
  // 检查目标是否已经是响应式对象
  if (target.__isReactive) {
    return target;
  }
  // 检查目标是否已经有对应的响应式代理
  let existingProxy = rawToReactive.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // 创建代理
  const proxy = new Proxy(target, handlers);
  // 存储映射关系
  rawToReactive.set(target, proxy);
  reactiveToRaw.set(proxy, target);
  // 标记为响应式对象
  Object.defineProperty(target, '__isReactive', {
    configurable: true,
    enumerable: false,
    value: true,
  });
  return proxy;
}
```

**功能**：创建响应式对象的核心函数，实现了响应式代理的创建逻辑。

**参数**：
- `target`：要转换为响应式的目标对象

**返回值**：
- 一个响应式代理对象或原始对象（如果不满足转换条件）

**工作流程**：
1. 检查目标是否为对象，如果不是，直接返回目标
2. 检查目标是否已经是响应式对象，如果是，直接返回目标
3. 检查目标是否已经有对应的响应式代理，如果有，返回已有的代理
4. 创建新的响应式代理
5. 存储原始对象到响应式代理的映射关系
6. 存储响应式代理到原始对象的映射关系
7. 在原始对象上标记`__isReactive`属性
8. 返回新创建的响应式代理

### 3. isReactive函数

```javascript
export function isReactive(value) {
  return value && value.__isReactive === true;
}
```

**功能**：检查一个值是否是响应式对象。

**参数**：
- `value`：要检查的值

**返回值**：
- 布尔值，表示`value`是否是响应式对象

**工作原理**：检查值是否存在并且其`__isReactive`属性是否为`true`。

### 4. toRaw函数

```javascript
export function toRaw(observed) {
  let raw = observed;
  while (reactiveToRaw.has(raw)) {
    raw = reactiveToRaw.get(raw);
  }
  return raw;
}
```

**功能**：将响应式对象转换回原始对象。

**参数**：
- `observed`：一个可能是响应式的对象

**返回值**：
- 如果`observed`是响应式对象，返回对应的原始对象
- 否则，返回`observed`本身

**工作原理**：通过`reactiveToRaw`映射表查找原始对象，如果找不到，则返回输入值本身。这个实现支持嵌套的代理查找，确保能找到最原始的对象。

## 在系统中的应用

`reactive.js`在Vue响应式系统中扮演着核心角色：

1. `reactive`函数是创建响应式数据的主要入口之一
2. `isReactive`函数用于检查一个对象是否是响应式的
3. `toRaw`函数用于获取响应式对象的原始对象，在某些场景下（如避免无限循环）非常有用
4. `rawToReactive`和`reactiveToRaw`映射表用于维护原始对象和响应式代理之间的关系

## 代码优化建议

1. **增加对不可扩展对象的处理**：目前的实现没有特别处理不可扩展对象，可以添加这方面的检查：

```javascript
function createReactiveObject(target) {
  // 检查目标是否为对象
  if (!isObject(target)) {
    return target;
  }
  // 检查目标是否已经是响应式对象
  if (target.__isReactive) {
    return target;
  }
  // 检查目标是否已经有对应的响应式代理
  let existingProxy = rawToReactive.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // 检查目标是否可扩展
  if (!Object.isExtensible(target)) {
    return target;
  }
  // 剩余代码...
}
```

2. **增加深度响应式的支持**：目前的实现只对对象的顶层属性进行响应式处理，可以添加对嵌套对象的处理：

```javascript
function createReactiveObject(target) {
  // 检查目标是否为对象
  if (!isObject(target)) {
    return target;
  }
  // 检查目标是否已经是响应式对象
  if (target.__isReactive) {
    return target;
  }
  // 检查目标是否已经有对应的响应式代理
  let existingProxy = rawToReactive.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // 创建代理
  const proxy = new Proxy(target, handlers);
  // 存储映射关系
  rawToReactive.set(target, proxy);
  reactiveToRaw.set(proxy, target);
  // 标记为响应式对象
  Object.defineProperty(target, '__isReactive', {
    configurable: true,
    enumerable: false,
    value: true,
  });
  // 递归处理嵌套对象
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key) && isObject(target[key])) {
      target[key] = createReactiveObject(target[key]);
    }
  }
  return proxy;
}
```

3. **优化toRaw函数的性能**：当前的实现使用while循环查找原始对象，可以考虑直接返回映射表中的值：

```javascript
export function toRaw(observed) {
  return reactiveToRaw.get(observed) || observed;
}
```

注意：这个优化可能会改变函数的行为，因为原始实现支持嵌套的代理查找。如果需要支持嵌套查找，可以保留原实现。

4. **增加对只读响应式的支持**：目前的实现只支持可变的响应式对象，可以考虑添加对只读响应式的支持：

```javascript
// 添加只读代理处理器（需要单独实现）
import readOnlyHandlers from './readOnlyHandlers.js';

// 创建只读响应式对象
export function readonly(target) {
  return createReactiveObject(target, true);
}

// 修改createReactiveObject函数以支持只读模式
function createReactiveObject(target, isReadOnly = false) {
  // 检查目标是否为对象
  if (!isObject(target)) {
    return target;
  }
  // 使用对应的处理器
  const handlersToUse = isReadOnly ? readOnlyHandlers : handlers;
  // 剩余逻辑类似...
}
```

5. **增加对循环引用的处理**：当前的实现可能在处理循环引用时出现问题，可以在`createReactiveObject`函数中添加处理循环引用的逻辑：

```javascript
function createReactiveObject(target) {
  // 检查目标是否为对象
  if (!isObject(target)) {
    return target;
  }
  // 检查目标是否已经是响应式对象或已有对应的响应式代理
  if (target.__isReactive || rawToReactive.has(target)) {
    return target.__isReactive ? target : rawToReactive.get(target);
  }
  // 创建代理
  const proxy = new Proxy(target, handlers);
  // 先存储映射关系，再处理嵌套对象，避免循环引用导致的无限递归
  rawToReactive.set(target, proxy);
  reactiveToRaw.set(proxy, target);
  // 标记为响应式对象
  Object.defineProperty(target, '__isReactive', {
    configurable: true,
    enumerable: false,
    value: true,
  });
  // 递归处理嵌套对象（如果添加了深度响应式支持）
  // ...
  return proxy;
}
```

6. **增加对Symbol属性的处理**：目前的实现没有特别处理Symbol属性，可以添加对Symbol属性的支持：

```javascript
function createReactiveObject(target) {
  // ... 现有代码 ...
  // 递归处理嵌套对象和Symbol属性
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key) && isObject(target[key])) {
      target[key] = createReactiveObject(target[key]);
    }
  }
  // 处理Symbol属性
  const symbolKeys = Object.getOwnPropertySymbols(target);
  for (const symbolKey of symbolKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(target, symbolKey);
    if (descriptor && descriptor.enumerable && isObject(target[symbolKey])) {
      target[symbolKey] = createReactiveObject(target[symbolKey]);
    }
  }
  // ... 现有代码 ...
}
```