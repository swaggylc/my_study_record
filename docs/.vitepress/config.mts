import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import { teekConfig } from "./teekConfig";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  base: "/my_study_record/", // 仓库名
  title: "WEB_RECORD",
  description: "这是一个vitepress的demo工程",
  // 引入icon图标
  head: [["link", { rel: "icon", href: "/img/avt.JPG" }]],
  // markdown 配置
  markdown: {
    // 开启行号
    lineNumbers: true,
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true,
    },
    // 更改容器默认值标题
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/img/avt.JPG",
    nav: [
      { text: "Home", link: "/" },
      { text: "Study", link: "/study" },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/swaggylc" },
      { icon: "wechat", link: "..." },
      { icon: "qq", link: "..." },
      { icon: "tiktok", link: "..." },
      { icon: "fanfou", link: "..." },
      { icon: "x", link: "..." },
    ],

    lastUpdated: {
      text: "上次更新于",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },
  },
  vite: {
    plugins: [llmstxt() as any],
  },
});
