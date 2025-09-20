---
title: vue3相关
date: 2025-09-20 12:41:23
permalink: /pages/b406e9
categories:
  - src
  - vue
---
# Vue 3 相关知识

## 1. setup

### 1.1 基本介绍

setup 函数是 Vue 3 Composition API 的入口函数，组件中所用到的：数据、方法、计算属性、监听器等，都需要在 setup 中定义。

```vue
<template>
  <div>{{msg}}</div>
</template>

<script>
  export default {
    setup() {
      const msg = 'Hello Vue 3'
      return {
        msg
      }
    }
  }
</script>
```
### 1.2 注意事项

1. `setup` 函数的执行时机在 `beforeCreate` 之前
2. `setup` 函数中的 `this` 指向 `undefined`
3. `setup` 函数返回的对象中的属性和方法，都可以在模板中直接使用

### 1.3 setup 的参数

```javascript
// props: 接收组件传递的属性
// context: 上下文对象，包含 attrs、slots、emit
setup(props, context) {
  console.log(props)
  console.log(context.attrs)
  console.log(context.slots)
  console.log(context.emit)
}
```
## 2. ref 函数

### 2.1 基本介绍

ref 函数用来定义响应式数据，一般用于定义基本类型的数据（String、Number、Boolean 等）。

```javascript
import { ref } from 'vue'
setup() {
  const count = ref(0)
  const name = ref('张三')
  const isShow = ref(false)
  
  // 修改 ref 创建的响应式数据时，需要通过 .value 属性
  function changeCount() {
    count.value++
  }
  
  return {
    count,
    name,
    isShow,
    changeCount
  }
}
```
### 2.2 ref 函数的注意事项

1. ref 函数可以定义任何类型的响应式数据，不仅仅是基本类型
2. 在模板中使用 ref 创建的响应式数据时，不需要通过 .value 访问
3. 在 JavaScript 中使用 ref 创建的响应式数据时，必须通过 .value 访问

## 3. reactive 函数

### 3.1 基本介绍

reactive 函数用来定义响应式对象，一般用于定义复杂的数据类型（对象、数组等）。

```javascript
import { reactive } from 'vue'
setup() {
  const user = reactive({
    name: '张三',
    age: 18,
    address: '北京市'
  })
  
  const list = reactive([1, 2, 3, 4, 5])
  
  function changeUser() {
    user.name = '李四'
    user.age = 20
  }
  
  return {
    user,
    list,
    changeUser
  }
}
```
### 3.2 reactive 函数的注意事项

1. reactive 函数只能定义对象类型的响应式数据
2. reactive 函数返回的是一个 Proxy 对象
3. 修改 reactive 创建的响应式数据时，可以直接修改对象的属性

## 4. Vue3 响应式原理

### 4.1 响应式原理概述

Vue3 使用 Proxy 对象实现响应式数据，相比于 Vue2 的 Object.defineProperty，Proxy 有以下优势：

1. 可以监听对象属性的添加和删除
2. 可以监听数组索引和长度的变化
3. 可以监听 Map、Set 等数据结构的变化
4. 性能更好

### 4.2 响应式原理实现

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      // 收集依赖
      track(target, key)
      // 如果是对象，继续递归响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      // 如果值发生了变化，触发更新
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key)
      }
      return result
    },
    deleteProperty(target, key) {
      const hasKey = key in target
      const result = Reflect.deleteProperty(target, key)
      if (hasKey) {
        // 触发更新
        trigger(target, key)
      }
      return result
    }
  })
}
```
## 5. watch 函数

### 5.1 基本介绍

watch 函数用来监听数据的变化，当数据发生变化时，执行回调函数。

```javascript
import { ref, reactive, watch } from 'vue'
setup() {
  const count = ref(0)
  const user = reactive({
    name: '张三',
    age: 18
  })
  
  // 监听 ref 创建的响应式数据
  watch(count, (newValue, oldValue) => {
    console.log('count发生了变化', newValue, oldValue)
  })
  
  // 监听 reactive 创建的响应式数据的某个属性
  watch(() => user.name, (newValue, oldValue) => {
    console.log('name发生了变化', newValue, oldValue)
  })
  
  // 监听 reactive 创建的响应式数据
  watch(user, (newValue, oldValue) => {
    console.log('user发生了变化', newValue, oldValue)
  }, {
    deep: true // 深度监听
  })
  
  // 监听多个数据
  watch([count, () => user.name], ([newCount, newName], [oldCount, oldName]) => {
    console.log('count或name发生了变化', newCount, newName)
  })
  
  return {
    count,
    user
  }
}
```
### 5.2 watch 函数的配置项

```javascript
watch(count, (newValue, oldValue) => {
  console.log('count发生了变化', newValue, oldValue)
}, {
  immediate: true, // 是否立即执行
  deep: true // 是否深度监听
})
```
## 6. watchEffect 函数

### 6.1 基本介绍

watchEffect 函数用来监听数据的变化，当数据发生变化时，执行回调函数。与 watch 函数不同的是，watchEffect 函数会自动收集依赖，不需要手动指定要监听的数据。

```javascript
import { ref, reactive, watchEffect } from 'vue'
setup() {
  const count = ref(0)
  const user = reactive({
    name: '张三',
    age: 18
  })
  
  // watchEffect 会自动收集依赖
  const stop = watchEffect(() => {
    console.log('count:', count.value)
    console.log('name:', user.name)
  })
  
  // 停止监听
  function stopWatch() {
    stop()
  }
  
  return {
    count,
    user,
    stopWatch
  }
}
```
### 6.2 watchEffect 与 watch 的区别

1. watchEffect 会自动收集依赖，不需要手动指定要监听的数据
2. watchEffect 会立即执行一次，而 watch 默认不会立即执行
3. watchEffect 无法获取到数据变化前的值
4. watchEffect 可以通过返回一个函数来清理副作用

## 7. 自定义 hook

### 7.1 基本介绍

自定义 hook 是一个函数，用来封装和复用 Composition API 的逻辑。

```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter() {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement
  }
}
```
```vue
<template>
  <div>
    <p>count: {{count}}</p>
    <p>doubleCount: {{doubleCount}}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script>
  import { useCounter } from './useCounter'
  export default {
    setup() {
      const { count, doubleCount, increment, decrement } = useCounter()
      return {
        count,
        doubleCount,
        increment,
        decrement
      }
    }
  }
</script>
```
### 7.2 自定义 hook 的注意事项

1. 自定义 hook 的命名一般以 use 开头
2. 自定义 hook 可以调用其他的 hook
3. 自定义 hook 可以返回任何值

## 8. toRef

### 8.1 基本介绍

toRef 函数用来将响应式对象的某个属性转换为响应式数据。

```javascript
import { reactive, toRef } from 'vue'
setup() {
  const user = reactive({
    name: '张三',
    age: 18
  })
  
  // 将 user 对象的 name 属性转换为响应式数据
  const name = toRef(user, 'name')
  
  function changeName() {
    name.value = '李四'
  }
  
  return {
    user,
    name,
    changeName
  }
}
```
### 8.2 toRef 与 ref 的区别

1. ref 函数会创建一个新的响应式数据，而 toRef 函数不会创建新的响应式数据，只是引用响应式对象的某个属性
2. 修改 ref 创建的响应式数据，不会影响原对象；修改 toRef 创建的响应式数据，会影响原对象
3. 当原对象不是响应式对象时，toRef 创建的响应式数据不会触发视图更新

## 9. 其他 Composition API

### 9.1 shallowReactive

shallowReactive 函数用来创建浅响应式对象，只监听对象的第一层属性的变化。

```javascript
import { shallowReactive } from 'vue'
setup() {
  const user = shallowReactive({
    name: '张三',
    address: {
      city: '北京'
    }
  })
  
  // 修改第一层属性，会触发视图更新
  function changeName() {
    user.name = '李四'
  }
  
  // 修改深层属性，不会触发视图更新
  function changeCity() {
    user.address.city = '上海'
  }
  
  return {
    user,
    changeName,
    changeCity
  }
}
```
### 9.2 shallowRef

shallowRef 函数用来创建浅响应式数据，只监听 .value 的变化。

```javascript
import { shallowRef } from 'vue'
setup() {
  const user = shallowRef({
    name: '张三',
    age: 18
  })
  
  // 修改 .value，会触发视图更新
  function changeUser() {
    user.value = {
      name: '李四',
      age: 20
    }
  }
  
  // 修改 .value 的属性，不会触发视图更新
  function changeName() {
    user.value.name = '王五'
  }
  
  return {
    user,
    changeUser,
    changeName
  }
}
```
### 9.3 readonly

readonly 函数用来创建只读的响应式对象，不能修改对象的属性。

```javascript
import { reactive, readonly } from 'vue'
setup() {
  const user = reactive({
    name: '张三',
    age: 18
  })
  
  // 创建只读的响应式对象
  const readOnlyUser = readonly(user)
  
  // 尝试修改只读对象的属性，会报错
  function changeReadOnlyUser() {
    readOnlyUser.name = '李四' // 报错
  }
  
  return {
    user,
    readOnlyUser,
    changeReadOnlyUser
  }
}
```
### 9.4 shallowReadonly

shallowReadonly 函数用来创建浅只读的响应式对象，只限制对象的第一层属性不能修改。

```javascript
import { reactive, shallowReadonly } from 'vue'
setup() {
  const user = reactive({
    name: '张三',
    address: {
      city: '北京'
    }
  })
  
  // 创建浅只读的响应式对象
  const shallowReadOnlyUser = shallowReadonly(user)
  
  // 尝试修改第一层属性，会报错
  function changeName() {
    shallowReadOnlyUser.name = '李四' // 报错
  }
  
  // 尝试修改深层属性，可以修改
  function changeCity() {
    shallowReadOnlyUser.address.city = '上海' // 可以修改
  }
  
  return {
    user,
    shallowReadOnlyUser,
    changeName,
    changeCity
  }
}
```
### 9.5 toRefs

toRefs 函数用来将响应式对象的所有属性转换为响应式数据。

```javascript
import { reactive, toRefs } from 'vue'
setup() {
  const user = reactive({
    name: '张三',
    age: 18
  })
  
  // 将 user 对象的所有属性转换为响应式数据
  const { name, age } = toRefs(user)
  
  function changeUser() {
    name.value = '李四'
    age.value = 20
  }
  
  return {
    user,
    name,
    age,
    changeUser
  }
}
```
### 9.6 isRef

isRef 函数用来判断一个数据是否是 ref 创建的响应式数据。

```javascript
import { ref, isRef } from 'vue'
setup() {
  const count = ref(0)
  const name = '张三'
  
  console.log(isRef(count)) // true
  console.log(isRef(name)) // false
  
  return {
    count,
    name
  }
}
```
### 9.7 isReactive

isReactive 函数用来判断一个数据是否是 reactive 创建的响应式数据。

```javascript
import { reactive, isReactive } from 'vue'
setup() {
  const user = reactive({
    name: '张三',
    age: 18
  })
  const name = '张三'
  
  console.log(isReactive(user)) // true
  console.log(isReactive(name)) // false
  
  return {
    user,
    name
  }
}
```
### 9.8 isReadonly

isReadonly 函数用来判断一个数据是否是只读的响应式数据。

```javascript
import { reactive, readonly, isReadonly } from 'vue'
setup() {
  const user = reactive({
    name: '张三',
    age: 18
  })
  const readOnlyUser = readonly(user)
  
  console.log(isReadonly(user)) // false
  console.log(isReadonly(readOnlyUser)) // true
  
  return {
    user,
    readOnlyUser
  }
}
```
### 9.9 unref

unref 函数用来获取 ref 创建的响应式数据的值，如果数据不是 ref 创建的响应式数据，则直接返回数据本身。

```javascript
import { ref, unref } from 'vue'
setup() {
  const count = ref(0)
  const name = '张三'
  
  console.log(unref(count)) // 0
  console.log(unref(name)) // 张三
  
  return {
    count,
    name
  }
}
```
### 9.10 toRaw

toRaw 函数用来获取 reactive 或 readonly 创建的响应式对象的原始对象。

```javascript
import { reactive, toRaw } from 'vue'
setup() {
  const user = {
    name: '张三',
    age: 18
  }
  const reactiveUser = reactive(user)
  const rawUser = toRaw(reactiveUser)
  
  console.log(user === rawUser) // true
  
  return {
    user,
    reactiveUser,
    rawUser
  }
}
```
### 9.11 markRaw

markRaw 函数用来标记一个对象，使其永远不会变成响应式对象。

```javascript
import { reactive, markRaw } from 'vue'
setup() {
  const user = markRaw({
    name: '张三',
    age: 18
  })
  const reactiveUser = reactive(user)
  
  console.log(user === reactiveUser) // true
  
  return {
    user,
    reactiveUser
  }
}
```
## 10. Composition API 的优势

### 10.1 更好的逻辑复用

Composition API 可以通过自定义 hook 来复用逻辑，而不需要使用 mixins，避免了命名冲突和来源不明确的问题。

### 10.2 更好的 TypeScript 支持

Composition API 是基于函数的 API，比 Options API 更容易进行 TypeScript 类型推断和类型检查。

### 10.3 更好的代码组织

Composition API 可以将相关的逻辑组织在一起，而不是分散在不同的选项中，使代码更容易阅读和维护。

### 10.4 更小的打包体积

Composition API 是按需引入的，只引入使用的 API，可以减小打包体积。

## 11. Vue3 中的新组件

### 11.1 Fragment

Fragment 组件可以让组件有多个根元素，不需要再使用一个额外的 div 来包裹所有的元素。

```vue
<template>
  <div>第一个根元素</div>
  <div>第二个根元素</div>
</template>
```
### 11.2 Teleport

Teleport 组件可以将组件的内容渲染到指定的 DOM 元素中，而不是当前组件的 DOM 结构中。

```vue
<template>
  <div>
    <teleport to="#modal-container">
      <div class="modal">
        这是一个弹窗
      </div>
    </teleport>
  </div>
</template>
```
### 11.3 Suspense

Suspense 组件可以让组件在等待异步数据时显示一个加载状态，当异步数据加载完成后再显示组件的内容。

```vue
<template>
  <div>
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      <template #fallback>
        <div>加载中...</div>
      </template>
    </Suspense>
  </div>
</template>

<script>
  import { defineAsyncComponent } from 'vue'
  const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))
  export default {
    components: {
      AsyncComponent
    }
  }
</script>
```
## 12. 总结

Vue 3 相比 Vue 2 有很多新的特性和改进，包括 Composition API、响应式原理的改进、新的组件等。Composition API 是 Vue 3 的核心特性之一，它可以更好地组织和复用组件的逻辑，提高代码的可读性和可维护性。通过学习和掌握 Vue 3 的新特性，可以更好地开发 Vue 应用。

