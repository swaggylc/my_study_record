# new 关键字的底层原理详解

使用 `new` 关键字创建对象时，JavaScript 引擎会自动执行一系列步骤。这是一个非常重要的概念，尤其在理解**构造函数**和**原型继承**时至关重要。

## ✅ 使用 new 关键字时，发生了什么？

当你执行：

```javascript
function Person(name) {
  this.name = name;
}

const p1 = new Person("Alice");
```

JavaScript 引擎会自动执行以下四个步骤：

### 🔹 步骤 1：创建一个全新的空对象

```javascript
// 1. 创建一个空对象
const obj = {};
```

这个对象最初是空的，没有任何属性。

### 🔹 步骤 2：将新对象的 [[Prototype]] 指向构造函数的 prototype

```javascript
// 2. 设置原型链
Object.setPrototypeOf(obj, Person.prototype);
// 或等价于：
// obj.__proto__ = Person.prototype;
```

这一步建立了原型链，使得新对象可以访问构造函数原型上的方法和属性。

### 🔹 步骤 3：将构造函数的 this 绑定到新对象，并执行构造函数

```javascript
// 3. 执行构造函数，this 指向 obj
Person.call(obj, "Alice");
// 相当于：
// obj.name = "Alice";
```

构造函数中的 `this` 不再指向全局对象（或 undefined），而是指向刚刚创建的新对象 `obj`。

构造函数内部的代码会为这个新对象添加属性或初始化数据。

### 🔹 步骤 4：返回新对象（除非构造函数显式返回一个对象）

```javascript
// 4. 默认返回新对象
return obj;
```

- 如果构造函数没有返回值，或者返回的是原始类型（如 number、string、boolean），则 `new` 表达式返回新创建的对象。
- 如果构造函数显式返回了一个对象，则 `new` 表达式返回该对象，忽略第一步创建的对象。

## 示例：返回对象的影响

```javascript
function Test() {
  this.a = 1;
  return { a: 2 }; // 显式返回对象
}

const t = new Test();
console.log(t.a); // 2，不是 1
```

## 示例：返回原始类型不影响

```javascript
function Test() {
  this.a = 1;
  return 100; // 返回原始类型，被忽略
}

const t = new Test();
console.log(t.a); // 1
```

## 🧩 总结：new 的模拟实现

我们可以手动模拟 `new` 的行为，写一个 `myNew` 函数：

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建空对象
  const obj = {};

  // 2. 链接到原型
  Object.setPrototypeOf(obj, Constructor.prototype);

  // 3. 绑定 this 并执行构造函数
  const result = Constructor.apply(obj, args);

  // 4. 返回对象（优先返回构造函数返回的对象）
  return result instanceof Object ? result : obj;
}

// 使用示例
function Person(name) {
  this.name = name;
}

const p1 = myNew(Person, "Alice");
console.log(p1.name); // "Alice"
```

💡 这个 `myNew` 函数就是对 `new` 操作符的底层原理的还原。

## 📌 补充：箭头函数不能用 new

```javascript
const Person = (name) => {
  this.name = name;
};

// new Person("Alice"); // ❌ 报错：Person is not a constructor
```

因为箭头函数没有自己的 `this`，也没有 `prototype` 属性，所以不能作为构造函数使用。

## 🧠 原型链图解

```plaintext
p1 (实例)
  ↓ __proto__
Person.prototype
  ↓ __proto__
Object.prototype
  ↓ __proto__
null
```

通过 `new`，`p1` 获得了 `Person.prototype` 上的所有方法，实现了继承。

## ✅ 总结：new 关键字做了什么？

| 步骤 | 操作 |
|------|------|
| 1 | 创建一个新对象 {} |
| 2 | 设置新对象的 [[Prototype]] 为构造函数的 prototype |
| 3 | 将构造函数的 this 指向新对象，并执行构造函数（初始化属性） |
| 4 | 返回新对象（除非构造函数返回了一个对象） |

💡 理解 `new` 的过程，是理解 JavaScript 原型继承和面向对象编程的基础。