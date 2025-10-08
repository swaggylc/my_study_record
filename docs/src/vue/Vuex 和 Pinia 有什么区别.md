---
date: 2025-10-08 18:43:38
title: Vuex 和 Pinia 有什么区别
permalink: /pages/8690e5
categories:
  - src
  - vue
---


# Vuex 和 Pinia 有什么区别详解

## 一、概述

Vuex 和 Pinia 都是 Vue.js 生态系统中专门用于状态管理的库，它们帮助开发者在复杂应用中管理和共享组件间的状态。

- **Vuex**：由 Vue.js 官方团队维护的状态管理库，适用于 Vue 2 和 Vue 3。
- **Pinia**：最初是为 Vue 3 设计的轻量级状态管理库，现在已成为 Vue 生态系统的官方推荐方案。

## 二、历史背景

### Vuex 的发展
- Vuex 于 2015 年推出，是 Vue.js 生态系统中最早的状态管理解决方案
- 经历了多个主要版本：Vuex 1.x、2.x、3.x（Vue 2 兼容）、4.x（Vue 3 兼容）
- 设计理念借鉴了 Flux、Redux 等单向数据流架构

### Pinia 的崛起
- Pinia 由 Eduardo San Martin Morote 创建，最初作为实验项目
- 2021 年正式发布，完全基于 Vue 3 的 Composition API
- 2022 年成为 Vue 生态系统的官方推荐状态管理方案
- 被视为 Vuex 的精神继任者

## 三、核心架构对比

### Vuex 的架构

Vuex 采用严格的单向数据流模式，主要包含以下核心概念：

```
State → View → Actions → Mutations → State
```

- **State**：存储应用状态的单一数据源
- **Getters**：从 State 派生的计算属性
- **Mutations**：更改 State 的唯一方法，必须是同步函数
- **Actions**：处理异步操作，可以提交 Mutations
- **Modules**：将 store 分割成模块化结构

### Pinia 的架构

Pinia 简化了 Vuex 的架构，取消了 Mutations 的概念：

```
State → Getters → Actions → State
```

- **State**：存储应用状态
- **Getters**：从 State 派生的计算属性
- **Actions**：处理同步和异步操作，直接修改 State
- **Stores**：每个 store 本身就是一个独立的模块

## 四、详细特性对比

| 特性                | Vuex                                            | Pinia                                          |
| ------------------- | ----------------------------------------------- | ---------------------------------------------- |
| **版本支持**        | Vue 2 (Vuex 3) 和 Vue 3 (Vuex 4)                | 主要支持 Vue 3，提供有限的 Vue 2 兼容性        |
| **API 风格**        | 基于传统的对象式 API，区分 Mutations 和 Actions | 基于 Composition API，统一处理同步和异步操作   |
| **模块化**          | 支持 modules，但需要命名空间，语法复杂          | 每个 store 本身就是独立模块，无需额外配置      |
| **TypeScript 支持** | 支持不完善，需要手动定义类型和使用辅助函数      | 开箱即用的 TypeScript 支持，类型推导更强大     |
| **性能**            | 相对较重，需要处理更多的概念和冗余代码          | 更轻量，bundle size 更小，启动速度更快         |
| **DevTools 支持**   | 支持，但时间旅行功能有限制                      | 更强大的 DevTools 支持，包括时间旅行和组件映射 |
| **状态持久化**      | 需要额外的插件（如 vuex-persistedstate）        | 内置更灵活的插件系统，支持状态持久化           |
| **热模块替换**      | 支持，但配置复杂                                | 开箱即用的热模块替换支持                       |
| **代码分割**        | 支持，但需要手动配置                            | 自动支持代码分割，按需加载 stores              |
| **服务端渲染**      | 支持，但配置复杂                                | 更简单的服务端渲染集成                         |

## 五、代码实现对比

### 1. 基本 Store 定义

#### Vuex

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state: {
    count: 0,
    user: null,
  },
  mutations: {
    increment(state) {
      state.count++
    },
    setUser(state, user) {
      state.user = user
    }
  },
  actions: {
    async fetchUser({ commit }) {
      const response = await fetch('/api/user')
      const user = await response.json()
      commit('setUser', user)
    },
    asyncIncrement({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2,
    isLoggedIn: (state) => !!state.user
  }
})

export default store
```

#### Pinia

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    user: null,
  }),
  actions: {
    increment() {
      this.count++
    },
    async fetchUser() {
      const response = await fetch('/api/user')
      this.user = await response.json()
    },
    async asyncIncrement() {
      setTimeout(() => {
        this.increment()
      }, 1000)
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2,
    isLoggedIn: (state) => !!state.user
  }
})
```

### 2. 组件中使用

#### Vuex（Options API）

```javascript
<script>
export default {
  computed: {
    count() {
      return this.$store.state.count
    },
    doubleCount() {
      return this.$store.getters.doubleCount
    },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    }
  },
  methods: {
    increment() {
      this.$store.commit('increment')
    },
    async loadUser() {
      await this.$store.dispatch('fetchUser')
    }
  },
  async mounted() {
    await this.loadUser()
  }
}
</script>
```

#### Vuex（Composition API）

```javascript
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const count = computed(() => store.state.count)
const doubleCount = computed(() => store.getters.doubleCount)
const isLoggedIn = computed(() => store.getters.isLoggedIn)

function increment() {
  store.commit('increment')
}

async function loadUser() {
  await store.dispatch('fetchUser')
}

loadUser()
</script>
```

#### Pinia

```vue
<script setup>
import { useCounterStore } from './stores/counter'

const counter = useCounterStore()

// 可以直接解构，但会失去响应性
// const { count, doubleCount } = counter

// 需要保持响应性时使用 computed
// import { computed } from 'vue'
// const count = computed(() => counter.count)

async function loadUser() {
  await counter.fetchUser()
}

loadUser()
</script>

<template>
  <div>
    <h1>Count: {{ counter.count }}</h1>
    <h2>Double Count: {{ counter.doubleCount }}</h2>
    <p v-if="counter.isLoggedIn">User is logged in</p>
    <button @click="counter.increment">Increment</button>
  </div>
</template>
```

### 3. 模块化实现

#### Vuex 模块化

```javascript
// store/modules/auth.js
const authModule = {
  namespaced: true,
  state: {
    user: null,
    token: null
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setToken(state, token) {
      state.token = token
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify(credentials) })
      const data = await response.json()
      commit('setUser', data.user)
      commit('setToken', data.token)
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  }
}

export default authModule

// store/index.js
import { createStore } from 'vuex'
import auth from './modules/auth'
import counter from './modules/counter'

const store = createStore({
  modules: {
    auth,
    counter
  }
})

export default store

// 组件中使用
// this.$store.state.auth.user
// this.$store.commit('auth/setUser', user)
// this.$store.dispatch('auth/login', credentials)
```

#### Pinia 模块化

```javascript
// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null
  }),
  actions: {
    async login(credentials) {
      const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify(credentials) })
      const data = await response.json()
      this.user = data.user
      this.token = data.token
    },
    logout() {
      this.user = null
      this.token = null
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  }
})

// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // ... 前面的 counter store 定义
})

// 组件中使用
import { useAuthStore } from './stores/auth'
import { useCounterStore } from './stores/counter'

const auth = useAuthStore()
const counter = useCounterStore()

// 直接使用
auth.login(credentials)
counter.increment()
```

## 六、高级特性对比

### 1. 状态持久化

#### Vuex
需要使用第三方插件：

```javascript
// store/index.js
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

const store = createStore({
  // ... store 配置
  plugins: [
    createPersistedState({
      key: 'my-app-state',
      storage: window.localStorage,
      paths: ['auth.user', 'auth.token'] // 只持久化特定路径
    })
  ]
})
```

#### Pinia
内置更灵活的插件系统：

```javascript
// stores/pinia.js
import { createPinia } from 'pinia'

// 自定义持久化插件
function persistPlugin(context) {
  const { store } = context
  const storageKey = `pinia_${store.$id}`
  
  // 初始化时从 localStorage 加载状态
  const savedState = localStorage.getItem(storageKey)
  if (savedState) {
    store.$patch(JSON.parse(savedState))
  }
  
  // 监听状态变化并保存到 localStorage
  store.$subscribe((mutation, state) => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  })
}

const pinia = createPinia()
pinia.use(persistPlugin)

export default pinia

// 也可以使用第三方插件 pinia-plugin-persistedstate
```

### 2. 插件系统

#### Vuex 插件

```javascript
const loggerPlugin = (store) => {
  // 初始化
  store.subscribe((mutation, state) => {
    console.log('mutation:', mutation.type)
    console.log('payload:', mutation.payload)
    console.log('new state:', state)
  })
}

const store = createStore({
  // ...
  plugins: [loggerPlugin]
})
```

#### Pinia 插件

```javascript
const loggerPlugin = (context) => {
  const { store } = context
  
  store.$subscribe((mutation, state) => {
    console.log(`[${store.$id}] mutation:`, mutation.events)
    console.log(`[${store.$id}] new state:`, state)
  })
  
  store.$onAction(({ name, args, after, onError }) => {
    console.log(`[${store.$id}] action ${name} called with args:`, args)
    after((result) => {
      console.log(`[${store.$id}] action ${name} succeeded with result:`, result)
    })
    onError((error) => {
      console.log(`[${store.$id}] action ${name} failed with error:`, error)
    })
  })
}

const pinia = createPinia()
pinia.use(loggerPlugin)
```

## 七、性能对比

| 性能指标          | Vuex                   | Pinia                          |
| ----------------- | ---------------------- | ------------------------------ |
| **Bundle Size**   | 较大 (~10KB gzip)      | 较小 (~1KB gzip)               |
| **内存占用**      | 较高                   | 较低                           |
| **启动时间**      | 较慢                   | 较快                           |
| **状态更新性能**  | 普通                   | 优秀，特别是大型状态树         |
| **DevTools 性能** | 一般，大型应用可能卡顿 | 更好，优化了大型应用的调试体验 |

**注意**：性能差异在小型应用中可能不明显，但在大型应用中会更加显著。

## 八、如何选择

### 选择 Vuex 的情况

1. **需要支持 Vue 2**：如果项目基于 Vue 2 且没有计划升级到 Vue 3
2. **已有的大型 Vuex 项目**：迁移成本过高的现有项目
3. **严格的单向数据流需求**：需要 Mutations 和 Actions 分离的严格架构
4. **特定的 Vuex 生态系统依赖**：项目依赖特定的 Vuex 插件或工具

### 选择 Pinia 的情况

1. **Vue 3 项目**：官方推荐的 Vue 3 状态管理方案
2. **TypeScript 项目**：需要更好的类型安全性和自动类型推导
3. **追求轻量和性能**：希望减少打包体积，提高应用性能
4. **模块化需求强**：需要简单直观的模块化方案
5. **更好的开发体验**：希望简化状态管理逻辑，提高开发效率

## 九、从 Vuex 迁移到 Pinia

### 迁移步骤

1. **安装 Pinia**
   ```bash
   npm install pinia
   # 或
   yarn add pinia
   pnpm add pinia
   ```

2. **创建 Pinia 实例**
   ```javascript
   // main.js
   import { createApp } from 'vue'
   import { createPinia } from 'pinia'
   import App from './App.vue'
   
   const app = createApp(App)
   const pinia = createPinia()
   
   app.use(pinia)
   app.mount('#app')
   ```

3. **将 Vuex store 转换为 Pinia stores**
   - 将每个 Vuex module 转换为独立的 Pinia store
   - 将 mutations 和 actions 合并为 actions
   - 保持 getters 不变
   
   ```javascript
   // Vuex module
   const userModule = {
     namespaced: true,
     state: () => ({ name: 'John' }),
     mutations: { setName(state, name) { state.name = name } },
     actions: { fetchName({ commit }) { /* ... */ } },
     getters: { greet: (state) => `Hello ${state.name}` }
   }
   
   // 转换为 Pinia store
   export const useUserStore = defineStore('user', {
     state: () => ({ name: 'John' }),
     actions: {
       setName(name) { this.name = name },
       async fetchName() { /* ... */ }
     },
     getters: { greet: (state) => `Hello ${state.name}` }
   })
   ```

4. **更新组件中的使用方式**
   - 替换 `useStore()` 为对应的 `useXXXStore()`
   - 更新状态访问、提交和分发方式

5. **处理插件和持久化**
   - 替换 Vuex 插件为 Pinia 插件
   - 重新实现状态持久化逻辑

### 迁移注意事项

1. **逐步迁移**：可以在同一个项目中同时使用 Vuex 和 Pinia，逐步迁移模块
2. **测试**：迁移后需要彻底测试应用功能
3. **类型定义**：利用 TypeScript 类型检查确保迁移的正确性
4. **性能优化**：迁移后可能需要调整组件以充分利用 Pinia 的响应性优势

## 十、最佳实践

### Vuex 最佳实践

1. **使用模块化**：将大型 store 拆分为多个模块
2. **命名空间**：始终为模块启用命名空间
3. **类型安全**：使用 TypeScript 并为 store 定义类型
4. **状态规范化**：遵循类似数据库的结构组织状态
5. **限制直接修改**：通过 mutations 和 actions 修改状态，保持可追踪性

### Pinia 最佳实践

1. **合理划分 stores**：按照功能领域划分不同的 store
2. **使用 Composition API**：充分利用 setup 语法的简洁性
3. **解构时保持响应性**：使用 `storeToRefs` 解构 store 属性
   ```javascript
   import { storeToRefs } from 'pinia'
   const { count, user } = storeToRefs(counterStore)
   ```
4. **插件优先**：利用 Pinia 的插件系统扩展功能
5. **服务端渲染优化**：在 SSR 环境中正确配置 Pinia

## 十一、总结

Vuex 和 Pinia 都是优秀的 Vue.js 状态管理解决方案，各有其适用场景：

- **Vuex** 是成熟的解决方案，适用于需要严格架构的项目，特别是仍在使用 Vue 2 的项目。
- **Pinia** 是现代、轻量的解决方案，提供更好的开发体验和性能，是 Vue 3 项目的官方推荐选择。

随着 Vue 3 的广泛采用，Pinia 正在成为 Vue 生态系统中状态管理的主流选择，其简洁的 API、优秀的 TypeScript 支持和高性能特性使其成为构建现代 Vue 应用的理想选择。