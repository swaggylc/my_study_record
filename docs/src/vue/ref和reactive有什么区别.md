---
date: 2025-10-11 17:41:10
title: Vue 3 ref 与 reactive 响应式API详解
permalink: /pages/bec0b6
categories:
  - src
  - vue
---
# Vue 3 ref 与 reactive 响应式API详解

在 Vue 3 的 Composition API 中，`ref` 和 `reactive` 是创建响应式数据的两个核心 API。它们虽然都用于实现数据的响应式，但在使用方式、适用场景和底层实现原理上存在重要差异。本文将深入剖析这两个 API 的区别与联系，并提供实用的使用指南。

## 一、核心概念与基础区别

### 1.1 什么是响应式数据

响应式数据是指当数据发生变化时，相关的视图和计算属性会自动更新的机制。Vue 3 通过 ES6 的 `Proxy` 和 `Reflect` API 实现了高效的响应式系统。

### 1.2 ref 与 reactive 的基础定义

- **ref**：用于创建可以包含任意类型值的响应式引用
- **reactive**：用于创建对象类型数据的响应式副本

### 1.3 核心区别概览

| 特性 | ref | reactive |
|------|-----|----------|
| **适用数据类型** | 所有类型（基本类型、对象、数组等） | 仅对象类型（Object、Array、Map、Set等） |
| **访问与修改方式** | 需要通过 `.value` 属性 | 直接访问和修改属性 |
| **模板中使用** | 自动解包，无需 `.value` | 直接使用 |
| **响应式实现方式** | 包装对象的 `.value` 属性（getter/setter） | 对象的 Proxy 代理 |
| **解构后响应性** | 变量引用保持，需通过 `.value` 访问 | 解构后失去响应性 |
| **嵌套对象处理** | 内部自动转换为 reactive | 自动递归代理所有嵌套属性 |
| **性能特点** | 轻量，适合简单值 | 对象越大，代理开销相对越大 |

## 二、使用方法与代码示例

### 2.1 ref 的使用示例

`ref` 函数接收一个初始值，返回一个带有 `.value` 属性的响应式对象：

```javascript
import { ref } from 'vue'

// 基本类型值
const count = ref(0)
const message = ref('Hello Vue 3')
const isActive = ref(false)

// 读取值
console.log(count.value) // 输出: 0

// 修改值
count.value++ // count 变为 1
message.value = 'Hello World' // 消息更新

// 对象类型
const user = ref({
  name: 'Alice',
  age: 20,
  address: {
    city: 'Beijing'
  }
})

// 访问对象属性
console.log(user.value.name) // 输出: 'Alice'

// 修改对象属性
user.value.name = 'Bob' // 直接修改
user.value.address.city = 'Shanghai' // 嵌套属性也会保持响应性
```

在 Vue 模板中使用 `ref` 时，会自动解包，不需要使用 `.value`：

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>消息: {{ message }}</p>
    <p>用户名: {{ user.name }}</p>
    <p>城市: {{ user.address.city }}</p>
  </div>
</template>
```

### 2.2 reactive 的使用示例

`reactive` 函数接收一个对象，返回该对象的响应式代理：

```javascript
import { reactive } from 'vue'

// 创建响应式对象
const state = reactive({
  count: 0,
  user: {
    name: 'Alice',
    age: 20
  },
  items: ['apple', 'banana', 'orange']
})

// 直接访问属性
console.log(state.count) // 输出: 0
console.log(state.user.name) // 输出: 'Alice'

// 直接修改属性
state.count++ // state.count 变为 1
state.user.name = 'Bob' // 用户名更新
state.items.push('grape') // 数组操作也保持响应性
```

在 Vue 模板中使用 `reactive` 对象：

```vue
<template>
  <div>
    <p>计数: {{ state.count }}</p>
    <p>用户名: {{ state.user.name }}</p>
    <ul>
      <li v-for="item in state.items" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
```

## 三、底层实现原理

### 3.1 reactive 的实现原理

`reactive` 基于 JavaScript 的 `Proxy` API 实现，它会创建一个原始对象的代理，拦截对象的各种操作（如 get、set、deleteProperty 等）：

```javascript
// reactive 简化实现原理
function reactive(target) {
  // 只处理对象类型
  if (typeof target !== 'object' || target === null) {
    return target
  }
  
  // 创建 Proxy 代理
  return new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key)
      // 获取原始值
      const result = Reflect.get(target, key, receiver)
      // 递归处理嵌套对象
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      return result
    },
    
    set(target, key, value, receiver) {
      // 获取旧值
      const oldValue = target[key]
      // 设置新值
      const result = Reflect.set(target, key, value, receiver)
      // 如果值发生变化，触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      return result
    },
    
    deleteProperty(target, key) {
      // 检查属性是否存在
      const hadKey = key in target
      // 删除属性
      const result = Reflect.deleteProperty(target, key)
      // 如果删除成功，触发更新
      if (hadKey) {
        trigger(target, key)
      }
      return result
    }
    
    // 其他拦截器...
  })
}
```

**关键点**：
- 只能代理对象类型数据，不能代理基本类型
- 会递归地将嵌套对象也转换为响应式
- 通过拦截 get/set 等操作实现依赖收集和响应式更新

### 3.2 ref 的实现原理

`ref` 的实现相对简单，它创建了一个包含 `.value` 属性的包装对象：

```javascript
// ref 简化实现原理
class RefImpl {
  public _value
  public readonly __v_isRef = true // 标记为 ref 类型
  
  constructor(initialValue) {
    // 如果初始值是对象，会使用 reactive 处理
    this._value = convert(initialValue)
  }
  
  get value() {
    // 收集依赖
    track(this, 'value')
    return this._value
  }
  
  set value(newValue) {
    // 如果新值是对象，转换为响应式
    this._value = convert(newValue)
    // 触发更新
    trigger(this, 'value')
  }
}

// 转换函数，处理对象类型
function convert(value) {
  return typeof value === 'object' && value !== null ? reactive(value) : value
}

function ref(initialValue) {
  return new RefImpl(initialValue)
}
```

**关键点**：
- `ref` 本质上是一个带有 getter/setter 的包装对象
- 当值为对象时，内部会使用 `reactive` 进行处理
- 通过 `__v_isRef` 标记来让 Vue 识别这是一个 ref 类型
- 响应式的核心在于 `.value` 属性的 getter/setter

## 四、常见问题解析

### 4.1 为什么 reactive 解构后会失去响应性？

当我们对 `reactive` 创建的响应式对象进行解构时，得到的是原始值的副本，不再是 Proxy 代理：

```javascript
const state = reactive({ count: 0, name: 'Alice' })

// ❌ 解构后不再是响应式的
const { count, name } = state
count++ // 不会触发视图更新！

// ✅ 正确的做法：保持对响应式对象的引用
state.count++ // 会触发视图更新
```

**原因**：解构操作提取的是代理对象的属性值，这些值不再经过 Proxy 的拦截，因此无法触发依赖收集和更新通知。

### 4.2 为什么 ref 解构后仍能保持响应性？

`ref` 本身是一个对象，解构出的 `value` 属性是对原始值的引用：

```javascript
const count = ref(0)

// 解构出 value 属性
const { value } = count
console.log(value) // 输出: 0

// ❌ 直接修改 value 不会触发更新
value++ // value 变为 1，但不会触发视图更新
console.log(count.value) // 仍然是 0

// ✅ 正确的做法：通过 ref 变量修改
count.value++ // 会触发视图更新
```

**关键点**：虽然 `ref` 变量可以被解构，但为了保持响应性，必须通过原始的 `ref` 变量及其 `.value` 属性进行修改。

### 4.3 Vue 模板中为什么 ref 不需要 .value？

Vue 3 在模板编译时会自动对 `ref` 进行解包（Unwrapping）：

```vue
<template>
  <div>{{ count }}</div> <!-- 等价于 count.value -->
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

**实现原理**：Vue 编译器会检查模板中的变量是否是 `ref` 类型（通过 `__v_isRef` 标志判断），如果是，则自动替换为 `变量.value`。

**注意事项**：自动解包仅发生在模板、computed 和 watch 等响应式上下文中，在普通的 JavaScript 代码中仍需要使用 `.value`。

### 4.4 如何在保持响应性的前提下解构 reactive 对象？

使用 `toRefs` 函数可以将 `reactive` 对象的每个属性转换为 `ref`：

```javascript
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'Alice'
})

// 使用 toRefs 转换后解构
const { count, name } = toRefs(state)

// ✅ 现在可以通过 .value 修改并保持响应性
count.value++ // 会触发视图更新
name.value = 'Bob' // 会触发视图更新
```

`toRefs` 的作用是创建一个新对象，其中每个属性都是对原 `reactive` 对象对应属性的 `ref` 引用。

## 五、使用场景与最佳实践

### 5.1 何时使用 ref？

`ref` 适用于以下场景：

1. **基本类型数据**：数字、字符串、布尔值等
2. **需要独立使用的响应式值**：当你需要将一个值作为响应式变量单独传递时
3. **需要解构的场景**：当你需要解构对象的属性但仍保持响应性时（结合 `toRefs`）
4. **在 setup 中返回多个响应式变量**：便于在模板中直接使用，无需额外的命名空间

```javascript
// 推荐的做法：使用 ref 定义多个独立的响应式变量
const count = ref(0)
const message = ref('Hello')
const user = ref({ name: 'Alice' })

// 直接返回，模板中可直接使用
return { count, message, user }
```

### 5.2 何时使用 reactive？

`reactive` 适用于以下场景：

1. **复杂的状态对象**：包含多个相关属性的状态对象
2. **不打算解构的对象**：当你计划通过对象引用来访问和修改属性时
3. **有嵌套结构的对象**：`reactive` 会自动递归处理嵌套属性
4. **需要分组管理的相关状态**：将相关的状态属性组织在一个对象中

```javascript
// 推荐的做法：使用 reactive 管理复杂状态
const formState = reactive({
  username: '',
  password: '',
  rememberMe: false,
  validationErrors: {}
})

// 所有表单相关状态都在 formState 命名空间下
return { formState }
```

### 5.3 结合使用 ref 和 reactive

在实际开发中，我们经常会结合使用 `ref` 和 `reactive`：

```javascript
import { ref, reactive, toRefs } from 'vue'

// 使用 reactive 管理复杂状态对象
const userProfile = reactive({
  name: 'Alice',
  age: 20,
  address: {
    city: 'Beijing'
  }
})

// 使用 ref 管理简单状态和副作用
const loading = ref(false)
const error = ref(null)

// 在函数中可以混合使用
const fetchUserProfile = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await api.getUserProfile()
    // 更新 reactive 对象
    Object.assign(userProfile, data)
  } catch (err) {
    error.value = 'Failed to fetch user profile'
  } finally {
    loading.value = false
  }
}

// 使用 toRefs 保持解构后的响应性
return {
  ...toRefs(userProfile),
  loading,
  error,
  fetchUserProfile
}
```

### 5.4 性能优化建议

1. **避免对大对象使用 reactive**：`reactive` 会递归代理整个对象，对象越大，性能开销越大
2. **优先使用 ref 处理简单值**：`ref` 对基本类型的处理更加轻量高效
3. **合理使用 toRefs**：仅在需要解构时使用 `toRefs`，避免不必要的转换
4. **考虑使用 shallowRef 和 shallowReactive**：对于不需要深层响应的场景，可以使用浅响应式 API 提升性能

## 六、ref 和 reactive 的进阶用法

### 6.1 使用 isRef 和 isReactive 进行类型检查

Vue 提供了 `isRef` 和 `isReactive` 函数来检查一个值是否是响应式的：

```javascript
import { ref, reactive, isRef, isReactive } from 'vue'

const count = ref(0)
const state = reactive({ name: 'Alice' })
const normalObj = { name: 'Bob' }

console.log(isRef(count)) // true
console.log(isReactive(state)) // true
console.log(isReactive(normalObj)) // false
```

### 6.2 使用 unref 简化 ref 访问

`unref` 函数可以简化对 `ref` 值的访问，如果是 `ref` 则返回 `.value`，否则返回原值：

```javascript
import { ref, unref } from 'vue'

function useCount(value) {
  // 无论 value 是 ref 还是普通值，都能正确获取
  const currentValue = unref(value)
  // ...
}

// 等价于
function useCount(value) {
  const currentValue = isRef(value) ? value.value : value
  // ...
}
```

### 6.3 使用 shallowRef 和 shallowReactive 创建浅响应式

对于某些场景，我们可能只需要浅层的响应式，可以使用 `shallowRef` 和 `shallowReactive`：

```javascript
import { shallowRef, shallowReactive } from 'vue'

// shallowRef 只有 .value 改变时才触发更新
const shallowCount = shallowRef({ count: 0 })
shallowCount.value.count++ // 不会触发更新
shallowCount.value = { count: 1 } // 会触发更新

// shallowReactive 只代理对象的第一层属性
const shallowState = shallowReactive({
  count: 0,
  user: { name: 'Alice' }
})
shallowState.count++ // 会触发更新
shallowState.user.name = 'Bob' // 不会触发更新！
```

### 6.4 使用 triggerRef 手动触发 ref 更新

当使用 `shallowRef` 或其他情况需要手动触发更新时，可以使用 `triggerRef`：

```javascript
import { shallowRef, triggerRef } from 'vue'

const shallowObj = shallowRef({ count: 0 })

// 修改了嵌套属性，但不会自动触发更新
shallowObj.value.count++

// 手动触发更新
triggerRef(shallowObj)
```

## 七、总结

`ref` 和 `reactive` 是 Vue 3 响应式系统的两大核心 API，它们各有特点和适用场景：

- **ref**：是一个"盒子"，通过 `.value` 属性访问和修改值，适用于任何类型的数据，尤其是基本类型和需要解构的场景
- **reactive**：是一个"透明代理"，直接访问和修改属性，适用于对象类型数据，尤其是复杂的状态对象

在实际开发中，我们应该根据具体需求选择合适的 API。一般来说，对于简单的值，使用 `ref` 更加灵活；对于复杂的状态对象，使用 `reactive` 更加直观。同时，我们也可以结合 `toRefs` 等工具函数，在保持响应性的前提下，获得更好的开发体验。

记住：`ref` 是"盒子"，`reactive` 是"透明代理"。理解并掌握它们的区别与联系，将帮助你更高效地构建 Vue 3 应用。