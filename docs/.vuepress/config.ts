import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from '@vuepress/bundler-vite'
import {navbar} from "./navbar";
import {series} from "./series";

export default defineUserConfig({
  title: "Daily Notes",
  description: "Just playing around",
  bundler: viteBundler(),
  theme: recoTheme({
    logo: "/logo.png",
    author: "iniconico",
    authorAvatar: "/head.png",
    docsRepo: "https://github.com/iniconico233/daily-notes",
    docsBranch: "main",
    docsDir: "/docs",
    lastUpdatedText: "",
    // series 为原 sidebar
    series: series,
    navbar: navbar,
    // autoSetSeries: true,
    // commentConfig: {
    //   type: 'valine',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
  // debug: true,
  base: "/daily-notes/",
  plugins: [],
});