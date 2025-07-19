import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/robuild/',
  title: 'robuild',
  description: '⚡️ Zero-config ESM/TS package builder. Powered by oxc, rolldown and rolldown-plugin-dts',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#ff7e17' }],
  ],
  ignoreDeadLinks: true, // 忽略死链接检查
  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'robuild',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '架构', link: '/architecture/' },
      { text: 'GitHub', link: 'https://github.com/Sunny-117/robuild' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: 'CLI 使用', link: '/guide/cli' },
            { text: '配置', link: '/guide/configuration' },
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '构建模式', link: '/guide/build-modes' },
            { text: 'Stub 模式', link: '/guide/stub-mode' },
            { text: 'TypeScript 支持', link: '/guide/typescript' },
            { text: 'ESM 兼容性', link: '/guide/esm' },
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: 'Hooks', link: '/guide/hooks' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: '性能优化', link: '/guide/performance' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/' },
            { text: '配置选项', link: '/api/config' },
            { text: '类型定义', link: '/api/types' },
            { text: 'CLI 参数', link: '/api/cli' },
          ]
        }
      ],
      '/architecture/': [
        {
          text: '架构设计',
          items: [
            { text: '概述', link: '/architecture/' },
            { text: '核心架构', link: '/architecture/core' },
            { text: '构建器', link: '/architecture/builders' },
            { text: '插件系统', link: '/architecture/plugins' },
            { text: '性能分析', link: '/architecture/performance' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Sunny-117/robuild' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present robuild'
    },
    search: {
      provider: 'local'
    }
  },
  markdown: {
    lineNumbers: true,
  }
})
