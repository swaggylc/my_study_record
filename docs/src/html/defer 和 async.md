---
date: 2025-09-27 23:43:48
title: defer 和 async
permalink: /pages/5677f4
categories:
  - src
  - html
---


# defer 和 async 属性详解

## 一、为什么需要 defer 和 async

在了解 `defer` 和 `async` 属性之前，我们首先需要理解浏览器加载和渲染页面的基本过程，以及为什么需要这两个属性。

### 1. 页面的基本加载和渲染流程

```
1. 浏览器发送请求，获取HTML文档
2. 开始从上到下解析HTML并构建DOM树
3. 构建DOM过程中，若遇到外部资源（样式表、脚本文件等）：
   - 暂停文档解析
   - 开始下载这些外部资源
   - 资源下载完成后，解析并执行（对于脚本文件）或构建CSSOM（对于样式文件）
   - 然后继续解析文档构建DOM
4. 文档解析完成后，将DOM和CSSOM进行关联和映射，形成渲染树
5. 根据渲染树计算布局信息（Layout）
6. 最后将视图渲染到浏览器窗口（Paint）
```

### 2. 传统脚本加载的问题

在传统的脚本加载方式中（不使用 `defer` 或 `async`），脚本文件的下载和执行是与文档解析同步的，这会导致：

- **阻塞文档解析**：当浏览器遇到 `<script>` 标签时，会暂停HTML解析，先下载并执行脚本
- **影响用户体验**：如果脚本文件较大或网络较慢，会导致页面加载缓慢，出现卡顿现象
- **DOM结构不完整**：脚本执行时可能无法访问到后续才会解析的DOM元素

为了解决这些问题，HTML标准引入了 `defer` 和 `async` 这两个属性。

## 二、defer 和 async 的基本概念

### 1. defer 属性

`defer` 属性用于开启新的线程下载脚本文件，并使脚本在文档解析完成后执行。

```html
<script src="script.js" defer></script>
```

### 2. async 属性

`async` 是 HTML5 新增的属性，用于异步下载脚本文件，下载完毕后立即执行代码。

```html
<script src="script.js" async></script>
```

## 三、defer 和 async 的共同点

1. **异步加载外部脚本**：两者都不会阻塞页面的解析过程
2. **仅适用于外部脚本**：这两个属性只对带有 `src` 属性的外部脚本文件有效
3. **不影响脚本下载**：无论是否使用这两个属性，脚本文件都会被下载

## 四、defer 和 async 的区别

### 1. 执行时机的区别

- **async**：脚本文件一旦下载完成，会立即执行，不考虑文档是否已经解析完成
- **defer**：脚本文件的执行会延迟到文档所有元素解析完成之后，但在 `DOMContentLoaded` 事件触发之前

### 2. 执行顺序的区别

- **async**：无法保证脚本的执行顺序，哪个脚本先下载完成就先执行哪个
- **defer**：可以保证脚本按照在HTML文档中出现的顺序执行

### 3. 适用场景的区别

- **async**：适用于那些不依赖于页面DOM结构、不依赖于其他脚本的独立脚本，如广告统计、分析代码等
- **defer**：适用于那些依赖于页面DOM结构或需要按特定顺序执行的脚本，如页面交互逻辑、依赖库等

### 4. 与 DOMContentLoaded 事件的关系

- **async**：脚本的执行可能在 `DOMContentLoaded` 事件之前或之后，取决于脚本的下载速度
- **defer**：脚本的执行一定在 `DOMContentLoaded` 事件之前

## 五、执行流程可视化对比

下面是不同脚本加载方式的执行流程对比：

| 加载方式 | 下载阶段 | 执行阶段 | 执行顺序 | 适用场景 |
|---------|---------|---------|---------|---------|
| 传统脚本 | 阻塞HTML解析 | 阻塞HTML解析 | 按文档顺序 | 简单页面、关键脚本 |
| async脚本 | 不阻塞HTML解析 | 阻塞HTML解析 | 不保证顺序 | 独立的第三方脚本 |
| defer脚本 | 不阻塞HTML解析 | 不阻塞HTML解析 | 按文档顺序 | 依赖DOM或其他脚本的脚本 |

### 加载和执行时序图

```
正常加载: 解析HTML → 发现脚本 → 下载脚本 → 执行脚本 → 继续解析HTML

async加载: 解析HTML → 发现脚本 → 异步下载脚本 → 下载完成 → 暂停解析 → 执行脚本 → 继续解析HTML
                                                             ↓
                                                       继续解析HTML

defer加载: 解析HTML → 发现脚本 → 异步下载脚本 → 继续解析HTML → 解析完成 → 执行脚本
```

## 六、代码示例

### 1. 基本用法示例

```html
<!-- 传统脚本加载方式 -->
<script src="normal.js"></script>

<!-- 使用 async 属性 -->
<script src="async.js" async></script>

<!-- 使用 defer 属性 -->
<script src="defer.js" defer></script>
```

### 2. 执行顺序示例

下面的示例展示了多个脚本文件在使用不同属性时的执行顺序：

```html
<!-- 示例1：传统脚本会按照文档顺序执行 -->
<script src="script1.js"></script>
<script src="script2.js"></script>
<script src="script3.js"></script>
<!-- 执行顺序：script1.js → script2.js → script3.js -->

<!-- 示例2：async脚本的执行顺序不确定 -->
<script src="script1.js" async></script>
<script src="script2.js" async></script>
<script src="script3.js" async></script>
<!-- 执行顺序：取决于哪个脚本先下载完成 -->

<!-- 示例3：defer脚本会按照文档顺序执行 -->
<script src="script1.js" defer></script>
<script src="script2.js" defer></script>
<script src="script3.js" defer></script>
<!-- 执行顺序：script1.js → script2.js → script3.js -->
```

### 3. DOMContentLoaded 事件示例

```javascript
// 监听 DOMContentLoaded 事件
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM结构已完全加载和解析');
});

// 使用 defer 的脚本中可以安全地操作完整的DOM
// defer-script.js
console.log('defer脚本执行，DOM结构:', document.readyState);
// 输出: defer脚本执行，DOM结构: interactive 或 complete

// 使用 async 的脚本中可能只能操作部分DOM
// async-script.js
console.log('async脚本执行，DOM结构:', document.readyState);
// 输出可能是: loading, interactive 或 complete
```

## 七、最佳实践建议

1. **根据需求选择合适的属性**：
   - 对于不依赖其他脚本且不依赖DOM的独立脚本，使用 `async`
   - 对于依赖DOM结构或需要按顺序执行的脚本，使用 `defer`

2. **内联脚本不受影响**：`defer` 和 `async` 属性只对外部脚本有效，对内联脚本没有影响

3. **避免混合使用**：尽量避免在同一个页面中混合使用不同加载方式的脚本，以免引起执行顺序的混乱

4. **将脚本放在底部**：即使使用了 `defer` 或 `async`，仍然建议将脚本放在HTML文档的底部（`</body>` 标签之前），以获得最佳的加载性能

5. **考虑使用现代模块系统**：对于复杂的JavaScript应用，考虑使用ES6模块系统（通过 `type="module"` 属性），它默认具有类似 `defer` 的行为

## 八、总结

`defer` 和 `async` 是用于优化JavaScript脚本加载性能的两个重要属性，它们都可以实现脚本的异步加载，避免阻塞HTML文档的解析。

- **async**：异步加载，下载完成后立即执行，不保证执行顺序，适用于独立的第三方脚本
- **defer**：异步加载，延迟到文档解析完成后按顺序执行，适用于依赖DOM或需要按顺序执行的脚本

在实际开发中，我们应该根据脚本的特性和需求，合理选择使用 `defer` 或 `async` 属性，以优化页面的加载性能和用户体验。