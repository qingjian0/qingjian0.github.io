import { defineConfig } from 'vitepress'
export default defineConfig({
  title: '清简·qingjian',
  description: 'AI Agent 工程师 | 国学与 AI 的融合者',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],
  themeConfig: {
    siteTitle: '清简·qingjian',
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: '关于', link: '/about' },
      { text: 'GitHub', link: 'https://github.com/qingjian0' },
    ],
    sidebar: {
      '/blog/': [
        {
          text: '最新文章',
          items: [
            { text: 'AI Agent 入门指南', link: '/blog/first-post' },
          ]
        },
        {
          text: '2020 年旧文',
          collapsed: false,
          items: [
            { text: '我不想就这么算了，我想努力试试看', link: '/blog/old/2020-01-20' },
            { text: '2020.2.16日小记', link: '/blog/old/2020-02-21' },
            { text: '搞机从入门到爆炸 ① 搞机是什么', link: '/blog/old/2020-04-28' },
            { text: '搞机从入门到爆炸 ② 初识刷机', link: '/blog/old/2020-04-29' },
            { text: '起点中文网新霸王条款', link: '/blog/old/2020-05-02' },
            { text: '搞机从入门到爆炸 ③ 刷机包是如何炼成的', link: '/blog/old/2020-05-13a' },
            { text: '那时候没有空调，太阳那么大，为何热不怕', link: '/blog/old/2020-05-13b' },
            { text: '关于 Edxposed 恶意代码事件', link: '/blog/old/2020-05-18' },
            { text: "覆盖7大品牌6亿安卓用户，'互传联盟'", link: '/blog/old/2020-05-22' },
            { text: '端午记', link: '/blog/old/2020-06-25' },
            { text: 'Magisk 模块 MIUI超级优化 v2.2.1', link: '/blog/old/2020-12-09' },
          ]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/qingjian0' }],
    footer: {
      message: '基于 VitePress 构建 | 清简的 AI Agent 技术博客',
      copyright: 'Copyright 2026 qingjian0'
    },
    lastUpdatedText: '最后更新',
    docFooter: { prev: '上一篇', next: '下一篇' }
  }
})
