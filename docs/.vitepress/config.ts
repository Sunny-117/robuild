import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

export default defineConfig({
  base: '/robuild/',
  title: 'robuild',
  description: '⚡️ Zero-config ESM/TS package builder. Powered by oxc, rolldown and rolldown-plugin-dts',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#ff7e17' }],
  ],
  ignoreDeadLinks: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'robuild',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API 参考', link: '/reference/cli' },
      { text: 'GitHub', link: 'https://github.com/Sunny-117/robuild' },
    ],
    sidebar: {
      '/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速上手', link: '/guide/getting-started' },
            { text: '构建模式', link: '/guide/build-modes' },
          ],
        },
        {
          text: '选项',
          items: [
            { text: '入口', link: '/options/entry' },
            { text: '配置文件', link: '/options/config-file' },
            { text: '声明文件 (dts)', link: '/options/dts' },
            { text: '输出格式', link: '/options/output-format' },
            { text: '输出目录', link: '/options/output-directory' },
            { text: '清理', link: '/options/cleaning' },
            { text: '依赖处理', link: '/options/dependencies' },
            { text: '监听模式', link: '/options/watch-mode' },
            { text: '目标版本', link: '/options/target' },
            { text: '目标平台', link: '/options/platform' },
            { text: 'Tree Shaking', link: '/options/tree-shaking' },
            { text: '源码映射', link: '/options/sourcemap' },
            { text: '代码压缩', link: '/options/minification' },
            { text: '日志级别', link: '/options/log-level' },
            { text: '兼容性垫片', link: '/options/shims' },
            { text: '包导出生成', link: '/options/package-exports' },
          ],
        },
        {
          text: '高级',
          items: [
            { text: '插件', link: '/advanced/plugins' },
            { text: 'Hooks 钩子', link: '/advanced/hooks' },
            { text: 'Rolldown 选项', link: '/advanced/rolldown-options' },
            { text: '程序化使用', link: '/advanced/programmatic-usage' },
            { text: 'Stub 模式', link: '/advanced/stub-mode' },
          ],
        },
        {
          text: '实践指南',
          items: [
            { text: 'WASM 支持', link: '/recipes/wasm-support' },
          ],
        },
        {
          text: 'API 参考',
          items: [
            { text: '命令行接口', link: '/reference/cli' },
            { text: '配置选项', link: '/reference/config' },
            { text: '类型定义', link: '/reference/types' },
          ],
        },
      ],
    },
    outline: {
      label: '页面导航',
      level: 'deep',
    },
    lastUpdated: {
      text: '最后更新于',
    },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Sunny-117/robuild' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present robuild',
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
  },
  markdown: {
    lineNumbers: true,
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin(),
    ],
  },
})
