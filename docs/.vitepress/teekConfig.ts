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
      name: `Theme By swaggylc_0417@${version}`,
    },
    copyright: {
      createYear: 2025,
      suffix: "swaggylc_0417",
    },
  },
  //   代码块
  codeBlock: {
    copiedDone: (TkMessage) => TkMessage.success("复制成功！"),
  },
  //   文章分享
  articleShare: { enabled: true },
  //   插件配置
  vitePlugins: {
    sidebarOption: {
      initItems: false,
    },
  },
});
