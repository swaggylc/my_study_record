---
date: 2025-10-11 17:35:26
title: Vue组件生命周期详解
permalink: /pages/02bb9c
categories:
  - src
  - vue
---
# Vue组件生命周期详解

Vue 组件的生命周期（Lifecycle Hooks）是指组件从创建、挂载、更新到销毁的完整过程。在这个过程中，Vue 会在特定阶段自动调用预设的函数（生命周期钩子），开发者可以在这些钩子中编写自定义逻辑，实现诸如数据请求、DOM 操作、资源清理等功能。

## 一、生命周期概述

Vue 组件的生命周期可以分为四个主要阶段：

1. **创建阶段**：组件实例被创建，初始化数据和事件
2. **挂载阶段**：组件被渲染到 DOM 中
3. **更新阶段**：组件响应数据变化而重新渲染
4. **销毁阶段**：组件从 DOM 中移除并清理资源

### 生命周期流程图（简化版）

```
创建 → 挂载 → 更新 → 销毁
```

## 二、Vue 2 vs Vue 3 生命周期对比

Vue 3 在保留了大部分 Vue 2 生命周期的基础上，进行了一些调整和优化，特别是引入了 Composition API 后提供了全新的生命周期钩子。

| Vue 2 生命周期钩子 | Vue 3 生命周期钩子 (Options API) | Vue 3 生命周期钩子 (Composition API) | 执行阶段 |
|-----------------|--------------------------------|-----------------------------------|--------|
| beforeCreate    | beforeCreate                   | setup() (替代)                     | 创建阶段 |
| created         | created                        | setup() (替代)                     | 创建阶段 |
| beforeMount     | beforeMount                    | onBeforeMount                      | 挂载阶段 |
| mounted         | mounted                        | onMounted                          | 挂载阶段 |
| beforeUpdate    | beforeUpdate                   | onBeforeUpdate                     | 更新阶段 |
| updated         | updated                        | onUpdated                          | 更新阶段 |
| beforeDestroy   | beforeUnmount                  | onBeforeUnmount                    | 销毁阶段 |
| destroyed       | unmounted                      | onUnmounted                        | 销毁阶段 |
| errorCaptured   | errorCaptured                  | onErrorCaptured                    | 错误捕获 |
| -               | -                              | onRenderTracked (调试用)            | 渲染追踪 |
| -               | -                              | onRenderTriggered (调试用)          | 渲染触发 |
| -               | -                              | onActivated (keep-alive 组件用)     | 激活状态 |
| -               | -                              | onDeactivated (keep-alive 组件用)   | 非激活状态 |

## 三、生命周期钩子详解

### 1. 创建阶段

创建阶段是组件实例从无到有的过程，主要完成数据初始化、事件配置等工作。

#### setup() (Vue 3 Composition API)
- **执行时机**：在组件实例创建之前执行，是 Composition API 的入口
- **特点**：
  - 取代了 Vue 2 中的 beforeCreate 和 created
  - 不能访问 this（因为实例还没创建）
  - 返回的变量和函数会暴露给模板和其他 Composition API 使用
- **典型用途**：初始化响应式数据、定义方法、使用 ref/reactive、调用 watch/computed、注册生命周期钩子

```javascript
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++
    
    onMounted(() => {
      console.log('组件挂载完成')
    })
    
    return { count, increment }
  }
}
```

#### beforeCreate (Vue 2 / Vue 3 Options API)
- **执行时机**：实例刚被创建，数据观测 (data observer) 和事件配置尚未完成
- **访问权限**：无法访问 data、methods、computed 等组件选项
- **用途**：极少使用，基本被 setup 取代

#### created (Vue 2 / Vue 3 Options API)
- **执行时机**：实例已经创建完成，数据、方法、计算属性、观察者 (watchers) 已经设置好
- **访问权限**：可以访问 data、methods 等组件选项
- **限制**：还不能访问 DOM（因为尚未挂载）
- **典型用途**：
  - 发送初始网络请求（如获取列表数据）
  - 初始化一些非 DOM 相关的状态
  - 适合进行数据预处理

```javascript
export default {
  data() {
    return {
      list: []
    }
  },
  created() {
    this.fetchData() // ✅ 好时机
    // document.querySelector('#app') // ❌ 可能拿不到
  },
  methods: {
    async fetchData() {
      try {
        const response = await api.getList()
        this.list = response.data
      } catch (error) {
        console.error('获取数据失败', error)
      }
    }
  }
}
```

### 2. 挂载阶段

挂载阶段是组件与 DOM 关联的过程，主要完成模板编译和 DOM 渲染。

#### beforeMount (Vue 2 / Vue 3 Options API) / onBeforeMount (Vue 3 Composition API)
- **执行时机**：在首次 render 函数执行之前，模板编译完成，但尚未挂载到 DOM
- **DOM 状态**：页面上还没有该组件的内容
- **用途**：较少使用，可以做最后的 DOM 前准备

```javascript
// Options API
beforeMount() {
  console.log('即将挂载到DOM')
}

// Composition API
onBeforeMount(() => {
  console.log('即将挂载到DOM')
})
```

#### mounted (Vue 2 / Vue 3 Options API) / onMounted (Vue 3 Composition API)
- **执行时机**：组件已经挂载到 DOM 上，render 完成，真实 DOM 已经生成
- **DOM 访问**：可以访问 this.$el (Options API) 或通过 ref 获取 DOM 元素
- **典型用途**：
  - 操作 DOM（如初始化第三方库：echarts、swiper）
  - 发送依赖 DOM 的请求（如获取元素高度）
  - 启动定时器、监听事件（记得在 unmounted 清理！）

```javascript
// Options API
mounted() {
  console.log(this.$el) // ✅ 可以访问
  this.initChart()
  this.timer = setInterval(() => {
    console.log('定时器执行')
  }, 1000)
  
  window.addEventListener('resize', this.handleResize)
}

// Composition API
import { onMounted, ref } from 'vue'

setup() {
  const chartRef = ref(null)
  let timer = null
  
  onMounted(() => {
    if (chartRef.value) {
      initChart(chartRef.value)
    }
    
    timer = setInterval(() => {
      console.log('定时器执行')
    }, 1000)
    
    window.addEventListener('resize', handleResize)
  })
  
  // 注意：在实际使用中，需要在 onUnmounted 中清理定时器和事件监听
  
  return { chartRef }
}
```

### 3. 更新阶段

更新阶段是组件响应数据变化而重新渲染的过程，主要处理数据更新和视图同步。

#### beforeUpdate (Vue 2 / Vue 3 Options API) / onBeforeUpdate (Vue 3 Composition API)
- **执行时机**：响应式数据更新，虚拟 DOM 重新渲染之前
- **DOM 状态**：此时 DOM 还是旧的
- **典型用途**：获取更新前的 DOM 状态（如滚动位置），适合做性能优化或状态备份

```javascript
// Options API
beforeUpdate() {
  this.scrollTop = document.documentElement.scrollTop
  console.log('数据变了，但视图还没更新')
}

// Composition API
import { onBeforeUpdate, ref } from 'vue'

setup() {
  const scrollTop = ref(0)
  
  onBeforeUpdate(() => {
    scrollTop.value = document.documentElement.scrollTop
    console.log('数据变了，但视图还没更新')
  })
  
  return { scrollTop }
}
```

#### updated (Vue 2 / Vue 3 Options API) / onUpdated (Vue 3 Composition API)
- **执行时机**：数据更新后，虚拟 DOM 重新渲染并应用到真实 DOM 之后
- **DOM 状态**：DOM 已经更新
- **注意事项**：需要小心使用，避免无限更新循环（比如在 updated 中又修改了响应式数据）
- **典型用途**：操作更新后的 DOM，通常配合 nextTick 使用

```javascript
// Options API
updated() {
  console.log('视图已更新')
  // 避免在这里修改导致更新的数据
  this.$nextTick(() => {
    // 确保 DOM 已经完全更新
    this.doSomethingAfterUpdate()
  })
}

// Composition API
import { onUpdated, nextTick } from 'vue'

setup() {
  onUpdated(() => {
    console.log('视图已更新')
    nextTick(() => {
      // 确保 DOM 已经完全更新
      doSomethingAfterUpdate()
    })
  })
}
```

### 4. 销毁阶段

销毁阶段是组件从 DOM 中移除并清理资源的过程，主要完成资源释放和事件解绑。

#### beforeUnmount (Vue 3 Options API) / beforeDestroy (Vue 2) / onBeforeUnmount (Vue 3 Composition API)
- **执行时机**：组件即将被卸载，但实例仍然完全可用
- **典型用途**：
  - 清理定时器、事件监听器、订阅等
  - 解除与第三方库的绑定
  - 避免内存泄漏

```javascript
// Options API (Vue 3)
beforeUnmount() {
  clearInterval(this.timer)
  window.removeEventListener('resize', this.handleResize)
  if (this.chartInstance) {
    this.chartInstance.dispose()
  }
}

// Composition API
import { onBeforeUnmount } from 'vue'

setup() {
  let timer = null
  let chartInstance = null
  
  // ... 其他代码 ...
  
  onBeforeUnmount(() => {
    clearInterval(timer)
    window.removeEventListener('resize', handleResize)
    if (chartInstance) {
      chartInstance.dispose()
    }
  })
}
```

#### unmounted (Vue 3 Options API) / destroyed (Vue 2) / onUnmounted (Vue 3 Composition API)
- **执行时机**：组件已经从 DOM 中移除，所有实例绑定都被解除
- **访问权限**：this 仍然可用，但不要修改数据或调用方法
- **用途**：最后的清理工作（如通知、日志）

```javascript
// Options API (Vue 3)
unmounted() {
  console.log('组件已卸载')
  // 最后的日志记录或通知
}

// Composition API
import { onUnmounted } from 'vue'

setup() {
  onUnmounted(() => {
    console.log('组件已卸载')
    // 最后的日志记录或通知
  })
}
```

### 5. 其他生命周期钩子

#### errorCaptured / onErrorCaptured
- **执行时机**：当捕获到后代组件的错误时调用
- **参数**：(err, vm, info)，分别是错误对象、发生错误的组件实例、错误来源信息
- **返回值**：返回 false 可以阻止错误继续向上传播
- **用途**：错误上报、降级处理

```javascript
// Options API
errorCaptured(err, vm, info) {
  console.error('捕获到组件错误:', err, info)
  // 错误上报
  reportError(err, info)
  // 返回 false 阻止错误冒泡
  return false
}

// Composition API
import { onErrorCaptured } from 'vue'

setup() {
  onErrorCaptured((err, instance, info) => {
    console.error('捕获到组件错误:', err, info)
    // 错误上报
    reportError(err, info)
    // 返回 false 阻止错误冒泡
    return false
  })
}
```

#### onRenderTracked / onRenderTriggered (Vue 3 Composition API，调试用)
- **onRenderTracked**：当某个响应式依赖被追踪时触发
- **onRenderTriggered**：当依赖变化导致重新渲染时触发
- **用途**：用于调试响应式系统

```javascript
import { onRenderTracked, onRenderTriggered } from 'vue'

setup() {
  onRenderTracked((event) => {
    console.log('追踪了依赖:', event)
    // event.target: 触发追踪的响应式对象
    // event.type: 追踪类型
    // event.key: 被追踪的属性键
  })
  
  onRenderTriggered((event) => {
    console.log('触发了渲染:', event)
    // event.target: 触发更新的响应式对象
    // event.type: 触发类型
    // event.key: 导致更新的属性键
  })
}
```

#### onActivated / onDeactivated (Vue 3 Composition API，keep-alive 组件用)
- **onActivated**：当 keep-alive 包裹的组件被激活时触发
- **onDeactivated**：当 keep-alive 包裹的组件被停用时触发
- **用途**：处理 keep-alive 组件的激活和停用逻辑

```javascript
import { onActivated, onDeactivated } from 'vue'

setup() {
  onActivated(() => {
    console.log('组件被激活')
    // 可以在这里重新启动数据轮询等
  })
  
  onDeactivated(() => {
    console.log('组件被停用')
    // 可以在这里暂停数据轮询等
  })
}
```

## 四、生命周期执行顺序（父子组件）

当组件存在嵌套关系时，生命周期钩子的执行顺序遵循一定的规律。

### 挂载阶段执行顺序

```
父 beforeCreate
父 created
父 beforeMount
  子 beforeCreate
  子 created
  子 beforeMount
  子 mounted
父 mounted
```

### 更新阶段执行顺序

```
父 beforeUpdate
  子 beforeUpdate
  子 updated
父 updated
```

### 销毁阶段执行顺序

```
父 beforeUnmount
  子 beforeUnmount
  子 unmounted
父 unmounted
```

**记忆口诀**：
- 挂载：父前子后（父组件先开始挂载，子组件挂载完成后，父组件才完成挂载）
- 更新：父前子后（同上）
- 销毁：父前子后（同上）

## 五、实际应用场景

### 1. 数据请求

**最佳时机**：created (Options API) 或 setup (Composition API)

```javascript
// Options API
created() {
  this.loadUserData()
},
methods: {
  async loadUserData() {
    this.loading = true
    try {
      const response = await api.getUserInfo()
      this.userData = response.data
    } catch (error) {
      this.error = '加载用户数据失败'
    } finally {
      this.loading = false
    }
  }
}

// Composition API
import { ref, onBeforeMount } from 'vue'

setup() {
  const userData = ref(null)
  const loading = ref(false)
  const error = ref('')
  
  const loadUserData = async () => {
    loading.value = true
    try {
      const response = await api.getUserInfo()
      userData.value = response.data
    } catch (err) {
      error.value = '加载用户数据失败'
    } finally {
      loading.value = false
    }
  }
  
  // 可以在 setup 中直接调用，或使用 onBeforeMount
  onBeforeMount(() => {
    loadUserData()
  })
  
  return { userData, loading, error }
}
```

### 2. DOM 操作与第三方库集成

**最佳时机**：mounted (Options API) 或 onMounted (Composition API)

```javascript
// 集成 ECharts 示例
// Options API
mounted() {
  this.initChart()
},
beforeUnmount() {
  if (this.chartInstance) {
    this.chartInstance.dispose()
  }
},
methods: {
  initChart() {
    const chartDom = document.getElementById('my-chart')
    this.chartInstance = echarts.init(chartDom)
    
    const option = {
      // ECharts 配置项
      title: { text: '示例图表' },
      // ... 其他配置
    }
    
    this.chartInstance.setOption(option)
    
    // 监听窗口大小变化，自动调整图表大小
    window.addEventListener('resize', this.handleResize)
  },
  handleResize() {
    if (this.chartInstance) {
      this.chartInstance.resize()
    }
  }
}

// Composition API
import { onMounted, onBeforeUnmount, ref } from 'vue'

setup() {
  const chartRef = ref(null)
  let chartInstance = null
  
  const initChart = () => {
    if (chartRef.value) {
      chartInstance = echarts.init(chartRef.value)
      
      const option = {
        // ECharts 配置项
        title: { text: '示例图表' },
        // ... 其他配置
      }
      
      chartInstance.setOption(option)
    }
  }
  
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }
  
  onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    if (chartInstance) {
      chartInstance.dispose()
    }
  })
  
  return { chartRef }
}
```

### 3. 定时器与事件监听

**创建时机**：mounted (Options API) 或 onMounted (Composition API)
**清理时机**：beforeUnmount (Options API) 或 onBeforeUnmount (Composition API)

```javascript
// Options API
mounted() {
  // 启动定时器
  this.timer = setInterval(() => {
    this.updateCount()
  }, 1000)
  
  // 添加事件监听
  window.addEventListener('scroll', this.handleScroll)
},
beforeUnmount() {
  // 清理定时器
  clearInterval(this.timer)
  
  // 移除事件监听
  window.removeEventListener('scroll', this.handleScroll)
}

// Composition API
import { onMounted, onBeforeUnmount, ref } from 'vue'

setup() {
  const count = ref(0)
  let timer = null
  
  const updateCount = () => {
    count.value++
  }
  
  const handleScroll = () => {
    // 处理滚动事件
  }
  
  onMounted(() => {
    // 启动定时器
    timer = setInterval(updateCount, 1000)
    
    // 添加事件监听
    window.addEventListener('scroll', handleScroll)
  })
  
  onBeforeUnmount(() => {
    // 清理定时器
    clearInterval(timer)
    
    // 移除事件监听
    window.removeEventListener('scroll', handleScroll)
  })
  
  return { count }
}
```

## 六、常见问题与解决方案

### 1. 为什么在 created 中无法访问 DOM？

**原因**：created 钩子执行时，组件还未挂载到 DOM，因此无法访问 DOM 元素。

**解决方案**：如果需要访问 DOM，请在 mounted 钩子中进行操作。如果在 created 中确实需要操作 DOM，可以使用 this.$nextTick (Options API) 或 nextTick (Composition API)。

```javascript
// Options API
created() {
  this.$nextTick(() => {
    // 这里可以访问 DOM，但不推荐，应该使用 mounted
    const element = document.querySelector('.my-element')
  })
}

// Composition API
import { onBeforeMount, nextTick } from 'vue'

setup() {
  onBeforeMount(() => {
    nextTick(() => {
      // 这里可以访问 DOM，但不推荐，应该使用 onMounted
      const element = document.querySelector('.my-element')
    })
  })
}
```

### 2. 如何避免在 updated 钩子中导致无限循环？

**原因**：在 updated 钩子中修改响应式数据会触发新一轮的更新，导致无限循环。

**解决方案**：
- 避免在 updated 钩子中修改响应式数据
- 如果必须修改，请添加条件判断，确保只在特定条件下修改
- 使用 this.$nextTick (Options API) 或 nextTick (Composition API) 包装操作

```javascript
// 错误示例 - 会导致无限循环
updated() {
  this.count++ // 修改响应式数据，会再次触发 updated
}

// 正确示例
updated() {
  if (this.needUpdate) {
    this.$nextTick(() => {
      // 执行不会导致响应式数据变化的操作
      this.doSomethingWithoutChangingData()
    })
  }
}
```

### 3. 为什么我的组件没有销毁？

**原因**：组件只有在从 DOM 中移除时才会触发销毁钩子，以下情况可能导致组件未正确销毁：
- 组件仍在 DOM 树中
- 存在对组件实例的外部引用
- 定时器、事件监听器等未清理

**解决方案**：
- 确保组件从 DOM 中正确移除
- 清理所有外部引用
- 在 beforeUnmount 钩子中清理所有资源

## 七、最佳实践总结

### 1. 数据请求

- **推荐时机**：created 或 setup（支持异步操作）
- **优势**：组件实例已创建，可以访问响应式数据和方法，请求可以与 DOM 挂载并行执行，提升性能
- **提示**：设置加载状态，处理错误情况，避免白屏

### 2. DOM 操作

- **推荐时机**：mounted 或 onMounted
- **优势**：组件已挂载到 DOM，真实 DOM 已生成，可以安全地进行 DOM 操作
- **提示**：优先使用 Vue 的声明式渲染，只在必要时进行手动 DOM 操作

### 3. 资源清理

- **推荐时机**：beforeUnmount 或 onBeforeUnmount
- **清理内容**：定时器、事件监听器、WebSocket 连接、第三方库实例等
- **重要性**：避免内存泄漏，确保组件完全卸载

### 4. 生命周期钩子选择

| 操作类型 | 推荐钩子 | 不推荐钩子 |
|---------|---------|----------|
| 数据初始化 | setup / created | beforeCreate |
| 数据请求 | setup / created | mounted（除非依赖 DOM） |
| DOM 操作 | mounted / onMounted | created / beforeMount |
| 第三方库初始化 | mounted / onMounted | created / beforeMount |
| 定时器/事件监听 | mounted / onMounted | 任意未清理的钩子 |
| 定时器/事件清理 | beforeUnmount / onBeforeUnmount | unmounted / onUnmounted |
| 错误处理 | errorCaptured / onErrorCaptured | 全局错误捕获 |

### 5. Composition API 生命周期使用建议

- 使用 `onMounted` 替代 Options API 的 `mounted`
- 使用 `onBeforeUnmount` 替代 Options API 的 `beforeUnmount`
- 将相关逻辑组合在一起，而不是分散在不同的生命周期钩子中
- 利用闭包特性管理组件状态，避免使用 this

🎯 **核心原则**：数据请求放 created 或 setup，DOM 操作放 mounted，清理工作放 beforeUnmount。

通过掌握 Vue 组件的生命周期，开发者可以更好地控制组件的行为，编写更加高效、可靠的 Vue 应用。生命周期钩子为我们提供了在特定时间点介入组件运行过程的能力，合理利用这些钩子可以解决许多实际开发中的问题。