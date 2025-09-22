---
date: 2025-09-22 19:04:53
title: operations
permalink: /pages/d9aad0
categories:
  - src
  - vue
  - vue3响应式原理深度解析
---
# operations.js 操作类型常量详解

## 概述

`operations.js`文件定义了Vue响应式系统中使用的各种操作类型常量，主要分为两类：跟踪操作类型（TrackOpTypes）和触发操作类型（TriggerOpTypes）。这些常量在依赖收集和触发更新过程中用于标识当前执行的操作类型，使代码更具可读性和可维护性。

## 完整代码

```javascript
export const TrackOpTypes = {
  // 监听 in 操作符
  HAS: "has",
  // 监听 get 操作符
  GET: "get",
  // 监听迭代操作(for in)
  ITERATE: "iterate",
};

export const TriggerOpTypes = {
  SET: "set",
  ADD: "add",
  DELETE: "delete",
  CLEAR: "clear",
};
```

## 常量详细解释

### 1. TrackOpTypes - 跟踪操作类型

`TrackOpTypes`常量对象定义了响应式系统在收集依赖时需要识别的操作类型。

#### 1.1 HAS

```javascript
HAS: "has"
```

**功能**：标识`in`操作符的使用，用于跟踪对象属性的存在性检查操作。

**应用场景**：当使用`key in object`表达式检查属性是否存在时，会触发`has`拦截器，使用此常量标识操作类型。

#### 1.2 GET

```javascript
GET: "get"
```

**功能**：标识属性访问操作，用于跟踪对象属性的读取操作。

**应用场景**：当读取对象的属性值（如`object.key`或`object[key]`）时，会触发`get`拦截器，使用此常量标识操作类型。

#### 1.3 ITERATE

```javascript
ITERATE: "iterate"
```

**功能**：标识迭代操作，用于跟踪对象的遍历操作。

**应用场景**：当使用`for...in`循环、`Object.keys()`等方法遍历对象时，会触发`ownKeys`拦截器，使用此常量标识操作类型。

### 2. TriggerOpTypes - 触发操作类型

`TriggerOpTypes`常量对象定义了响应式系统在触发更新时需要识别的操作类型。

#### 2.1 SET

```javascript
SET: "set"
```

**功能**：标识属性设置操作，用于触发对象已有属性值的更新。

**应用场景**：当修改对象已有属性的值（如`object.key = value`）时，会触发`set`拦截器，使用此常量标识操作类型。

#### 2.2 ADD

```javascript
ADD: "add"
```

**功能**：标识属性添加操作，用于触发对象新增属性时的更新。

**应用场景**：当向对象添加新的属性（如`object.newKey = value`）时，会触发`set`拦截器，使用此常量标识操作类型。

#### 2.3 DELETE

```javascript
DELETE: "delete"
```

**功能**：标识属性删除操作，用于触发对象删除属性时的更新。

**应用场景**：当使用`delete`操作符删除对象的属性（如`delete object.key`）时，会触发`deleteProperty`拦截器，使用此常量标识操作类型。

#### 2.4 CLEAR

```javascript
CLEAR: "clear"
```

**功能**：标识清空操作，用于触发清空对象或集合时的更新。

**应用场景**：当清空一个集合（如数组的`splice(0)`或Map的`clear()`方法）时，使用此常量标识操作类型。

## 在系统中的应用

这些操作类型常量在Vue响应式系统中主要用于以下两个核心过程：

### 1. 依赖收集（track函数）

在`effect.js`中的`track`函数中，这些常量用于标识当前正在执行的操作类型，以便正确建立依赖关系：

```javascript
// 依赖收集
export function track(target, type, key) {
  if (!shouldTrack || !activeEffect) return;
  // 获取属性
  let propMap = targetMap.get(target);
  if (!propMap) {
    propMap = new Map();
    targetMap.set(target, propMap);
  }
  if (type === TrackOpTypes.ITERATE) {
    key = ITERATE_KEY;
  }
  // ... 其他代码 ...
}
```

### 2. 触发更新（trigger函数）

在`effect.js`中的`trigger`函数和`getEffectFns`函数中，这些常量用于确定哪些依赖需要被触发更新：

```javascript
function getEffectFns(target, type, key) {
  // ... 其他代码 ...
  const TriggerTypeMap = {
    [TriggerOpTypes.SET]: [TrackOpTypes.GET],
    [TriggerOpTypes.ADD]: [
      TrackOpTypes.GET,
      TrackOpTypes.HAS,
      TrackOpTypes.ITERATE,
    ],
    [TriggerOpTypes.DELETE]: [
      TrackOpTypes.GET,
      TrackOpTypes.HAS,
      TrackOpTypes.ITERATE,
    ],
    [TriggerOpTypes.CLEAR]: [TrackOpTypes.ITERATE],
  };
  // ... 其他代码 ...
}
```

## 操作类型映射关系

`TriggerTypeMap`对象定义了触发操作类型与跟踪操作类型之间的映射关系，它决定了不同类型的修改操作会触发哪些类型的依赖更新：

- **SET操作**：只会触发GET类型的依赖更新
- **ADD操作**：会触发GET、HAS和ITERATE类型的依赖更新
- **DELETE操作**：会触发GET、HAS和ITERATE类型的依赖更新
- **CLEAR操作**：只会触发ITERATE类型的依赖更新

这种设计确保了响应式系统能够准确地识别哪些依赖需要在特定操作后被更新，从而保证了UI的正确性和性能优化。

## 代码优化建议

1. **增加类型安全检查**：可以考虑使用枚举类型（如果使用TypeScript）或添加类型验证，以确保操作类型的使用符合预期。

2. **添加文档注释**：为每个操作类型添加更详细的文档注释，说明其具体用途和触发条件。

```javascript
/**
 * 跟踪操作类型枚举
 */
export const TrackOpTypes = {
  /**
   * 监听in操作符，当使用`key in object`检查属性存在性时触发
   */
  HAS: "has",
  
  /**
   * 监听get操作符，当访问对象属性时触发
   */
  GET: "get",
  
  /**
   * 监听迭代操作，当使用for...in等遍历对象时触发
   */
  ITERATE: "iterate",
};
```

3. **增加更多操作类型**：根据需要，可以考虑添加更多操作类型以支持更复杂的场景：

```javascript
export const TrackOpTypes = {
  // 现有类型...
  
  /**
   * 监听函数调用操作
   */
  CALL: "call",
  
  /**
   * 监听数组长度访问操作
   */
  LENGTH: "length",
};

// 相应地，在TriggerOpTypes中也添加对应的操作类型
```

4. **使用Symbol代替字符串**：为了防止命名冲突，可以考虑使用Symbol代替字符串作为操作类型的标识符：

```javascript
export const TrackOpTypes = {
  HAS: Symbol("has"),
  GET: Symbol("get"),
  ITERATE: Symbol("iterate"),
};
```