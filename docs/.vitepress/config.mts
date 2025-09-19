import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/my_study_record/", // 仓库名
  title: "前端学习记录",
  description: "这是一个vitepress的demo工程",
  // 引入icon图标
  head: [["link", { rel: "icon", href: "/public/img/avt.JPG" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/public/img/avt.JPG",
    nav: [
      { text: "Home", link: "/" },
      { text: "Study", link: "/study" },
    ],
    // 侧边栏
    sidebar: [
      {
        text: "HTML",
        collapsed: false,
        items: [
          {
            text: "DOCUTYPE的作用",
            link: "/src/html/DOCUTYPE的作用",
          },
          {
            text: "html语义化标签",
            link: "/src/html/html语义化",
          },
        ],
      },
      {
        text: "CSS",
        collapsed: false,
        items: [
          {
            text: "为什么要初始化CSS样式",
            link: "/src/css/为什么要初始化CSS样式",
          },
        ],
      },
      {
        text: "JavaScript",
        collapsed: false,
        items: [
          {
            text: "数据类型和运算符",
            link: "/src/javascript/数据类型和运算符",
          },
        ],
      },
      {
        text: "浏览器和网络",
        collapsed: false,
        items: [
          {
            text: "浏览器概述",
            link: "/src/浏览器和网络/浏览器概述",
          },
        ],
      },
      {
        text: "VUE",
        collapsed: false,
        items: [
          {
            text: "VUE3相关",
            link: "/src/vue/vue3相关",
          },
        ],
      },
      {
        text: "TypeScript",
        collapsed: false,
        link: "/src/typescript/TS学习",
        // items: [
        //   {
        //     text: "TypeScript",
        //     link: "/src/typescript/TS学习",
        //   },
        // ],
      },
    ],

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
