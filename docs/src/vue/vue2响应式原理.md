# Vue 2 响应式原理详解

Vue 2 的响应式原理是其核心特性之一，它使得数据的变化能够自动触发视图的更新。其核心实现依赖于 `Object.defineProperty` 方法，通过数据劫持结合发布-订阅模式来实现。

## 1. 核心：Object.defineProperty

Vue 2 在初始化数据时，会遍历 `data` 对象中的每一个属性，使用 `Object.defineProperty` 将它们转换为 getter 和 setter。

```javascript
const person = {
  name: "张三",
  age: 18,
};

defineProperty(person);

function showName() {
  console.log(person.name);
}
function showAge() {
  console.log(person.age);
}

function aotuRun(fn) {
  global.__runFunc = fn;
  fn();
  global.__runFunc = null;
}

aotuRun(showName);
aotuRun(showAge);

person.name = "李四";

function defineProperty(obj) {
  for (let key in obj) {
    let interValue = obj[key];
    let func = [];
    Object.defineProperty(obj, key, {
      get: function () {
        if (global.__runFunc && !func.includes(global.__runFunc))
          func.push(global.__runFunc);
        return interValue;
      },
      set: function (value) {
        // 修复 bug：先更新值，再调用依赖函数
        interValue = value;
        for (let i = 0; i < func.length; i++) {
          func[i]();
        }
      },
    });
  }
}
```

- **getter**：在读取属性时触发，用于 **收集依赖**。
- **setter**：在修改属性时触发，用于 **通知更新**。

## 2. 依赖收集（Dep 与 Watcher）

Vue 使用 **发布-订阅模式** 来管理依赖关系。

- **Dep（依赖）**：每个响应式属性都有一个 Dep 实例，用来存储所有依赖于该属性的 Watcher。
- **Watcher（观察者）**：代表一个需要更新的视图或计算属性。当数据变化时，会通知对应的 Watcher 进行更新。

### 收集过程：
1. 当组件渲染时，会读取 data 中的数据，触发 getter。
2. getter 中会将当前的 Watcher 添加到 Dep 的依赖列表中。
3. 这样就建立了 **数据 -> 视图** 的依赖关系。

### 更新过程：
1. 当数据被修改时，触发 setter。
2. setter 调用 Dep.notify()，通知所有依赖的 Watcher。
3. Watcher 执行更新函数，重新渲染视图。

## 3. Observer（观察者）

Vue 会为 data 对象创建一个 Observer 实例，负责将对象的所有属性转换为响应式。

- 遍历对象的每个属性，使用 defineReactive 函数（内部调用 Object.defineProperty）。
- 如果属性值是对象，递归地将其也转换为响应式。

## 4. 局限性

由于 Object.defineProperty 的限制，Vue 2 的响应式存在一些不足：

### 无法检测对象属性的添加或删除：

```javascript
vm.obj.newProp = 'hi' // 不会触发更新
delete vm.obj.prop   // 不会触发更新
```

**解决方案**：使用 `Vue.set(vm.obj, 'newProp', 'hi')` 或 `this.$set`。

### 无法检测数组索引的变化或长度的直接修改：

```javascript
vm.items[0] = 'new'     // 不会触发更新
vm.items.length = 0     // 不会触发更新
```
**PS：为什么数组直接修改索引不会触发更新？**

**原因**：数组的索引是对象的属性，但VUE没有为数组的每一个索引属性定义 getter/setter，因为数组的长度通常较大且变化频繁，为每个索引都定义 getter/setter 会导致性能问题。

**解决方案**：使用 `Vue.set`、`splice`、`push` 等数组方法。

## 5. 总结

Vue 2 响应式原理流程：

1. 初始化时，通过 Observer 遍历 data，使用 Object.defineProperty 劫持属性。
2. 渲染视图时，触发 getter，进行 **依赖收集**，建立 Dep 与 Watcher 的关系。
3. 数据变化时，触发 setter，通过 Dep 通知所有 Watcher 进行 **视图更新**。
