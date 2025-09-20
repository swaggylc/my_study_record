---
date: "2025-09-20T12:41:23+08:00"
---
# TypeScript 学习

## 1. 变量声明

### 1.1 直接声明

**语法格式**：使用 `let` 关键字声明变量，后跟冒号和类型指定

```typescript
// 声明一个变量a，同时指定它的类型为number
let a: number;

// a的类型设置为number，在以后的使用过程中a的值只能是数字
a = 10;
a = 33;
// a = 'hello'; // 此行代码会报错，因为变量a的类型是number，不能赋值字符串

let b: string;
b = "hello";
// b = 123; // 此行代码会报错，因为变量b的类型是string，不能赋值数字
```
**注意事项**：
- TypeScript 可以编译成任意版本的 JavaScript 文件（默认：TS => ES3）
- 如果变量的声明和赋值是同时进行的，TS 可以自动对变量进行类型检测

**函数参数类型声明**

```typescript
// JS中的函数不考虑参数的类型和个数
// 但TS中的函数必须考虑参数的类型和个数，如果不一致则会报错
// 也能指定返回值的类型
function sum(a: number, b: number): number {
  return a + b;
}
```
### 1.2 字面量声明

**直接使用字面量进行类型声明**

```typescript
let num: 10;
num = 10;
// num=11; // 报错，num只能是10

// 可以使用 | 来连接多个类型（联合类型）
let c: number | string | boolean;
c = 10;
c = "hello";
c = true;
```
### 1.3 特殊类型

#### any 类型

```typescript
// any类型可以赋值为任意类型，一个变量设置类型为any后相当于对该变量关闭了TS的类型检测
// 使用TS时，不建议使用any类型
let d: any; // 显式的any类型声明

// 声明变量如果不指定类型，则TS解析器会自动判断变量的类型为any（隐式的any）

let s: string;
s = d; // any类型的变量可以赋值给任意变量
```
#### unknown 类型

```typescript
// unknown表示未知类型的值，是一个类型安全的any
let e: unknown; // unknown类型的变量不能直接赋值给其他变量

// 类型断言，可以用来告诉解析器变量的实际类型
s = e as string;
s = <string>e;
```
#### void 类型

```typescript
// void用来表示空值，以函数为例，就表示没有返回值的函数
function fn(): void {
  // return null;   报错
  // return undefined;   报错
  // return 123;    报错
}
```
#### never 类型

```typescript
// never表示永远不会返回结果，永远没有值
function fn2(): never {
  throw new Error("报错了！"); // 抛出异常，函数没有返回值
}
```
## 2. 复杂数据类型声明

### 2.1 对象类型

```typescript
// object 表示一个js对象
let obj: object;
obj = {};
obj = function () {};

// {} 用来指定对象中可以包含哪些属性
// 语法：{属性名:属性值,属性名:属性值}，在属性名后面加上?表示属性是可选的
let obj2: { name: string; age?: number };
let b: { name: string; age: number }; // 对象b有name和age两个属性，属性值分别为string和number

// 对象c有name属性，还可以有任意多个属性，属性名为字符串，属性值为任意类型
let c: { name: string; [propName: string]: any };
```
### 2.2 函数类型

```typescript
// 设置函数结构的类型声明
// 语法：(形参:类型,形参:类型...) => 返回值
let d: (a: number, b: number) => number;
d = function (n1: number, n2: number) {
  return n1 + n2;
};
```
### 2.3 数组类型

```typescript
// 数组的类型声明
// 类型[],Array<类型>
let e: string[]; // 表示字符串数组
e = ["a", "b", "c"];

let f: number[]; // 表示数值数组
f = [1, 2, 3];

// Array<类型>
let g: Array<number>; // 表示数值数组
```
### 2.4 元组类型

```typescript
// 元组，元组就是固定长度的数组，固定类型，固定长度
// 语法：[类型,类型,类型]
let h: [string, string];
h = ["hello", "world"];
```
### 2.5 枚举类型

```typescript
// enum 枚举
// 语法：enum 枚举名{枚举值1=枚举值,枚举值2=枚举值...}
enum Gender {
  Male,
  Female,
}

let i: { name: string; gender: 0 | 1 };
i = {
  name: "孙悟空",
  gender: Gender.Male,
};

// console.log(i.gender === Gender.Male);
```
### 2.6 类型组合与别名

```typescript
// & 表示同时
let j: { name: string } & { age: number };
j = { name: "孙悟空", age: 18 };

// 类型的别名
// type myType=string
type myType = 1 | 2 | 3 | 4 | 5;
let k: myType;
k = 1;
// k=6;  //报错，k只能是1-5中的一个
```
## 3. 类的简介

```typescript
// 使用class关键字定义类
class Person {
  // 定义属性
  name: string = "孙悟空"; // 实例属性，需要通过对象的实例去访问
  age: number = 18;
  readonly sex: string = "男"; // 只读属性，无法修改
  static height: number = 1.88; // 静态属性，通过类去访问
  // 定义方法
  sayHello() {
    console.log("hello 大家好");
  }
}

// 创建一个Person类的对象
const person = new Person();
console.log(person);
```
## 4. 构造函数

```typescript
class Dog {
  name: string = "小黑";
  age: number = 3;
  constructor(name: string, age: number) {
    // 在实例方法中，this就表示当前的实例
    // 在构造函数中当前对象就是当前新建的那个对象
    // 可以通过this向新建的对象中添加属性
    this.name = name;
    this.age = age;
  }
  bark() {
    console.log(this.name, "汪汪汪~~~~~");
  }
}

const dog = new Dog('小白', 4);
console.log(dog);
```
## 5. 类的修饰符

### 5.1 public

类中定义的变量能够内部访问也可以外部访问，默认为public

### 5.2 private

代表定义的变量私有的只能在内部访问，不能在外部访问

### 5.3 protected

代表定义的变量私有的只能在内部和继承的子类中访问，不能在外部访问

```typescript
class Person {
  public name: string
  private age: number 
  protected some: any
  constructor (name: string, ages: number, some: any) {
    this.name = name
    this.age = ages
    this.some = some
  }
  run () {

  }
}
 
class Man extends Person {
  constructor () {
    super("张三", 18, 1)
    console.log(this.some)
  }
  create () {
    console.log(this.some)
  }
}
let xiaoman = new Person('卢粲', 18, 1)
let man = new Man()
man.some
```
## 6. static 静态属性与静态方法

用static定义的属性不可以通过this去访问，只能通过类名去调用，static静态函数同样也是不能通过this去调用，也是通过类名去调用。

**注意**：如果两个函数都是static静态的是可以通过this互相调用

## 7. interface 定义类

interface定义类使用关键字implements，后面跟interface的名字多个用逗号隔开，继承还是用extends

```typescript
interface PersonClass {
  get(type: boolean): boolean
}
 
interface PersonClass2 {
  set(): void,
  asd: string
}
 
class A {
  name: string
  constructor() {
    this.name = "123"
  }
}
 
class Person extends A implements PersonClass, PersonClass2 {
  asd: string
  constructor() {
    super()
    this.asd = '123'
  }
  get(type: boolean) {
    return type
  }
  set () {

  }
}
```
## 8. 抽象类

如果类实例化之后毫无用处此时我可以把他定义为抽象类，或者也可以把它作为一个基类->通过继承一个派生类去实现基类的一些方法

```typescript
abstract class A {
  public name: string
  
}
 
new A()
//报错，无法被实例化
```
## 9. 元组

**元组实际就是数组的变种**，**元组（Tuple）是固定数量的不同类型的元素的组合**。

如果需要一个固定大小的不同类型值的集合，我们需要使用元组。元组与集合的不同之处在于，元组中的元素类型可以是不同的，而且数量固定。元组的好处在于可以把多个元素作为一个单元传递。如果一个方法需要返回多个值，可以把这多个值作为元组返回，而不需要创建额外的类来表示。

```typescript
let arr: [number, string] = [1, 'string']
 
 
let arr2: readonly [number, boolean, string, undefined] = [1, true, 'sring', undefined]
```
```typescript
let arr: [number, string] = [1, 'string']
arr[0].length //error
arr[1].length //success
 
//数字是没有length 的
```
元组类型还可以支持自定义名称和变为可选的

```typescript
let a: [x: number, y?: boolean] = [1]
```
**越界元素**：越界元素的类型将被限制为联合类型

```typescript
let arr: [number, string] = [1, 'string']
 
arr.push(true) //error
```
## 10. 枚举类型

通过enum关键字定义我们的枚举

### 10.1 数字枚举

红绿蓝 Red = 0 Green = 1 Blue= 2 分别代表红色0 绿色为1 蓝色为2

```typescript
enum Types {
  Red,
  Green,
  BLue
}
```
这样写就可以实现应为ts定义的枚举中的每一个组员默认都是从0开始的所以也就是

```typescript
enum Types {
  Red = 0,
  Green = 1,
  BLue = 2
}
//默认就是从0开始的 可以不写值
```
**增长枚举**

```typescript
enum Types {
  Red = 1,
  Green,
  BLue
}
```
如上，我们定义了一个数字枚举，Red使用初始化为1。其余的成员会从1开始自动增长。换句话说，Type.Red的值为1，Green为`2`，Blue为3。

### 10.2 字符串枚举

字符串枚举的概念很简单。在一个字符串枚举里，每个成员都必须用字符串字面量，或另外一个字符串枚举成员进行初始化。

```typescript
enum Types {
  Red = 'red',
  Green = 'green',
  BLue = 'blue'
}
```
由于字符串枚举没有自增长的行为，字符串枚举可以很好的序列化。换句话说，如果你正在调试并且必须要读一个数字枚举的运行时的值，这个值通常是很难读的 - 它并不能表达有用的信息，字符串枚举允许你提供一个运行时有意义的并且可读的值，独立于枚举成员的名字。

### 10.3 异构枚举

枚举可以混合字符串和数字成员

```typescript
enum Types {
  No = "No",
  Yes = 1,
}
```
### 10.4 接口枚举

定义一个枚举Types 定义一个接口A 他有一个属性red 值为Types.yyds，声明对象的时候要遵循这个规则

```typescript
enum Types {
  yyds,
  dddd
}
interface A {
  red: Types.yyds
}
 
let obj: A = {
  red: Types.yyds
}
```
### 10.5 const 枚举

let和var都是不允许的声明只能使用const

大多数情况下，枚举是十分有效的方案。然而在某些情况下需求很严格。为了避免在额外生成的代码上的开销和额外的非直接的对枚举成员的访问，我们可以使用const枚举。常量枚举通过在枚举上使用const修饰符来定义

const声明的枚举会被编译成常量，普通声明的枚举编译完后是个对象

```typescript
const enum Types {
  No = "No",
  Yes = 1,
}
```
### 10.6 反向映射

它包含了正向映射（`name` -> `value`）和反向映射（`value` -> `name`）

要注意的是*不会*为字符串枚举成员生成反向映射。

```typescript
enum Enum {
  fall
}
let a = Enum.fall;
console.log(a); //0
let nameOfA = Enum[a]; 
console.log(nameOfA); //fall
```
