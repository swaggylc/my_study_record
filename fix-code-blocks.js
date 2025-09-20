const fs = require('fs');
const path = require('path');

// 要处理的文件列表
const filesToProcess = [
  'd:/project/vitepress_demo/docs/src/Before Study.md',
  'd:/project/vitepress_demo/docs/src/css/为什么要初始化CSS样式.md',
  'd:/project/vitepress_demo/docs/src/html/DOCUTYPE的作用.md',
  'd:/project/vitepress_demo/docs/src/html/html语义化.md',
  'd:/project/vitepress_demo/docs/src/javascript/js原型链.md',
  'd:/project/vitepress_demo/docs/src/javascript/js的继承.md',
  'd:/project/vitepress_demo/docs/src/javascript/new过程中发生了什么.md',
  'd:/project/vitepress_demo/docs/src/javascript/手写call方法.md',
  'd:/project/vitepress_demo/docs/src/javascript/手写节流函数.md',
  'd:/project/vitepress_demo/docs/src/javascript/手写防抖函数.md',
  'd:/project/vitepress_demo/docs/src/javascript/数据类型和运算符.md',
  'd:/project/vitepress_demo/docs/src/javascript/数据类型检测.md',
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
    
    // 使用正则表达式确保代码块声明后只有一行空白行
    // 先移除代码块声明后所有的空白行，然后添加一个空白行
    let newContent = content;
    
    // 第一步：替换掉代码块声明后可能存在的多个空白行，只保留一个
    // 匹配 ```language 后面的所有空白行
    const patternWithExistingNewlines = /```([a-zA-Z0-9]*)\s*/g;
    newContent = newContent.replace(patternWithExistingNewlines, '$&\n');
    
    // 第二步：确保代码块声明后只有一行空白行
    const patternSingleNewline = /```([a-zA-Z0-9]*)\n+/g;
    newContent = newContent.replace(patternSingleNewline, '```$1\n');
    
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