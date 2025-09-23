---
date: 2025-09-23 23:19:38
title: v-if和v-for的优先级
permalink: /pages/8eca1c
categories:
  - src
  - vue
---
# v-if和v-for的优先级

## 一、作用

**v-if 指令**用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 `true` 值的时候被渲染。

**v-for 指令**基于一个数组来渲染一个列表。v-for 指令需要使用 `item in items` 形式的特殊语法，其中 `items` 是源数据数组或者对象，而 `item` 则是被迭代的数组元素的别名。

在使用 v-for 的时候，建议设置 `key` 值，并且保证每个 key 值是独一无二的，这便于 diff 算法进行优化。

### 用法示例

```vue
<Modal v-if="isShow" />

<li v-for="item in items" :key="item.id">
    {{ item.label }}
</li>
```

## 二、优先级

v-if 与 v-for 都是 Vue 模板系统中的指令。在 Vue 模板编译的时候，会将指令系统转化成可执行的 render 函数。

### 示例分析

#### 示例一：同一元素上使用 v-if 与 v-for

编写一个 p 标签，同时使用 v-if 与 v-for：

```vue
<div id="app">
    <p v-if="isShow" v-for="item in items">
        {{ item.title }}
    </p>
</div>
```

创建 Vue 实例，存放 isShow 与 items 数据：

```javascript
const app = new Vue({
  el: "#app",
  data() {
    return {
      items: [
        { title: "foo" },
        { title: "baz" }]
    }
  },
  computed: {
    isShow() {
      return this.items && this.items.length > 0
    }
  }
})
```

模板指令的代码都会生成在 render 函数中，通过 `app.$options.render` 就能得到渲染函数：

```javascript
ƒ anonymous() {
  with (this) { return 
    _c('div', { attrs: { "id": "app" } }, 
    _l((items), function (item) 
    { return (isShow) ? _c('p', [_v("\n" + _s(item.title) + "\n")]) : _e() }), 0) }
}
```

`_l` 是 Vue 的列表渲染函数，函数内部都会进行一次 if 判断。初步得到结论：**v-for 优先级是比 v-if 高**。

#### 示例二：不同标签上使用 v-for 与 v-if

再将 v-for 与 v-if 置于不同标签：

```vue
<div id="app">
    <template v-if="isShow">
        <p v-for="item in items">{{item.title}}</p>
    </template>
</div>
```

再输出下 render 函数：

```javascript
ƒ anonymous() {
  with(this){return 
    _c('div',{attrs:{"id":"app"}},
    [(isShow)?[_v("\n"),
    _l((items),function(item){return _c('p',[_v(_s(item.title))])})]:_e()],2)}
}
```

这时候我们可以看到，v-for 与 v-if 作用在不同标签时候，是先进行判断，再进行列表的渲染。

### 源码验证

我们再查看下 Vue 源码：

**源码位置**：`\vue-dev\src\compiler\codegen\index.js`

```javascript
export function genElement (el: ASTElement, state: CodegenState): string {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre
  }
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    ...
}
```

在进行 if 判断的时候，v-for 是比 v-if 先进行判断。

**最终结论**：v-for 优先级比 v-if 高。

## 三、注意事项

1. **永远不要把 v-if 和 v-for 同时用在同一个元素上**，这会带来性能方面的浪费（每次渲染都会先循环再进行条件判断）。

2. **如果需要避免这种情况**，可以在外层嵌套 template（页面渲染不生成 dom 节点），在这一层进行 v-if 判断，然后在内部进行 v-for 循环：
   
   ```vue
   <template v-if="isShow">
       <p v-for="item in items"></p>
   </template>
   ```

3. **如果条件出现在循环内部**，可通过计算属性 computed 提前过滤掉那些不需要显示的项：
   
   ```javascript
   computed: {
       items: function() {
         return this.list.filter(function (item) {
           return item.isShow
         })
       }
   }
   ```