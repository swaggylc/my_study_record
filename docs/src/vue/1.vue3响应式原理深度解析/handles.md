---
date: 2025-09-22 19:03:52
title: handles
permalink: /pages/1fc12c
categories:
  - src
  - vue
  - vue3响应式原理深度解析
---
# handles.js 响应式代理处理器实现详解

## 概述

`handles.js`是Vue响应式系统的重要组成部分，负责实现JavaScript对象的代理处理器（Proxy handlers）。这些处理器通过拦截对象的各种操作（如获取属性、设置属性、删除属性等），实现依赖收集和触发更新的功能。本文件不仅包含了基本对象的代理处理器，还特别处理了数组的特殊情况，确保数组的各种方法也能正确地触发响应式更新。

## 完整代码

```javascript
import { track, trigger } from './effect.js';
import { TrackOpTypes, TriggerOpTypes } from './operations.js';
import { pauseTracking, resumeTracking } from './effect.js';

// 重写数组方法
const arrayMethods = {
  push: function push(...args) {
    const result = Array.prototype.push.apply(this, args);
    trigger(this, TriggerOpTypes.ADD, 'length');
    return result;
  },
  pop: function pop() {
    const len = this.length;
    const result = Array.prototype.pop.apply(this, arguments);
    if (len > this.length) {
      trigger(this, TriggerOpTypes.DELETE, this.length);
    }
    return result;
  },
  shift: function shift() {
    const len = this.length;
    const result = Array.prototype.shift.apply(this, arguments);
    if (len > this.length) {
      trigger(this, TriggerOpTypes.DELETE, 0);
      trigger(this, TriggerOpTypes.SET, 'length');
    }
    return result;
  },
  unshift: function unshift(...args) {
    const result = Array.prototype.unshift.apply(this, args);
    trigger(this, TriggerOpTypes.ADD, 0);
    trigger(this, TriggerOpTypes.SET, 'length');
    return result;
  },
  splice: function splice(...args) {
    const result = Array.prototype.splice.apply(this, args);
    const start = args[0];
    const deleteCount = args[1];
    const addCount = args.length - 2;
    if (deleteCount > 0) {
      trigger(this, TriggerOpTypes.DELETE, start);
    }
    if (addCount > 0) {
      trigger(this, TriggerOpTypes.ADD, start);
    }
    trigger(this, TriggerOpTypes.SET, 'length');
    return result;
  },
  sort: function sort(...args) {
    pauseTracking();
    const result = Array.prototype.sort.apply(this, args);
    resumeTracking();
    trigger(this, TriggerOpTypes.SET, 'length');
    for (let i = 0; i < this.length; i++) {
      trigger(this, TriggerOpTypes.SET, i);
    }
    return result;
  },
  reverse: function reverse(...args) {
    pauseTracking();
    const result = Array.prototype.reverse.apply(this, args);
    resumeTracking();
    for (let i = 0; i < this.length; i++) {
      trigger(this, TriggerOpTypes.SET, i);
    }
    return result;
  },
};

// 代理处理器
const handlers = {
  get(target, key, receiver) {
    if (key === '__isReactive') {
      return true;
    }
    const result = Reflect.get(target, key, receiver);
    if (Array.isArray(target) && arrayMethods.hasOwnProperty(key)) {
      return arrayMethods[key];
    }
    track(target, TrackOpTypes.GET, key);
    return result;
  },
  set(target, key, value, receiver) {
    const hasKey = Array.isArray(target) ? Number(key) < target.length : key in target;
    const result = Reflect.set(target, key, value, receiver);
    if (!hasKey) {
      trigger(target, TriggerOpTypes.ADD, key);
    } else {
      trigger(target, TriggerOpTypes.SET, key);
    }
    return result;
  },
  has(target, key) {
    const result = Reflect.has(target, key);
    track(target, TrackOpTypes.HAS, key);
    return result;
  },
  deleteProperty(target, key) {
    const hasKey = Array.isArray(target) ? Number(key) < target.length : key in target;
    const result = Reflect.deleteProperty(target, key);
    if (hasKey) {
      trigger(target, TriggerOpTypes.DELETE, key);
    }
    return result;
  },
  ownKeys(target) {
    track(target, TrackOpTypes.ITERATE, undefined);
    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, key) {
    track(target, TrackOpTypes.GET, key);
    return Reflect.getOwnPropertyDescriptor(target, key);
  },
  defineProperty(target, key, descriptor) {
    const hasKey = key in target;
    const result = Reflect.defineProperty(target, key, descriptor);
    if (!hasKey) {
      trigger(target, TriggerOpTypes.ADD, key);
    } else {
      trigger(target, TriggerOpTypes.SET, key);
    }
    return result;
  },
  preventExtensions(target) {
    const result = Reflect.preventExtensions(target);
    return result;
  },
  getPrototypeOf(target) {
    return Reflect.getPrototypeOf(target);
  },
  setPrototypeOf(target, proto) {
    const result = Reflect.setPrototypeOf(target, proto);
    return result;
  },
  isExtensible(target) {
    return Reflect.isExtensible(target);
  },
};

export default handlers;
```

## 核心概念

### 1. 代理处理器（Proxy Handlers）

`handles.js`实现了JavaScript的Proxy处理器对象，该对象包含一系列陷阱（traps）方法，这些方法用于拦截对目标对象的各种操作。Vue通过这些陷阱方法实现了响应式系统的依赖收集和触发更新机制。

### 2. 数组方法的特殊处理

数组在JavaScript中有一些特殊的方法（如push、pop、splice等），这些方法会改变数组的内容或结构。Vue特别重写了这些方法，确保它们能够正确地触发响应式更新。

### 3. 依赖收集与触发更新的时机

在`handles.js`中，依赖收集（track）和触发更新（trigger）分别在不同的操作中被调用：
- 读取操作（get、has、ownKeys等）会触发依赖收集
- 修改操作（set、deleteProperty、defineProperty等）会触发更新

## 函数详细解释

### 1. 数组方法重写

#### 1.1 push方法

```javascript
push: function push(...args) {
  const result = Array.prototype.push.apply(this, args);
  trigger(this, TriggerOpTypes.ADD, 'length');
  return result;
}
```

**功能**：向数组末尾添加一个或多个元素，并返回新的长度。

**触发更新**：触发数组的`length`属性的`ADD`操作更新。

#### 1.2 pop方法

```javascript
pop: function pop() {
  const len = this.length;
  const result = Array.prototype.pop.apply(this, arguments);
  if (len > this.length) {
    trigger(this, TriggerOpTypes.DELETE, this.length);
  }
  return result;
}
```

**功能**：删除数组的最后一个元素，并返回该元素。

**触发更新**：如果数组长度减少了（即成功删除了元素），则触发被删除位置的`DELETE`操作更新。

#### 1.3 shift方法

```javascript
shift: function shift() {
  const len = this.length;
  const result = Array.prototype.shift.apply(this, arguments);
  if (len > this.length) {
    trigger(this, TriggerOpTypes.DELETE, 0);
    trigger(this, TriggerOpTypes.SET, 'length');
  }
  return result;
}
```

**功能**：删除数组的第一个元素，并返回该元素。

**触发更新**：如果数组长度减少了，则触发索引`0`位置的`DELETE`操作更新和`length`属性的`SET`操作更新。

#### 1.4 unshift方法

```javascript
unshift: function unshift(...args) {
  const result = Array.prototype.unshift.apply(this, args);
  trigger(this, TriggerOpTypes.ADD, 0);
  trigger(this, TriggerOpTypes.SET, 'length');
  return result;
}
```

**功能**：向数组开头添加一个或多个元素，并返回新的长度。

**触发更新**：触发索引`0`位置的`ADD`操作更新和`length`属性的`SET`操作更新。

#### 1.5 splice方法

```javascript
splice: function splice(...args) {
  const result = Array.prototype.splice.apply(this, args);
  const start = args[0];
  const deleteCount = args[1];
  const addCount = args.length - 2;
  if (deleteCount > 0) {
    trigger(this, TriggerOpTypes.DELETE, start);
  }
  if (addCount > 0) {
    trigger(this, TriggerOpTypes.ADD, start);
  }
  trigger(this, TriggerOpTypes.SET, 'length');
  return result;
}
```

**功能**：通过删除、替换或添加元素来修改数组。

**参数**：
- `start`：修改的起始位置
- `deleteCount`：要删除的元素个数
- 后续参数：要添加的新元素

**触发更新**：
- 如果删除了元素，触发起始位置的`DELETE`操作更新
- 如果添加了元素，触发起始位置的`ADD`操作更新
- 触发`length`属性的`SET`操作更新

#### 1.6 sort方法

```javascript
sort: function sort(...args) {
  pauseTracking();
  const result = Array.prototype.sort.apply(this, args);
  resumeTracking();
  trigger(this, TriggerOpTypes.SET, 'length');
  for (let i = 0; i < this.length; i++) {
    trigger(this, TriggerOpTypes.SET, i);
  }
  return result;
}
```

**功能**：对数组元素进行排序。

**触发更新**：
- 排序前暂停依赖收集，避免不必要的依赖收集
- 排序后恢复依赖收集
- 触发`length`属性的`SET`操作更新
- 触发数组每个索引位置的`SET`操作更新

#### 1.7 reverse方法

```javascript
reverse: function reverse(...args) {
  pauseTracking();
  const result = Array.prototype.reverse.apply(this, args);
  resumeTracking();
  for (let i = 0; i < this.length; i++) {
    trigger(this, TriggerOpTypes.SET, i);
  }
  return result;
}
```

**功能**：颠倒数组中元素的顺序。

**触发更新**：
- 反转前暂停依赖收集，避免不必要的依赖收集
- 反转后恢复依赖收集
- 触发数组每个索引位置的`SET`操作更新

### 2. 代理处理器方法

#### 2.1 get方法

```javascript
get(target, key, receiver) {
  if (key === '__isReactive') {
    return true;
  }
  const result = Reflect.get(target, key, receiver);
  if (Array.isArray(target) && arrayMethods.hasOwnProperty(key)) {
    return arrayMethods[key];
  }
  track(target, TrackOpTypes.GET, key);
  return result;
}
```

**get方法的内部操作：**
![LOGO](/img/get内部操作.jpg)

**功能**：拦截属性的读取操作。

**特殊处理**：
- 如果读取的是`__isReactive`属性，返回`true`，用于标识对象是响应式的
- 如果目标是数组且读取的是已重写的数组方法，返回重写后的方法
- 对于普通属性读取，进行依赖收集

#### 2.2 set方法

```javascript
set(target, key, value, receiver) {
  const hasKey = Array.isArray(target) ? Number(key) < target.length : key in target;
  const result = Reflect.set(target, key, value, receiver);
  if (!hasKey) {
    trigger(target, TriggerOpTypes.ADD, key);
  } else {
    trigger(target, TriggerOpTypes.SET, key);
  }
  return result;
}
```

**功能**：拦截属性的设置操作。

**触发更新**：
- 对于数组，判断索引是否小于当前长度来确定是否是新属性
- 对于对象，使用`key in target`来判断是否是新属性
- 如果是新属性，触发`ADD`操作更新；否则触发`SET`操作更新

#### 2.3 has方法

```javascript
has(target, key) {
  const result = Reflect.has(target, key);
  track(target, TrackOpTypes.HAS, key);
  return result;
}
```
**in关键字内部操作：**
![LOGO](/img/in关键字内部实现.jpg)

**功能**：拦截`in`操作符的使用。

**触发依赖收集**：触发`HAS`操作的依赖收集。
![LOGO](/img/in操作符捕捉器.jpg)

#### 2.4 deleteProperty方法

```javascript
deleteProperty(target, key) {
  const hasKey = Array.isArray(target) ? Number(key) < target.length : key in target;
  const result = Reflect.deleteProperty(target, key);
  if (hasKey) {
    trigger(target, TriggerOpTypes.DELETE, key);
  }
  return result;
}
```

**功能**：拦截`delete`操作符的使用。

**触发更新**：如果成功删除了存在的属性，触发`DELETE`操作更新。

#### 2.5 ownKeys方法

```javascript
ownKeys(target) {
  track(target, TrackOpTypes.ITERATE, undefined);
  return Reflect.ownKeys(target);
}
```

**功能**：拦截`Object.getOwnPropertyNames`、`Object.getOwnPropertySymbols`、`Object.keys`等方法的调用。

**触发依赖收集**：触发`ITERATE`操作的依赖收集，用于迭代操作的依赖追踪。

#### 2.6 getOwnPropertyDescriptor方法

```javascript
getOwnPropertyDescriptor(target, key) {
  track(target, TrackOpTypes.GET, key);
  return Reflect.getOwnPropertyDescriptor(target, key);
}
```

**功能**：拦截`Object.getOwnPropertyDescriptor`方法的调用。

**触发依赖收集**：触发`GET`操作的依赖收集。

#### 2.7 defineProperty方法

```javascript
defineProperty(target, key, descriptor) {
  const hasKey = key in target;
  const result = Reflect.defineProperty(target, key, descriptor);
  if (!hasKey) {
    trigger(target, TriggerOpTypes.ADD, key);
  } else {
    trigger(target, TriggerOpTypes.SET, key);
  }
  return result;
}
```

**功能**：拦截`Object.defineProperty`方法的调用。

**触发更新**：根据是否是新属性，触发`ADD`或`SET`操作的更新。

## 在系统中的应用

`handles.js`中的代理处理器在Vue响应式系统中被`reactive.js`文件中的`reactive`函数使用，用于创建响应式对象。当用户访问或修改响应式对象的属性时，代理处理器会拦截这些操作，并在适当的时机调用`track`和`trigger`函数，实现依赖收集和触发更新的功能。

## 代码优化建议

1. **增加数组索引边界检查**：在数组的`set`和`deleteProperty`方法中，可以增加对索引的边界检查，确保索引是有效的数字：

```javascript
set(target, key, value, receiver) {
  const isArrayIndex = Array.isArray(target) && !isNaN(Number(key)) && Number(key) >= 0;
  const hasKey = isArrayIndex ? Number(key) < target.length : key in target;
  const result = Reflect.set(target, key, value, receiver);
  if (!hasKey) {
    trigger(target, TriggerOpTypes.ADD, key);
  } else {
    trigger(target, TriggerOpTypes.SET, key);
  }
  return result;
}
```

2. **优化数组方法的性能**：对于排序和反转操作，可以考虑只在真正需要时才触发所有索引的更新：

```javascript
sort: function sort(...args) {
  pauseTracking();
  const oldArray = [...this];
  const result = Array.prototype.sort.apply(this, args);
  resumeTracking();
  
  // 只触发实际发生变化的索引的更新
  for (let i = 0; i < this.length; i++) {
    if (this[i] !== oldArray[i]) {
      trigger(this, TriggerOpTypes.SET, i);
    }
  }
  
  if (this.length !== oldArray.length) {
    trigger(this, TriggerOpTypes.SET, 'length');
  }
  
  return result;
}
```

3. **增加对Symbol属性的特殊处理**：目前的实现对Symbol属性的处理与普通属性相同，但在某些情况下可能需要特殊处理：

```javascript
get(target, key, receiver) {
  if (key === '__isReactive') {
    return true;
  }
  const result = Reflect.get(target, key, receiver);
  if (Array.isArray(target) && arrayMethods.hasOwnProperty(key)) {
    return arrayMethods[key];
  }
  // 对Symbol属性的特殊处理
  if (typeof key === 'symbol') {
    // 可以根据需要添加特殊逻辑
  }
  track(target, TrackOpTypes.GET, key);
  return result;
}
```

4. **优化依赖收集和触发的条件**：在某些情况下，可以增加额外的条件来避免不必要的依赖收集和触发：

```javascript
get(target, key, receiver) {
  // ... 现有代码 ...
  // 只有在确实需要收集依赖时才调用track
  if (shouldTrack && activeEffect) {
    track(target, TrackOpTypes.GET, key);
  }
  return result;
}
```

5. **增加对深度响应式的支持**：在`get`方法中，可以考虑对对象类型的属性返回响应式的代理，实现深度响应式：

```javascript
get(target, key, receiver) {
  // ... 现有代码 ...
  const result = Reflect.get(target, key, receiver);
  // ... 现有代码 ...
  track(target, TrackOpTypes.GET, key);
  // 如果结果是对象，返回响应式代理
  if (typeof result === 'object' && result !== null && !result.__isReactive) {
    return reactive(result);
  }
  return result;
}
```

需要注意的是，要实现这个优化，需要在文件中导入`reactive`函数。