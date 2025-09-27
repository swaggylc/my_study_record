---
date: 2025-09-27 23:37:19
title: HTML5特性
permalink: /pages/b74115
categories:
  - src
  - html
---
# HTML5 特性详解

## 一、HTML5 新增特性

### 1. 新增选择器
提供了更便捷的DOM元素选择方法：
```javascript
// 选择第一个匹配的元素
document.querySelector('.class-name');
// 选择所有匹配的元素
document.querySelectorAll('div.example');
```

### 2. 媒体播放标签
引入原生的音视频播放支持，不再依赖Flash插件：
```html
<!-- 视频播放 -->
<video src="video.mp4" controls></video>

<!-- 音频播放 -->
<audio src="audio.mp3" controls></audio>
```

### 3. 本地存储
提供了在客户端存储数据的能力：
```javascript
// 本地存储（永久保存，除非手动删除）
localStorage.setItem('username', '张三');
const username = localStorage.getItem('username');

// 会话存储（仅在当前会话有效）
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');
```

### 4. 浏览器通知
允许网站向用户显示通知：
```javascript
// 请求通知权限
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // 创建并显示通知
    new Notification('新消息', {
      body: '您有一条新的消息',
      icon: 'notification-icon.png'
    });
  }
});
```

### 5. 语义化标签
引入了更具语义的HTML标签，提高代码可读性和SEO友好度：
```html
<header>页头区域</header>
<nav>导航菜单</nav>
<main>主要内容</main>
<section>内容区块</section>
<article>文章内容</article>
<aside>侧边栏</aside>
<footer>页脚区域</footer>
```

### 6. 地理位置
允许网站获取用户地理位置信息（需用户授权）：
```javascript
// 获取用户地理位置
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords;
  console.log(`纬度：${latitude}，经度：${longitude}`);
}, error => {
  console.error('获取地理位置失败：', error);
});
```

### 7. 离线应用
通过manifest文件支持离线访问：
```html
<!-- 在HTML头部添加manifest -->
<link rel="manifest" href="manifest.json">
```

### 8. WebSocket通信
提供全双工通信协议，实现服务器与客户端的实时通信：
```javascript
// 创建WebSocket连接
const socket = new WebSocket('ws://example.com/socket');

// 监听连接打开
socket.addEventListener('open', event => {
  socket.send('Hello Server!');
});

// 监听消息接收
socket.addEventListener('message', event => {
  console.log('收到消息：', event.data);
});
```

### 9. 浏览器历史管理
提供操作浏览器历史记录的API：
```javascript
// 添加新的历史记录条目
history.pushState({ page: 1 }, 'Page 1', '/page1');

// 监听历史记录变化
history.addEventListener('popstate', event => {
  console.log('历史记录变化：', event.state);
});
```

### 10. Web Workers
允许JavaScript在后台线程中运行，不阻塞主线程：
```javascript
// 创建Worker
const worker = new Worker('worker.js');

// 向Worker发送消息
worker.postMessage({ data: '需要处理的数据' });

// 接收Worker返回的消息
worker.addEventListener('message', event => {
  console.log('Worker返回结果：', event.data);
});
```

### 11. 拖拽API
提供元素拖拽功能：
```html
<!-- 设置元素可拖拽 -->
<div draggable="true" ondragstart="handleDragStart(event)">可拖拽元素</div>

<!-- 设置放置区域 -->
<div ondragover="handleDragOver(event)" ondrop="handleDrop(event)">放置区域</div>
```

### 12. 增强表单控件
提供更多类型的表单输入控件：
```html
<input type="url" placeholder="网址">
<input type="date" placeholder="日期">
<input type="time" placeholder="时间">
<input type="email" placeholder="邮箱">
<input type="search" placeholder="搜索">
<input type="number" placeholder="数字">
```

### 13. 页面可见性API
检测页面是否对用户可见：
```javascript
// 监听页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('页面变为不可见');
  } else {
    console.log('页面变为可见');
  }
});
```

### 14. 跨窗口通信
实现不同窗口或iframe之间的通信：
```javascript
// 发送消息
otherWindow.postMessage('Hello from this window!', 'https://example.com');

// 接收消息
window.addEventListener('message', event => {
  if (event.origin === 'https://example.com') {
    console.log('收到消息：', event.data);
  }
});
```

### 15. FormData对象
简化表单数据的处理和AJAX提交：
```javascript
// 创建FormData对象
const formData = new FormData();
formData.append('username', '张三');
formData.append('avatar', fileInput.files[0]);

// 发送AJAX请求
fetch('/api/submit', {
  method: 'POST',
  body: formData
});
```

### 16. Canvas和SVG
提供图形绘制能力：
```html
<!-- Canvas绘制 -->
<canvas id="myCanvas" width="200" height="100"></canvas>
<script>
  const ctx = document.getElementById('myCanvas').getContext('2d');
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, 150, 75);
</script>

<!-- SVG绘制 -->
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

## 二、HTML5 移除的特性

### 1. 纯表现的元素
以下元素仅用于表现，已被CSS取代：
- `<basefont>`：设置页面基准字体
- `<big>`：大号文本
- `<center>`：居中对齐
- `<font>`：字体设置
- `<s>`：删除线
- `<strike>`：删除线
- `<tt>`：打字机文本
- `<u>`：下划线

### 2. 对可用性产生负面影响的元素
以下元素影响页面可用性和可访问性：
- `<frame>`：框架
- `<frameset>`：框架集
- `<noframes>`：不支持框架时的替代内容