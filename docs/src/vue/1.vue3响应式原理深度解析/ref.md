---
date: 2025-09-22 19:05:09
title: ref
permalink: /pages/06e09e
categories:
  - src
  - vue
  - vue3响应式原理深度解析
---
# ref.js 响应式引用实现详解

## 概述

`ref.js`是Vue响应式系统的重要组成部分，负责实现响应式引用（ref）的功能。在Vue 3中，ref主要用于将基本类型（如数字、字符串、布尔值等）转换为响应式对象，同时也可以用于创建响应式的对象引用。与`reactive`不同，ref通过一个包含`value`属性的包装对象来实现响应式。

## 完整代码

```javascript
import { track, trigger } from './effect.js';
import { TrackOpTypes, TriggerOpTypes } from './operations.js';
import { isObject } from './utils.js';
import { reactive } from './reactive.js';

// ref实现
export function ref(value) {
  const refObject = {
    get value() {
      track(refObject, TrackOpTypes.GET, 'value');
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue;
        trigger(refObject, TriggerOpTypes.SET, 'value');
      }
    },
    // 标记为ref
    __isRef: true,
  };
  return refObject;
}

// 检查是否是ref
export function isRef(value) {
  return !!(value && value.__isRef === true);
}

// 解包ref
export function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}

// 对对象的属性使用ref，自动解包
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      return unref(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
```

## 核心概念

### 1. 响应式引用的设计

`ref.js`实现了一种不同于`reactive`的响应式机制。它通过创建一个包含`value`属性的包装对象来实现响应式。当访问或修改这个`value`属性时，会触发相应的`get`和`set`拦截器，从而实现依赖收集和触发更新的功能。

这种设计的优势在于可以对基本类型进行响应式处理，而不仅仅是对象类型。

### 2. Ref对象的结构

一个典型的Ref对象具有以下特点：
- 包含一个`value`属性，用于访问和修改被包装的值
- 包含一个`__isRef`属性，用于标识这是一个Ref对象
- 当访问`value`属性时，会进行依赖收集
- 当修改`value`属性时，会触发更新

## 函数详细解释

### 1. ref函数

```javascript
export function ref(value) {
  const refObject = {
    get value() {
      track(refObject, TrackOpTypes.GET, 'value');
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue;
        trigger(refObject, TriggerOpTypes.SET, 'value');
      }
    },
    // 标记为ref
    __isRef: true,
  };
  return refObject;
}
```

**功能**：创建一个响应式的引用对象。

**参数**：
- `value`：要包装的初始值，可以是任何JavaScript值（基本类型或对象）

**返回值**：
- 一个包含`value`属性的响应式引用对象

**工作原理**：
1. 创建一个包含`get value`和`set value`访问器的对象
2. 在`get value`中进行依赖收集
3. 在`set value`中，当新值与旧值不同时，更新值并触发更新
4. 标记对象为Ref（设置`__isRef`为`true`）
5. 返回这个引用对象

### 2. isRef函数

```javascript
export function isRef(value) {
  return !!(value && value.__isRef === true);
}
```

**功能**：检查一个值是否是Ref对象。

**参数**：
- `value`：要检查的值

**返回值**：
- 布尔值，表示`value`是否是Ref对象

**工作原理**：检查值是否存在并且其`__isRef`属性是否为`true`。

### 3. unref函数

```javascript
export function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}
```

**功能**：解包一个Ref对象，返回其原始值。

**参数**：
- `ref`：一个可能是Ref对象的值

**返回值**：
- 如果`ref`是Ref对象，返回其`value`属性的值
- 否则，返回`ref`本身

**应用场景**：当你不确定一个值是否是Ref对象，但需要获取其原始值时，可以使用这个函数。

### 4. proxyRefs函数

```javascript
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      return unref(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
```

**功能**：创建一个代理对象，自动解包对象中包含的Ref属性。

**参数**：
- `objectWithRefs`：一个可能包含Ref属性的对象

**返回值**：
- 一个代理对象，访问属性时会自动解包Ref，设置属性时会自动处理Ref

**工作原理**：
1. 使用`Proxy`创建一个代理对象
2. 在`get`拦截器中，对获取的属性值调用`unref`函数进行自动解包
3. 在`set`拦截器中，如果旧值是Ref而新值不是Ref，则更新旧值的`value`属性；否则直接设置新值

**应用场景**：在Vue 3的组合式API中，`setup`函数返回的对象会自动通过`proxyRefs`处理，使得在模板中可以直接访问Ref属性而不需要使用`.value`。

## 在系统中的应用

`ref.js`在Vue响应式系统中具有重要作用：

1. `ref`函数是创建响应式数据的另一个主要入口，特别适用于基本类型数据
2. `isRef`函数用于检查一个值是否是Ref对象
3. `unref`函数用于解包Ref对象
4. `proxyRefs`函数用于创建自动解包Ref的代理对象

`ref.js`与`reactive.js`共同构成了Vue 3响应式系统的基础，它们分别适用于不同的场景：
- `reactive`适用于对象类型的数据
- `ref`适用于基本类型的数据，或者需要保持引用响应式的场景

## 代码优化建议

1. **增加对对象类型值的自动响应式处理**：目前的实现没有对对象类型的`value`进行自动响应式处理，可以添加这个功能：

```javascript
export function ref(value) {
  // 对对象类型的值进行响应式处理
  if (isObject(value)) {
    value = reactive(value);
  }
  const refObject = {
    get value() {
      track(refObject, TrackOpTypes.GET, 'value');
      return value;
    },
    set value(newValue) {
      // 对新的对象类型值进行响应式处理
      if (isObject(newValue)) {
        newValue = reactive(newValue);
      }
      if (value !== newValue) {
        value = newValue;
        trigger(refObject, TriggerOpTypes.SET, 'value');
      }
    },
    // 标记为ref
    __isRef: true,
  };
  return refObject;
}
```

2. **优化值比较逻辑**：目前的实现使用严格相等（`!==`）来比较值，可以考虑使用更精确的比较方法：

```javascript
export function ref(value) {
  const refObject = {
    get value() {
      track(refObject, TrackOpTypes.GET, 'value');
      return value;
    },
    set value(newValue) {
      // 使用更精确的比较方法
      if (!hasChange(value, newValue)) {
        return;
      }
      value = newValue;
      trigger(refObject, TriggerOpTypes.SET, 'value');
    },
    // 标记为ref
    __isRef: true,
  };
  return refObject;
}
```

需要注意的是，要实现这个优化，需要从`utils.js`中导入`hasChange`函数。

3. **增加对只读ref的支持**：目前的实现只支持可变的ref，可以考虑添加对只读ref的支持：

```javascript
export function readonlyRef(value) {
  const refObject = {
    get value() {
      track(refObject, TrackOpTypes.GET, 'value');
      return value;
    },
    // 只读ref没有set访问器
    // 标记为ref和只读
    __isRef: true,
    __isReadOnly: true,
  };
  return refObject;
}
```

4. **增加对shallowRef的支持**：目前的实现没有对`shallowRef`的支持，可以添加这个功能：

```javascript
export function shallowRef(value) {
  const refObject = {
    get value() {
      track(refObject, TrackOpTypes.GET, 'value');
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue;
        trigger(refObject, TriggerOpTypes.SET, 'value');
      }
    },
    // 标记为ref和shallow
    __isRef: true,
    __isShallow: true,
  };
  return refObject;
}
```

5. **增加自定义Ref的支持**：可以考虑添加对自定义Ref的支持，允许用户自定义get和set行为：

```javascript
export function customRef(factory) {
  const { get, set } = factory(() => track(refObject, TrackOpTypes.GET, 'value'), 
                                () => trigger(refObject, TriggerOpTypes.SET, 'value'));
  
  const refObject = {
    get value() {
      return get();
    },
    set value(newValue) {
      set(newValue);
    },
    // 标记为ref
    __isRef: true,
  };
  
  return refObject;
}
```

6. **优化proxyRefs函数**：目前的实现每次访问属性时都会调用`unref`函数，可以考虑缓存解包后的值以提高性能：

```javascript
export function proxyRefs(objectWithRefs) {
  const cache = new Map();
  
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      // 检查缓存中是否有解包后的值
      if (cache.has(key)) {
        const cached = cache.get(key);
        // 如果缓存的是Ref，返回其value；否则返回缓存的值
        return isRef(cached) ? cached.value : cached;
      }
      
      const value = Reflect.get(target, key, receiver);
      const unwrapped = unref(value);
      
      // 缓存解包后的值
      cache.set(key, value);
      
      return unwrapped;
    },
    set(target, key, value, receiver) {
      // 设置属性时清除缓存
      cache.delete(key);
      
      const oldValue = target[key];
      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
```