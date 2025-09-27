---
date: 2025-09-27 23:38:14
title: src 和 href 的区别
permalink: /pages/81c2ba
categories:
  - src
  - html
---
# src 和 href 的区别详解

## 一、基本概念

src（Source）和 href（Hypertext Reference）是 HTML 中常用的两个属性，它们都用于引用外部资源，但在功能和行为上存在重要区别。

## 二、src 属性详解

### 1. 定义与作用

src 是 "Source" 的缩写，用于指定外部资源的**来源路径**，该资源将被**嵌入**到文档中当前标签所在的位置。

### 2. 工作原理

当浏览器解析到带有 src 属性的元素时，会**暂停页面的加载**，先下载、解析并执行该资源，然后再继续处理页面的其他内容。这是因为 src 引用的资源是页面必不可少的组成部分，会**替换**当前标签。

### 3. 适用元素

```html
<!-- JavaScript 脚本 -->
<script src="script.js"></script>

<!-- 图片 -->
<img src="image.jpg" alt="示例图片">

<!-- 嵌入框架 -->
<iframe src="page.html"></iframe>

<!-- 视频 -->
<video src="video.mp4"></video>

<!-- 音频 -->
<audio src="audio.mp3"></audio>
```

### 4. 性能影响

由于浏览器会暂停页面加载来处理 src 资源，因此在使用时需要注意：
- 通常将 JavaScript 脚本放在页面底部，避免阻塞页面渲染
- 可以使用 `defer` 或 `async` 属性来优化脚本加载

## 三、href 属性详解

### 1. 定义与作用

href 是 "Hypertext Reference" 的缩写，用于指定**网络资源的位置**，建立当前文档或元素与引用资源之间的**链接关系**。

### 2. 工作原理

当浏览器遇到 href 属性时，会**并行下载**该资源，但**不会停止**对当前文档的处理。这是因为 href 引用的资源不会嵌入到当前文档中，而是作为一个外部引用存在。

### 3. 适用元素

```html
<!-- 样式表链接 -->
<link rel="stylesheet" href="styles.css">

<!-- 页面链接 -->
<a href="https://example.com">访问示例网站</a>

<!-- 基础 URL 设置 -->
<base href="https://example.com">

<!-- 锚点链接 -->
<a href="#section1">跳转到第一节</a>
```

### 4. 性能优势

由于 href 不会阻塞页面渲染，因此：
- 建议使用 `<link>` 标签加载 CSS，而不是 `@import`
- 可以利用浏览器的并行下载能力提高页面加载速度

## 四、src 与 href 的核心区别

| 特性 | src | href |
|------|-----|------|
| 核心作用 | 嵌入外部资源，替换当前元素 | 建立与外部资源的链接关系 |
| 页面加载 | 阻塞页面加载，需等待资源处理完成 | 不阻塞页面加载，并行下载 |
| 资源处理 | 会下载、解析并执行资源内容 | 不会执行资源内容，仅建立关联 |
| 使用场景 | 脚本、图片、视频、iframe 等 | 样式表、页面链接、锚点等 |
| 性能影响 | 可能导致页面加载延迟 | 可优化页面加载性能 |

## 五、实用建议

### 1. 关于 src 的使用

- **JavaScript 脚本**：
  - 对于关键脚本，可放在头部使用 `defer` 属性
  - 对于非关键脚本，建议放在 `</body>` 标签前
  - 考虑使用 `async` 属性异步加载独立脚本

```html
<!-- 异步加载不阻塞渲染 -->
<script src="analytics.js" async></script>

<!-- 延迟加载，在DOM解析完成后执行 -->
<script src="app.js" defer></script>
```

- **图片资源**：
  - 考虑使用懒加载技术优化性能
  - 为大图片提供适当的占位符

### 2. 关于 href 的使用

- **CSS 样式**：
  - 优先使用 `<link>` 标签而非 `@import`
  - 对于关键 CSS，可考虑内联到 HTML 中

```html
<!-- 推荐的CSS加载方式 -->
<link rel="stylesheet" href="critical.css">

<!-- 非关键CSS可异步加载 -->
<link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'">
```

- **页面链接**：
  - 使用语义化的文本作为链接内容
  - 为外部链接添加 `target="_blank" rel="noopener noreferrer"` 以提高安全性

## 六、总结

简单来说：
- **src** 代表资源是页面**必备的、必不可少的**，会被嵌入到页面中，并且会阻塞页面加载
- **href** 代表资源是一个**链接引用**，不会嵌入到页面中，也不会阻塞页面加载

正确理解和使用这两个属性，对于优化网页性能和用户体验至关重要。