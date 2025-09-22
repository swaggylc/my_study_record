---
date: 2025-09-22 19:05:35
title: computed
permalink: /pages/228cf5
categories:
  - src
  - vue
  - vue3响应式原理深度解析
---
# computed.js 计算属性实现详解

## 概述

`computed.js`是Vue响应式系统的重要组成部分，负责实现计算属性（computed）的功能。计算属性是Vue中非常强大的特性，它允许开发者定义一个依赖于其他响应式数据的属性，这个属性的值会根据依赖自动计算，并且只有在依赖发生变化时才会重新计算，从而提高性能。

## 完整代码

```javascript
import { effect } from './effect.js';
import { ref } from './ref.js';

// 计算属性getter
export function computedGetter(fn, options = {}) {
  const computedRef = ref();
  let dirty = true;
  
  // 创建effect，传入调度器
  effect(fn, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        computedRef.value = runner();
      }
    },
  });
  
  const runner = effect(fn, {
    lazy: true,
  });
  
  return {
    get value() {
      if (dirty) {
        computedRef.value = runner();
        dirty = false;
      }
      return computedRef.value;
    },
    get [Symbol.toStringTag]() {
      return 'ComputedRef';
    },
  };
}

// 计算属性函数
export function computed(getterOrOptions) {
  let getter;
  let setter;
  
  // 判断参数类型
  if (typeof getterOrOptions === 'function') {
    // 函数形式，只读计算属性
    getter = getterOrOptions;
    setter = () => {
      console.warn('Computed property was assigned to but it has no setter');
    };
  } else {
    // 对象形式，可读写计算属性
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || (() => {});
  }
  
  return {
    get value() {
      return getter();
    },
    set value(newValue) {
      setter(newValue);
    },
    get [Symbol.toStringTag]() {
      return 'ComputedRef';
    },
  };
}
```

## 核心概念

### 1. 计算属性的设计

`computed.js`实现了两种形式的计算属性：
1. **只读计算属性**：通过传入一个函数来定义
2. **可读写计算属性**：通过传入一个包含`get`和`set`方法的对象来定义

计算属性的核心特性是**缓存**和**懒计算**：
- 只有在访问计算属性时才会计算其值（懒计算）
- 只有在依赖发生变化时才会重新计算（缓存）

### 2. 计算属性的依赖追踪

计算属性通过`effect.js`中的`effect`函数来实现依赖追踪。当计算属性的依赖发生变化时，会触发计算属性的重新计算（如果设置了调度器）。

## 函数详细解释

### 1. computedGetter函数

```javascript
export function computedGetter(fn, options = {}) {
  const computedRef = ref();
  let dirty = true;
  
  // 创建effect，传入调度器
  effect(fn, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        computedRef.value = runner();
      }
    },
  });
  
  const runner = effect(fn, {
    lazy: true,
  });
  
  return {
    get value() {
      if (dirty) {
        computedRef.value = runner();
        dirty = false;
      }
      return computedRef.value;
    },
    get [Symbol.toStringTag]() {
      return 'ComputedRef';
    },
  };
}
```

**功能**：创建一个带有缓存机制的计算属性getter。

**参数**：
- `fn`：计算函数，用于计算属性的值
- `options`：配置选项对象

**返回值**：
- 一个包含`value` getter的对象，类似于Ref对象

**工作原理**：
1. 创建一个Ref对象`computedRef`用于存储计算结果
2. 创建一个`dirty`标志，用于跟踪计算结果是否过期
3. 创建一个带有调度器的effect，当依赖发生变化时，将`dirty`设置为`true`并立即重新计算
4. 创建一个lazy effect作为runner，用于执行计算函数
5. 返回一个带有`value` getter的对象，在getter中检查`dirty`标志，如果为`true`则重新计算并更新`computedRef.value`

**注意**：这个实现中存在一个问题，即同时创建了两个effect，这可能会导致重复的依赖收集。这是一个需要优化的地方。

### 2. computed函数

```javascript
export function computed(getterOrOptions) {
  let getter;
  let setter;
  
  // 判断参数类型
  if (typeof getterOrOptions === 'function') {
    // 函数形式，只读计算属性
    getter = getterOrOptions;
    setter = () => {
      console.warn('Computed property was assigned to but it has no setter');
    };
  } else {
    // 对象形式，可读写计算属性
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || (() => {});
  }
  
  return {
    get value() {
      return getter();
    },
    set value(newValue) {
      setter(newValue);
    },
    get [Symbol.toStringTag]() {
      return 'ComputedRef';
    },
  };
}
```

**功能**：创建一个计算属性。

**参数**：
- `getterOrOptions`：可以是一个函数（只读计算属性）或一个包含`get`和`set`方法的对象（可读写计算属性）

**返回值**：
- 一个包含`value` getter和setter的对象，类似于Ref对象

**工作原理**：
1. 根据参数类型确定getter和setter函数
2. 如果参数是函数，创建一个只读计算属性，setter会发出警告
3. 如果参数是对象，从对象中提取getter和setter
4. 返回一个带有`value` getter和setter的对象

**注意**：这个实现没有包含缓存机制，每次访问`value`属性都会重新计算。这与Vue 3官方实现的计算属性有所不同。

## 在系统中的应用

`computed.js`在Vue响应式系统中具有重要作用：

1. `computed`函数是创建计算属性的主要入口
2. `computedGetter`函数提供了带有缓存机制的计算属性实现
3. 计算属性与`effect`和`ref`紧密配合，共同构成Vue 3响应式系统的核心功能

## 代码优化建议

1. **修复computedGetter函数中的重复effect问题**：目前的实现创建了两个effect，可以优化为只创建一个：

```javascript
export function computedGetter(fn, options = {}) {
  const computedRef = ref();
  let dirty = true;
  let value;
  
  const runner = effect(fn, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        // 触发computedRef的更新，通知依赖computed的副作用
        computedRef.value = runner();
      }
    },
  });
  
  return {
    get value() {
      if (dirty) {
        value = runner();
        dirty = false;
      }
      // 依赖收集，确保访问computed的地方能被通知更新
      track(this, TrackOpTypes.GET, 'value');
      return value;
    },
    get [Symbol.toStringTag]() {
      return 'ComputedRef';
    },
  };
}
```

需要注意的是，要实现这个优化，需要从`effect.js`中导入`track`函数。

2. **为computed函数添加缓存机制**：目前的`computed`函数实现没有缓存机制，可以添加这个功能：

```javascript
export function computed(getterOrOptions) {
  let getter;
  let setter;
  let dirty = true;
  let value;
  
  // 判断参数类型
  if (typeof getterOrOptions === 'function') {
    // 函数形式，只读计算属性
    getter = getterOrOptions;
    setter = () => {
      console.warn('Computed property was assigned to but it has no setter');
    };
  } else {
    // 对象形式，可读写计算属性
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || (() => {});
  }
  
  // 创建effect，用于依赖追踪
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true;
    },
  });
  
  return {
    get value() {
      if (dirty) {
        value = runner();
        dirty = false;
      }
      return value;
    },
    set value(newValue) {
      setter(newValue);
    },
    get [Symbol.toStringTag]() {
      return 'ComputedRef';
    },
  };
}
```

3. **统一computedGetter和computed函数的实现**：目前存在两个功能相似的函数，可以统一它们的实现：

```javascript
export function computed(getterOrOptions) {
  let getter;
  let setter;
  let dirty = true;
  let value;
  
  // 判断参数类型
  if (typeof getterOrOptions === 'function') {
    // 函数形式，只读计算属性
    getter = getterOrOptions;
    setter = () => {
      console.warn('Computed property was assigned to but it has no setter');
    };
  } else {
    // 对象形式，可读写计算属性
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || (() => {});
  }
  
  // 创建effect，用于依赖追踪
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
      }
    },
  });
  
  const computedRef = {
    get value() {
      if (dirty) {
        value = runner();
        dirty = false;
      }
      // 依赖收集
      track(computedRef, TrackOpTypes.GET, 'value');
      return value;
    },
    set value(newValue) {
      setter(newValue);
    },
    get [Symbol.toStringTag]() {
      return 'ComputedRef';
    },
  };
  
  return computedRef;
}
```

4. **增加对isComputed的支持**：可以添加一个函数来检查一个值是否是计算属性：

```javascript
export function isComputed(value) {
  return !!(value && value[Symbol.toStringTag] === 'ComputedRef');
}
```

5. **优化计算属性的依赖追踪**：可以添加一个机制来避免不必要的依赖收集：

```javascript
export function computed(getterOrOptions) {
  // ... 现有代码 ...
  
  // 创建effect，用于依赖追踪
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        // 触发更新，但不立即重新计算
        trigger(computedRef, TriggerOpTypes.SET, 'value');
      }
    },
  });
  
  const computedRef = {
    get value() {
      // 依赖收集
      track(computedRef, TrackOpTypes.GET, 'value');
      
      if (dirty) {
        dirty = false;
        value = runner();
      }
      
      return value;
    },
    // ... 现有代码 ...
  };
  
  return computedRef;
}
```

需要注意的是，要实现这个优化，需要从`effect.js`中导入`trigger`函数。

6. **增加对计算属性的调试支持**：可以添加一些调试信息，帮助开发者理解计算属性的执行情况：

```javascript
export function computed(getterOrOptions, debugOptions = {}) {
  // ... 现有代码 ...
  
  const computedRef = {
    get value() {
      if (debugOptions.onTrack) {
        debugOptions.onTrack({ target: computedRef, type: TrackOpTypes.GET, key: 'value' });
      }
      
      if (dirty) {
        if (debugOptions.onTrigger) {
          debugOptions.onTrigger({ target: computedRef, type: TriggerOpTypes.SET, key: 'value' });
        }
        
        dirty = false;
        value = runner();
      }
      
      return value;
    },
    // ... 现有代码 ...
  };
  
  return computedRef;
}
```