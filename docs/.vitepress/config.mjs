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
    socialLinks: [{ icon: 'github', link: 'https://github.com/qingjian0' }],
    footer: {
      message: '基于 VitePress 构建 | 清简的 AI Agent 技术博客',
      copyright: 'Copyright 2026 qingjian0'
    },
    lastUpdatedText: '最后更新',
    docFooter: { prev: '上一篇', next: '下一篇' }
  }
})
