import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '清简 · qingjian',
  description: 'AI Agent Engineer | 国学与AI的融合者',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#42b883' }],
  ],

  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: '清简 · qingjian',

    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: '关于', link: '/about' },
      { text: 'GitHub', link: 'https://github.com/qingjian0' },
    ],

    sidebar: {
      '/blog/': [
        {
          text: '文章分类',
          items: [
            { text: 'AI Agent', link: '/blog/ai-agent' },
            { text: 'Prompt Engineering', link: '/blog/prompt-engineering' },
            { text: '国学与AI', link: '/blog/guoxue-ai' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/qingjian0' }
    ],

    footer: {
      message: '基于 VitePress 构建 | 清简的 AI Agent 技术博客',
      copyright: 'Copyright 2026 qingjian0'
    },

    editLink: {
      pattern: 'https://github.com/qingjian0/qingjian0.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdatedText: '最后更新',
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    }
  }
})
