const fs = require('fs');
const path = require('path');

// 要处理的文件列表
const filesToProcess = [
  'd:/project/vitepress_demo/docs/src/css/为什么要初始化CSS样式.md',
  'd:/project/vitepress_demo/docs/src/html/DOCUTYPE的作用.md',
  'd:/project/vitepress_demo/docs/src/html/html语义化.md',
  'd:/project/vitepress_demo/docs/src/javascript/js原型链.md',
  'd:/project/vitepress_demo/docs/src/javascript/js的继承.md',
  'd:/project/vitepress_demo/docs/src/javascript/new过程中发生了什么.md',
  'd:/project/vitepress_demo/docs/src/javascript/手写节流函数.md',
  'd:/project/vitepress_demo/docs/src/javascript/手写防抖函数.md',
  'd:/project/vitepress_demo/docs/src/javascript/数据类型和运算符.md',
  'd:/project/vitepress_demo/docs/src/typescript/TS学习.md',
  'd:/project/vitepress_demo/docs/src/vue/vue2响应式原理.md',
  'd:/project/vitepress_demo/docs/src/vue/vue3响应式原理.md',
  'd:/project/vitepress_demo/docs/src/vue/vue3相关.md',
  'd:/project/vitepress_demo/docs/src/浏览器和网络/浏览器概述.md'
];

// 处理文件函数
function processFile(filePath) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 使用正则表达式在代码块声明后添加空白行
    // 匹配 ```javascript, ```ts, ```html, ```css 等代码块声明
    const pattern = /```([a-zA-Z0-9]*)/g;
    const newContent = content.replace(pattern, '$&\n');
    
    // 如果内容有变化，则写入文件
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`已处理: ${path.basename(filePath)}`);
    } else {
      console.log(`无需修改: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`处理文件出错 ${filePath}:`, error.message);
  }
}

// 遍历并处理所有文件
console.log('开始处理Markdown文件中的代码块格式...');
filesToProcess.forEach(processFile);
console.log('所有文件处理完成！');