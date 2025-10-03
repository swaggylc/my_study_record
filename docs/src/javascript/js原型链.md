---
title: js原型链
date: 2025-09-20 12:41:23
permalink: /pages/7ffce1
categories:
  - src
  - javascript
---
# JavaScript 原型链详解


JavaScript 的原型链（Prototype Chain）是其实现继承和属性查找机制的核心机制。由于 JavaScript 没有传统的“类”继承（如 Java 或 C++），而是采用基于原型的面向对象系统，理解原型链对于掌握 JS 至关重要。
![原型链](/img/javascript/js原型链/原型链全貌.jpg)

## 一、核心概念

### 1. 什么是原型（Prototype）？

每个**函数**都有一个内置属性 `prototype`，它是一个对象（称为"原型对象"）。
每个**对象**都有一个内部属性 `[[Prototype]]`，指向其构造函数的 `prototype` 对象。
在浏览器中，`[[Prototype]]` 通常通过 `__proto__` 属性暴露（不推荐直接使用，但可用于理解）。

```javascript
function Person(name) {
  this.name = name;
}

// Person.prototype 是一个对象
console.log(Person.prototype); // { constructor: Person }

// 创建实例
const p1 = new Person("Alice");

// p1 的 [[Prototype]] 指向 Person.prototype
console.log(p1.__proto__ === Person.prototype); // true
```
### 2. 构造函数、实例、原型的关系

可以用一句话概括：

**实例的 `__proto__` 指向构造函数的 `prototype`**。

```plaintext
实例 (p1)
  ↓ __proto__
构造函数的 prototype (Person.prototype)
  ↓ constructor
构造函数 (Person)
```
```javascript
p1.__proto__ === Person.prototype;        // true
Person.prototype.constructor === Person;  // true
```
## 二、原型链：属性查找机制

当你访问一个对象的属性时，JavaScript 引擎会按以下顺序查找：

1. 先在对象自身查找。
2. 如果没有，通过 `__proto__` 找到其原型对象，再在原型中查找。
3. 如果还没有，继续查找原型的原型，直到原型链的末端（null）。

这个过程就是原型链。

### 示例：

```javascript
function Person(name) {
  this.name = name;
}

// 给原型添加方法
Person.prototype.sayHello = function () {
  console.log("Hello, " + this.name);
};

const p1 = new Person("Alice");

p1.sayHello(); // "Hello, Alice"
```
执行过程：

```plaintext
p1.sayHello()
  → p1 自身有没有 sayHello? 没有
  → 查找 p1.__proto__ (即 Person.prototype)
  → Person.prototype 有 sayHello 方法 → 调用
```
## 三、原型链的终点：Object.prototype

几乎所有对象的最终原型链都会指向 `Object.prototype`，它是所有对象的"祖先"。

```javascript
console.log(p1.__proto__ === Person.prototype);           // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null （原型链终点）
```
所以完整的原型链是：

```plaintext
p1 
  → Person.prototype 
    → Object.prototype 
      → null
```
这也是为什么所有对象都有 `toString()`、`hasOwnProperty()` 等方法——它们定义在 `Object.prototype` 上。

## 四、如何查看原型？

| 方法                       | 说明                             |
| -------------------------- | -------------------------------- |
| Object.getPrototypeOf(obj) | 推荐方式，获取对象的原型         |
| obj.__proto__              | 非标准但广泛支持，不推荐用于生产 |
| constructor.prototype      | 通过构造函数获取                 |

```javascript
Object.getPrototypeOf(p1) === Person.prototype; // true
```
## 五、修改原型（慎用）

你可以动态地给原型添加属性或方法，所有实例都会立即继承。

```javascript
Person.prototype.age = 25;

console.log(p1.age); // 25
```
⚠️ **注意**：直接替换整个 `prototype` 会影响已有实例：

```javascript
Person.prototype = {
  sayBye() {
    console.log("Bye!");
  }
};

// p1 仍然指向旧的 prototype
// p1.sayBye(); // ❌ 报错
```
## 六、ES6 类语法（语法糖）

ES6 的 `class` 只是原型继承的语法糖。

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(this.name + " makes a sound");
  }
}

class Dog extends Animal {
  speak() {
    console.log(this.name + " barks");
  }
}

const d = new Dog("Rex");
d.speak(); // "Rex barks"
```
底层依然是原型链：

```plaintext
d 
  → Dog.prototype 
    → Animal.prototype 
      → Object.prototype 
        → null
```
## 七、常见面试题

### 1. instanceof 原理？

`instanceof` 检查构造函数的 `prototype` 是否出现在对象的原型链中。

```javascript
p1 instanceof Person; // true
// 等价于：
// Person.prototype 是否在 p1 的原型链上？
```
### 2. 如何实现继承？

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function () {
  console.log(this.name + " eats");
};

function Dog(name) {
  Animal.call(this, name); // 继承属性
}

// 继承方法：Dog.prototype 的原型是 Animal.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const d = new Dog("Rex");
d.eat(); // "Rex eats"
```
## 八、总结

| 概念                      | 说明                                                      |
| ------------------------- | --------------------------------------------------------- |
| prototype                 | 函数特有的属性，指向原型对象                              |
| __proto__ / [[Prototype]] | 对象的内部属性，指向其构造函数的 prototype                |
| 原型链                    | 对象属性查找的路径：自身 → 原型 → 原型的原型 → ... → null |
| Object.prototype          | 所有对象的最终原型                                        |
| Object.getPrototypeOf()   | 获取对象原型的标准方法                                    |

✅ **记住一句话**：JavaScript 中，一切对象的属性查找，都是沿着原型链向上查找的。

理解原型链，是理解 JavaScript 继承、this、new、class 等机制的基础。