import Teek from "vitepress-theme-teek";

// Teek 在线主题包引用（需安装 Teek 在线版本）
import "vitepress-theme-teek/index.css";
import "vitepress-theme-teek/theme-chalk/tk-code-block-mobile.css"; // 移动端代码块样式优化
import "vitepress-theme-teek/theme-chalk/tk-sidebar.css"; // 侧边栏优化
import "vitepress-theme-teek/theme-chalk/tk-nav.css"; // 导航栏优化
import "vitepress-theme-teek/theme-chalk/tk-aside.css"; // 右侧目栏录文字悬停和激活样式
import "vitepress-theme-teek/theme-chalk/tk-doc-h1-gradient.css"; // 一级标题渐变色
import "vitepress-theme-teek/theme-chalk/tk-table.css"; // 表格样式调整，去掉单元格之间的线条
import "vitepress-theme-teek/theme-chalk/tk-mark.css"; // <mark></mark> 样式
import "vitepress-theme-teek/theme-chalk/tk-blockquote.css"; // > 引用块样式
import "vitepress-theme-teek/theme-chalk/tk-index-rainbow.css"; // 首页图片彩虹动画
import "vitepress-theme-teek/theme-chalk/tk-banner-desc-gradient.css"; // 博客风格 Banner 描述渐变样式
import "vitepress-theme-teek/theme-chalk/tk-home-card-hover.css"; // 首页卡片悬停效果
import "vitepress-theme-teek/theme-chalk/tk-fade-up-animation.css"; // 首次加载的动画效果

import "virtual:group-icons.css";

import "./styles/index.scss";
import "./styles/code.scss";
import "./styles/blur.scss";
import "./styles/sidebarIcon.scss";
import DataPanel from "./components/DataPanel.vue";

import busuanzi from "busuanzi.pure.js";
import { inBrowser } from "vitepress";

import { h, provide } from "vue";
import { TkArticleUpdate, teekConfigContext } from "vitepress-theme-teek";
import "vitepress-theme-teek/theme-chalk/tk-article-update.css";
import DefaultTheme from "vitepress/theme";

provide(teekConfigContext, {
  articleUpdate: {
    limit: 3, // 默认为 3，表示最多显示 3 条最近更新文章
  },
});

export default {
  extends: Teek,
  enhanceApp({ app, router }) {
    if (inBrowser) {
      router.onAfterRouteChanged = () => {
        busuanzi.fetch();
      };
    }
    // 注册全局组件
    app.component("DataPanel", DataPanel);
  },
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "doc-after": () => h(TkArticleUpdate),
    }),
};
