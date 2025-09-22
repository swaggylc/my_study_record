---
date: 2025-09-22 19:04:18
title: effect
permalink: /pages/2ab05f
categories:
  - src
  - vue
  - vue3响应式原理深度解析
---
# effect.js 响应式副作用实现详解

## 概述

`effect.js`是Vue响应式系统的核心文件，实现了副作用函数的管理、依赖收集和触发更新机制。这个文件定义了Vue 3响应式系统中最基础也是最重要的部分，它负责建立响应式数据和副作用函数之间的关联，并在数据变化时通知相关的副作用函数重新执行。

## 完整代码

```javascript
let shouldTrack = true;
// 暂停依赖收集
export function pauseTracking() {
  shouldTrack = false;
}
// 恢复依赖收集
export function resumeTracking() {
  shouldTrack = true;
}

let activeEffect = null;
const effectStack = [];

export function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      effectStack.push(effectFn);
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

export function clearFnDeps(effectFn) {
  const { deps } = effectFn;
  if (!deps.length) return;
  for (const dep of deps) {
    dep.delete(effectFn);
  }
  deps.length = 0;
}

const targetMap = new WeakMap();
// 标记迭代操作
const ITERATE_KEY = Symbol("iterate");

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
  let typeMap = propMap.get(key);
  if (!typeMap) {
    typeMap = new Map();
    propMap.set(key, typeMap);
  }
  let depSet = typeMap.get(type);
  if (!depSet) {
    depSet = new Set();
    typeMap.set(type, depSet);
  }
  // 建立函数set
  if (!depSet.has(activeEffect)) {
    depSet.add(activeEffect);
    activeEffect.deps.push(depSet);
  }
}
// 派发更新
export function trigger(target, type, key) {
  const effectFns = getEffectFns(target, type, key);
  if (!effectFns) return;
  for (const effectFn of effectFns) {
    // 避免触发当前正在运行的effect
    if (effectFn === activeEffect) continue;
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  }
}

function getEffectFns(target, type, key) {
  const propMap = targetMap.get(target);
  if (!propMap) return;
  const keys = [key];
  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    keys.push(ITERATE_KEY);
  }
  const effectFns = new Set();
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
  for (const key of keys) {
    const typeMap = propMap.get(key);
    if (!typeMap) continue;
    const trackTypes = TriggerTypeMap[type];
    for (const trackType of trackTypes) {
      const depSet = typeMap.get(trackType);
      if (depSet) {
        depSet.forEach((effectFn) => {
          effectFns.add(effectFn);
        });
      }
    }
  }
  return effectFns;
}
```

## 核心概念与数据结构

### 1. 依赖收集的核心数据结构

Vue 3响应式系统使用了四层嵌套的数据结构来存储依赖关系：

1. `targetMap` (WeakMap)：存储目标对象到其属性依赖的映射
2. `propMap` (Map)：存储属性名到操作类型依赖的映射
3. `typeMap` (Map)：存储操作类型到副作用函数集合的映射
4. `depSet` (Set)：存储与特定操作和属性相关的副作用函数

这种设计使得系统能够精确地追踪哪些副作用函数依赖于哪些对象的哪些属性的哪些操作类型。

### 2. 副作用管理的核心变量

- `shouldTrack`：布尔值，控制是否应该进行依赖收集
- `activeEffect`：当前正在执行的副作用函数
- `effectStack`：副作用函数栈，用于管理嵌套的副作用函数
- `ITERATE_KEY`：Symbol类型，用于标记迭代操作

## 函数详细解释

### 1. 依赖收集控制函数

#### 1.1 pauseTracking

```javascript
// 暂停依赖收集
export function pauseTracking() {
  shouldTrack = false;
}
```

**功能**：暂停依赖收集过程。

**应用场景**：在执行一些不需要触发响应式更新的操作时（如数组的push、pop等方法），可以临时暂停依赖收集以提高性能。

#### 1.2 resumeTracking

```javascript
// 恢复依赖收集
export function resumeTracking() {
  shouldTrack = true;
}
```

**功能**：恢复依赖收集过程。

**应用场景**：在暂停依赖收集后，使用此函数恢复正常的依赖收集行为。

### 2. 副作用函数创建与管理

#### 2.1 effect

```javascript
export function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      effectStack.push(effectFn);
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}
```

**功能**：创建一个响应式副作用函数，并建立其与响应式数据之间的依赖关系。

**参数**：
- `fn`：要作为副作用的函数
- `options`：配置选项对象，支持`lazy`（是否懒执行）和`scheduler`（调度器函数）等属性

**返回值**：
- 返回一个包装后的副作用函数`effectFn`

**工作原理**：
1. 创建一个包装函数`effectFn`
2. 在`effectFn`中，使用`try...finally`结构确保无论如何都会恢复正确的`activeEffect`
3. 在执行原始函数前，将当前副作用函数设置为`activeEffect`并压入栈中
4. 执行完毕后，将副作用函数弹出栈，并恢复之前的`activeEffect`
5. 初始化副作用函数的`deps`数组，用于存储其依赖的集合
6. 根据`options.lazy`决定是否立即执行副作用函数
7. 返回包装后的副作用函数

#### 2.2 clearFnDeps

```javascript
export function clearFnDeps(effectFn) {
  const { deps } = effectFn;
  if (!deps.length) return;
  for (const dep of deps) {
    dep.delete(effectFn);
  }
  deps.length = 0;
}
```

**功能**：清除一个副作用函数的所有依赖。

**参数**：
- `effectFn`：要清除依赖的副作用函数

**工作原理**：
1. 遍历副作用函数的`deps`数组中的每个依赖集合
2. 从每个依赖集合中删除该副作用函数
3. 清空`deps`数组

### 3. 依赖收集与触发更新

#### 3.1 track - 依赖收集

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
  let typeMap = propMap.get(key);
  if (!typeMap) {
    typeMap = new Map();
    propMap.set(key, typeMap);
  }
  let depSet = typeMap.get(type);
  if (!depSet) {
    depSet = new Set();
    typeMap.set(type, depSet);
  }
  // 建立函数set
  if (!depSet.has(activeEffect)) {
    depSet.add(activeEffect);
    activeEffect.deps.push(depSet);
  }
}
```

**功能**：建立响应式数据和副作用函数之间的依赖关系。

**参数**：
- `target`：目标对象（响应式对象）
- `type`：操作类型（来自`TrackOpTypes`）
- `key`：属性名

**工作原理**：
1. 检查是否应该进行依赖收集（`shouldTrack`为`true`且存在`activeEffect`）
2. 获取或创建目标对象对应的`propMap`
3. 对于迭代操作，使用特殊的`ITERATE_KEY`
4. 获取或创建属性名对应的`typeMap`
5. 获取或创建操作类型对应的`depSet`
6. 如果当前副作用函数不在`depSet`中，则添加进去
7. 同时将`depSet`添加到副作用函数的`deps`数组中，以便后续可以清除依赖

#### 3.2 trigger - 触发更新

```javascript
// 派发更新
export function trigger(target, type, key) {
  const effectFns = getEffectFns(target, type, key);
  if (!effectFns) return;
  for (const effectFn of effectFns) {
    // 避免触发当前正在运行的effect
    if (effectFn === activeEffect) continue;
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  }
}
```

**功能**：当响应式数据发生变化时，触发相关的副作用函数重新执行。

**参数**：
- `target`：目标对象（响应式对象）
- `type`：操作类型（来自`TriggerOpTypes`）
- `key`：属性名

**工作原理**：
1. 调用`getEffectFns`函数获取所有需要触发的副作用函数
2. 遍历这些副作用函数
3. 跳过当前正在执行的副作用函数，避免无限循环
4. 如果副作用函数有调度器，则使用调度器执行；否则直接执行

#### 3.3 getEffectFns - 获取需要触发的副作用函数

```javascript
function getEffectFns(target, type, key) {
  const propMap = targetMap.get(target);
  if (!propMap) return;
  const keys = [key];
  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    keys.push(ITERATE_KEY);
  }
  const effectFns = new Set();
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
  for (const key of keys) {
    const typeMap = propMap.get(key);
    if (!typeMap) continue;
    const trackTypes = TriggerTypeMap[type];
    for (const trackType of trackTypes) {
      const depSet = typeMap.get(trackType);
      if (depSet) {
        depSet.forEach((effectFn) => {
          effectFns.add(effectFn);
        });
      }
    }
  }
  return effectFns;
}
```

**功能**：根据目标对象、操作类型和属性名，查找所有需要触发的副作用函数。

**参数**：
- `target`：目标对象（响应式对象）
- `type`：操作类型（来自`TriggerOpTypes`）
- `key`：属性名

**返回值**：
- 包含所有需要触发的副作用函数的Set集合

**工作原理**：
1. 获取目标对象对应的`propMap`
2. 对于添加和删除操作，需要额外考虑迭代操作的依赖
3. 创建一个空的`effectFns`集合用于存储需要触发的副作用函数
4. 根据`TriggerTypeMap`确定当前触发操作类型对应的跟踪操作类型
5. 遍历所有相关的属性和操作类型，收集所有需要触发的副作用函数
6. 返回收集到的副作用函数集合

## 在系统中的应用

`effect.js`中的函数在Vue响应式系统中扮演着核心角色：

1. `effect`函数用于创建响应式副作用，是用户与响应式系统交互的主要入口之一
2. `track`函数在`handles.js`的拦截器中被调用，用于收集依赖
3. `trigger`函数在`handles.js`的拦截器中被调用，用于触发更新
4. `pauseTracking`和`resumeTracking`函数在`handles.js`中被用于优化数组操作的性能

## 代码优化建议

1. **修复依赖导入问题**：`effect.js`中使用了`TrackOpTypes`和`TriggerOpTypes`，但没有导入这些常量，需要添加导入语句：

```javascript
import { TrackOpTypes, TriggerOpTypes } from "./operations.js";
```

2. **增加错误处理**：为`effect`函数添加对`fn`参数的类型检查，确保传入的是函数：

```javascript
export function effect(fn, options = {}) {
  if (typeof fn !== 'function') {
    console.error('effect函数的第一个参数必须是函数');
    return;
  }
  // 原有代码...
}
```

3. **增加依赖清理**：在`effectFn`执行前，可以考虑先清除旧的依赖，避免重复收集：

```javascript
export function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      // 清除旧的依赖
      clearFnDeps(effectFn);
      activeEffect = effectFn;
      effectStack.push(effectFn);
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  // 原有代码...
}
```

4. **优化`getEffectFns`函数**：可以使用更高效的方式收集副作用函数：

```javascript
function getEffectFns(target, type, key) {
  const propMap = targetMap.get(target);
  if (!propMap) return;
  
  const effectFns = new Set();
  const keysToProcess = [key];
  
  // 处理迭代操作
  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    keysToProcess.push(ITERATE_KEY);
  }
  
  // 获取对应的跟踪操作类型
  const trackTypes = getTrackTypesForTriggerType(type);
  
  // 收集副作用函数
  for (const key of keysToProcess) {
    const typeMap = propMap.get(key);
    if (!typeMap) continue;
    
    for (const trackType of trackTypes) {
      const depSet = typeMap.get(trackType);
      if (depSet) {
        depSet.forEach(effectFns.add, effectFns);
      }
    }
  }
  
  return effectFns;
}

// 提取为单独的函数，提高可读性和可维护性
function getTrackTypesForTriggerType(type) {
  const TriggerTypeMap = {
    [TriggerOpTypes.SET]: [TrackOpTypes.GET],
    [TriggerOpTypes.ADD]: [TrackOpTypes.GET, TrackOpTypes.HAS, TrackOpTypes.ITERATE],
    [TriggerOpTypes.DELETE]: [TrackOpTypes.GET, TrackOpTypes.HAS, TrackOpTypes.ITERATE],
    [TriggerOpTypes.CLEAR]: [TrackOpTypes.ITERATE],
  };
  return TriggerTypeMap[type] || [];
}
```