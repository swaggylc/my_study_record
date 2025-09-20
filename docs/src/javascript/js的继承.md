---
title: js的继承
date: 2025-09-20 12:41:23
permalink: /pages/32f726
categories:
  - src
  - javascript
---
# JavaScript 的继承机制

JavaScript 是一种基于原型（Prototype）的语言，而不是传统的基于类（Class）的语言。虽然 ES6 引入了 `class` 关键字，但这只是一种语法糖，JavaScript 的继承机制仍然基于原型链。本文将详细介绍 JavaScript 中常见的几种继承方式及其实现原理。

## 一、原型链继承

原型链继承是 JavaScript 中最基本的继承方式，其核心思想是通过修改子类的原型对象指向父类的实例来实现继承。

### 实现原理

```javascript
function Parent() {
  this.name = "parent";
}

// 父类原型链上的方法
Parent.prototype.say = function () {
  console.log("hello world");
};

function Child() {
  this.age = "18";
}

// 更改子类的原型链指向父类的实例
Child.prototype = new Parent();

var child1 = new Child();
// 子类实例可以调用父类原型链上的方法
child1.say(); // 输出: hello world
console.log(child1.name); // 输出: parent
console.log(child1.age); // 输出: 18
```
### 优缺点分析

**优点**：
- 实现简单，易于理解
- 能够继承父类的属性和方法

**缺点**：
- 所有子类实例共享父类实例的属性（如果父类属性是引用类型，一个实例修改会影响所有实例）
- 创建子类实例时，无法向父类构造函数传递参数
- 子类原型上的 constructor 属性被重写，指向了 Parent

## 二、构造函数继承

构造函数继承（也称为借用构造函数继承）通过在子类构造函数中调用父类构造函数来实现属性的继承。

### 实现原理

```javascript
function Parent(name) {
  console.log("Parent方法执行", this);
  this.name = name;
}

Parent.prototype.getName = function () {
  console.log(this.name);
};

function Child(age, name) {
  console.log("Child方法执行", this);
  // 调用父类的构造函数，通过call改变this指向
  Parent.call(this, name);
  this.age = age;
}

let child = new Child(18, "张三");
// 无法调用父类原型链上的方法
// child.getName(); // 会报错: child.getName is not a function

console.log(child); // 输出: Child { name: '张三', age: 18 }
```
### 优缺点分析

**优点**：
- 解决了原型链继承中所有实例共享父类引用属性的问题
- 可以在创建子类实例时向父类构造函数传递参数

**缺点**：
- 无法继承父类原型链上的方法
- 每个子类实例都会复制父类的方法，造成内存浪费
- 无法实现函数复用

## 三、原型式继承

原型式继承是由 Douglas Crockford 提出的一种继承方式，主要基于 `Object.create()` 方法实现。

### 实现原理

```javascript
const parent = {
  name: "parent",
  age: 18,
  say() {
    console.log("hello world");
  },
};

// 创建一个以parent为原型的新对象
const child = Object.create(parent);
child.age = 20;

console.log(child.name); // 输出: parent
console.log(child.age); // 输出: 20
child.say(); // 输出: hello world
```
### 优缺点分析

**优点**：
- 不需要使用构造函数，直接通过对象创建继承关系
- 实现简单，适合需要创建相似对象的场景

**缺点**：
- 与原型链继承类似，所有实例仍然共享父对象的引用类型属性
- 无法向父对象传递参数
- 无法实现函数复用

## 四、寄生组合继承

寄生组合继承结合了构造函数继承和原型式继承的优点，是 JavaScript 中最理想的继承实现方式。

### 实现原理

```javascript
function Parent(name) {
  this.name = name;
}

Parent.prototype.say = function () {
  console.log("hello world");
};

function Child(name, age) {
  // 使用构造函数继承继承属性
  Parent.call(this, name);
  this.age = age;
}

// 使用原型式继承继承方法，避免不必要的属性继承
Child.prototype = Object.create(Parent.prototype);
// 修复constructor指向
Child.prototype.constructor = Child;

let child = new Child("张三", 18);
child.say(); // 输出: hello world
console.log(child); // 输出: Child { name: '张三', age: 18 }
console.log(child.constructor); // 输出: [Function: Child]
```
### 优缺点分析

**优点**：
- 解决了原型链继承中共享引用类型的问题
- 能够继承父类原型链上的方法，实现了函数复用
- 可以在创建子类实例时向父类构造函数传递参数
- 修复了 constructor 指向问题

**缺点**：
- 实现相对复杂

## 五、ES6 Class 继承

ES6 引入了 `class` 关键字和 `extends` 语法，使 JavaScript 的继承更加清晰和符合面向对象编程的习惯。这实际上是原型继承的语法糖，但提供了更好的可读性和开发体验。

### 实现原理

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
  
  say() {
    console.log("hello world");
  }
}

class Child extends Parent {
  constructor(name, age) {
    // 调用父类的constructor
    super(name);
    this.age = age;
  }
}

const child = new Child("张三", 18);
child.say(); // 输出: hello world
console.log(child); // 输出: Child { name: '张三', age: 18 }
```
### 注意事项

- `super()` 必须在子类构造函数中调用，且必须在访问 `this` 之前调用
- 静态方法可以通过 `static` 关键字定义，静态方法可以被子类继承
- `class` 声明不会被提升，必须先声明再使用

## 六、继承方式对比

| 继承方式 | 优点 | 缺点 |
|---------|------|------|
| 原型链继承 | 实现简单，可继承父类所有方法和属性 | 引用类型属性共享，无法传参，constructor被重写 |
| 构造函数继承 | 避免引用类型共享，可向父类传参 | 无法继承原型链方法，方法无法复用 |
| 原型式继承 | 无需构造函数，适合创建相似对象 | 引用类型共享，无法传参 |
| 寄生组合继承 | 结合了原型链和构造函数的优点 | 实现相对复杂 |
| ES6 Class 继承 | 语法清晰，使用简便 | 本质仍是原型继承的语法糖 |

## 七、最佳实践

在实际开发中，推荐使用以下方式实现继承：

1. **现代项目**：优先使用 ES6 的 `class` 和 `extends` 语法，更加清晰和易于维护
2. **需要兼容旧浏览器**：使用寄生组合继承方式
3. **简单对象继承**：使用 `Object.create()` 实现原型式继承

## 八、总结

JavaScript 的继承机制基于原型链，而不是传统的类继承。通过本文介绍的几种继承方式，我们可以根据实际需求选择合适的实现方式。理解 JavaScript 的原型继承机制对于掌握这门语言至关重要，也是深入学习框架如 Vue、React 等的基础。
