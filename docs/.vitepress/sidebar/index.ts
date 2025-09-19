// 侧边栏配置索引文件
import { htmlSidebar } from './html';
import { cssSidebar } from './css';
import { javascriptSidebar } from './javascript';
import { browserSidebar } from './browser';
import { vueSidebar } from './vue';
import { typescriptSidebar } from './typescript';

// 组合所有侧边栏配置
export const sidebarConfig = [
  htmlSidebar,
  cssSidebar,
  javascriptSidebar,
  browserSidebar,
  vueSidebar,
  typescriptSidebar
];

// 导出所有单独的侧边栏配置，方便单独使用
export {
  htmlSidebar,
  cssSidebar,
  javascriptSidebar,
  browserSidebar,
  vueSidebar,
  typescriptSidebar
};