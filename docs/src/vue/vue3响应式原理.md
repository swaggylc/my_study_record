# Vue 3 响应式原理

Vue 3 的响应式原理相比 Vue 2 是一次根本性的重构，它使用 **Proxy** 代替了 **Object.defineProperty**，解决了 Vue 2 中的诸多限制（如无法监听数组索引、对象属性增删等），并带来了更好的性能和更优雅的 API。

# 核心：Proxy + Reflect

Vue 3 的响应式系统基于 Proxy 对象实现，它能够拦截对整个对象的操作，而不仅仅是某个属性。

## 1. Proxy 是什么？

Proxy 可以为一个对象创建一个"代理"，在这个代理上可以定义各种拦截操作（如读取、赋值、删除、枚举等）。

```javascript
const obj = {
  name: "张三",
  age: 18,
  borther: {
    name: "李四",
    age: 19,
  },
};

function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}

function reactive(obj) {
  if (!isObject(obj)) {
    return obj;
  }
  const _proxy = new Proxy(obj, {
    get(target, key) {
      console.log("读取", target, ".", key);
      if (isObject(target[key])) {
        return reactive(target[key]);
      }
      return target[key];
    },
    set(target, key, value) {
      console.log("设置", target, ".", key, " 为 ", value);
      target[key] = value;
    },
  });
  return _proxy;
}

const proxyObj = reactive(obj);
proxyObj.name;
proxyObj.age = 1;
proxyObj.borther.name;
proxyObj.borther.age = 2;
```
## 2. 响应式核心流程

Vue 3 的响应式系统主要由以下几个部分组成：

#### ✅ (1) reactive / readonly / shallowReactive

- **reactive(obj)**：返回一个响应式代理对象。
- **readonly(obj)**：返回一个只读的代理对象（可监听但不可修改）。
- **shallowReactive**：浅层响应式。

```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  user: {
    name: 'Alice'
  }
});
```
#### ✅ (2) effect（副作用函数）

Vue 内部使用 effect 来创建一个响应式的副作用函数（如组件渲染、watchEffect 等）。

```javascript
effect(() => {
  console.log(state.count); // 会触发 getter，收集依赖
});
```
当 state.count 变化时，这个函数会自动重新执行。

#### ✅ (3) track 和 trigger（依赖收集与派发更新）

- **track**：在 get 拦截中调用，用于收集依赖。
- **trigger**：在 set 拦截中调用，用于触发更新。

```javascript
let activeEffect = null;

const effect = (fn) => {
  const effectFn = () => {
    activeEffect = effectFn;
    fn(); // 执行时会触发 getter，进行依赖收集
    activeEffect = null;
  };
  effectFn.deps = []; // 存储依赖
  effectFn();
};

const targetMap = new WeakMap(); // 存储依赖关系

const track = (target, key) => {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
};

const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      effect(); // 重新执行
    });
  }
};
```
#### ✅ (4) ref

虽然 reactive 很强大，但它只能用于对象。对于原始类型（如 number、string），Vue 3 提供了 ref。

```javascript
import { ref, reactive } from 'vue';

const count = ref(0);
const state = reactive({ count });

// ref 本质是包装对象 { value: ... }
count.value++; // 必须通过 .value 访问

// 在模板中，ref 会被自动解包
```
ref 内部其实也是一个 Proxy（或带 value 属性的对象），在模板或 reactive 中使用时会自动解包。

## 3. 解决了 Vue 2 的哪些问题？

| 问题 | Vue 2 | Vue 3 |
|------|-------|-------|
| 数组索引赋值 arr[0] = val | ❌ 不监听 | ✅ 通过 Proxy 监听 |
| 删除属性 delete obj.prop | ❌ 不监听 | ✅ deleteProperty 拦截 |
| 添加新属性 obj.newProp = val | ❌ 不监听 | ✅ set 拦截 |
| 监听 Map、Set、WeakMap 等 | ❌ 不支持 | ✅ 支持 |
| 性能 | 需遍历所有属性 defineProperty | ✅ 懒代理，按需劫持 |

## 4. 响应式系统结构图（简化）

```
[effect] (渲染函数 / watchEffect)
                ↓
           读取数据 (get)
                ↓
           Proxy.get → track() → 收集依赖 (Dep)
                ↑
           数据变化 (set)
                ↓
           Proxy.set → trigger() → 触发更新
                ↓
          [effect] 重新执行
```
## 5. Vue 3 响应式 API

| API | 用途 |
|------|------|
| reactive() | 创建深层响应式对象 |
| ref() | 创建响应式引用（支持原始类型） |
| computed() | 创建计算属性 |
| watchEffect() | 立即执行函数并响应式追踪依赖 |
| watch() | 监听响应式数据，类似 Vue 2 的 watch |
| toRefs() | 将 reactive 对象转换为 ref 对象，用于解构 |

```javascript
const state = reactive({
  count: 0,
  name: 'Vue'
});

const countRef = toRef(state, 'count');
const { name } = toRefs(state); // 解构后仍保持响应式
```
## 6. 总结

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 核心机制 | Object.defineProperty | Proxy |
| 数组监听 | 拦截突变方法 | 全面监听（包括索引赋值） |
| 对象属性增删 | ❌ 需 Vue.set | ✅ 自动监听 |
| 性能 | 初始化遍历所有属性 | 按需代理，更高效 |
| 支持数据结构 | 仅普通对象/数组 | 支持 Map、Set、WeakMap 等 |

✅ Vue 3 的响应式系统更强大、更灵活、性能更好，是 Vue 2 的全面升级。

如果你使用过 Vue 2，Vue 3 的响应式会让你感觉"更自然"——你不再需要担心哪些操作不会触发更新，因为 Proxy 几乎能监听所有操作。