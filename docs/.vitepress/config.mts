import { defineConfig } from "vitepress";

// 从模块化的侧边栏配置文件中导入
import { sidebarConfig } from "./sidebar/index";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/my_study_record/", // 仓库名
  title: "前端学习记录",
  description: "这是一个vitepress的demo工程",
  // 引入icon图标
  head: [["link", { rel: "icon", href: "/img/avt.JPG" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/img/avt.JPG",
    nav: [
      { text: "Home", link: "/" },
      { text: "Study", link: "/study" },
    ],
    // 侧边栏 - 使用模块化配置
    sidebar: sidebarConfig,

    socialLinks: [{ icon: "github", link: "https://github.com/swaggylc" }],

    lastUpdated: {
      text: "Updated at",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2019-present Evan You",
    },
  },
});
