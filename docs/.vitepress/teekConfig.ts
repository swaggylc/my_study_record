import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";

export const teekConfig = defineTeekConfig({
  // 是否启用 Teek 的首页风格（博客风格），如果为 false，则还原到 VitePress 的默认首页
  teekHome: false,
  // 是否启用 VitePress 首页风格，支持 teekHome 和 vpHome 同时存在
  vpHome: true,
  // 是否启用侧边栏展开/折叠触发器，点击触发器可以展开/折叠侧边栏。
  sidebarTrigger: true,
  //   作者信息
  author: { name: "swaggylc_0417", link: "https://github.com/swaggylc" },
  banner: {
    enabled: false, // 是否启用 Banner
  },
  //   页脚信息
  footerInfo: {
    theme: {
      name: `Design By swaggylc_0417@${version}`,
    },
    copyright: {
      createYear: 2025,
      suffix: "swaggylc_0417",
    },
  },
  //   代码块
  codeBlock: {
    enabled: false, // 是否启用新版代码块
    copiedDone: (TkMessage) => TkMessage.success("复制成功！"),
  },
  //   文章分享
  articleShare: { enabled: true },
  pageStyle: "default",
  appreciation: {
    position: "doc-after", // 赞赏位置
    // 赞赏配置
    options: {
      icon: "weChatPay", // 赞赏图标，内置 weChatPay 和 alipay
      expandTitle: "打赏支持", // 展开标题，支持 HTML
      collapseTitle: "下次一定", // 折叠标题，支持 HTML
      content: `<img src='/img/wechatPay.png'>`, // 赞赏内容，支持 HTML（路径已更新以匹配 config.mts 中的 base 配置）
      expand: false, // 是否默认展开，默认 false
    },
  },
  comment: {
    provider: "giscus", // 评论区提供者
    // 评论区配置项，根据 provider 不同而不同，具体看对应官网的使用介绍
    options: {
      // twikoo 配置，官网：https://twikoo.js.org/
      // envId: "your envId",

      // waline 配置，官网：https://waline.js.org/
      // serverURL: "your serverURL",
      // jsLink: "https://unpkg.com/@waline/client@v3/dist/waline.js",
      // cssLink: "https://unpkg.com/@waline/client@v3/dist/waline.css",

      // giscus 配置，官网：https://giscus.app/zh-CN
      repo: "swaggylc/my_study_record",
      repoId: "R_kgDOPy6Bcw",
      category: "General",
      categoryId: "DIC_kwDOPy6Bc84CvyBX",

      // artalk 配置，官网：https://artalk.js.org/
      // server: "your server",
      // site: "site",
    },
  },
  vitePlugins: {
    sidebarOption: {
      initItems: false,
      collapsed: false,
      restart: true,
    },
    permalink: true, // 使用默认的 permalink(永久链接) 插件
    autoFrontmatter: true, // 自动添加 frontmatter 元数据
  },
});
