import { defineConfig } from "vitepress";

const base = process.env.BASE_PATH || "/";

export default defineConfig({
  lang: "zh-CN",
  title: "材料智能论文精读",
  description: "MatterGen 与机器学习原子间势论文的中文精读, 推导和批判性分析.",
  base,
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    math: true,
    image: {
      lazyLoading: true,
    },
  },
  head: [
    ["meta", { name: "robots", content: "noindex, nofollow, noarchive" }],
    ["meta", { name: "theme-color", content: "#fbfaf6" }],
    [
      "script",
      {},
      `;(() => {
        const appearanceKey = "vitepress-theme-appearance";
        if (localStorage.getItem(appearanceKey) === null) {
          localStorage.setItem(appearanceKey, "light");
        }
      })()`,
    ],
  ],
  themeConfig: {
    siteTitle: "材料智能论文精读",
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "没有找到相关内容",
            resetButtonTitle: "清除查询",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "MatterSim", link: "/mattergen/mattersim/" },
      { text: "阅读说明", link: "/guide/reading-method" },
    ],
    sidebar: [
      {
        text: "开始阅读",
        items: [
          { text: "论文地图", link: "/" },
          { text: "如何使用精读站", link: "/guide/reading-method" },
        ],
      },
      {
        text: "MatterSim",
        collapsed: false,
        items: [
          { text: "总览与阅读路线", link: "/mattergen/mattersim/" },
          { text: "1. 问题与核心思想", link: "/mattergen/mattersim/problem" },
          { text: "2. 数据与主动学习", link: "/mattergen/mattersim/data" },
          { text: "3. 模型与数学", link: "/mattergen/mattersim/model" },
          { text: "4. 证据与实验", link: "/mattergen/mattersim/evidence" },
          { text: "5. 迁移与定制", link: "/mattergen/mattersim/adaptation" },
          { text: "6. 局限与审读结论", link: "/mattergen/mattersim/critique" },
          { text: "原文定位索引", link: "/mattergen/mattersim/source-map" },
        ],
      },
      {
        text: "后续专题",
        collapsed: true,
        items: [
          { text: "MatterGen", link: "/mattergen/" },
          { text: "MLIP", link: "/mlip/" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/microsoft/mattersim" },
    ],
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    darkModeSwitchLabel: "外观",
    sidebarMenuLabel: "目录",
    returnToTopLabel: "返回顶部",
  },
});
