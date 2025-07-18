// @ts-check
const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Encode Bundle',
  tagline: '前端库构建工具，基于 esbuild 实现',
  favicon: 'img/avatar.png',

  url: 'https://sunny-117.github.io',
  baseUrl: '/robuild/',

  organizationName: 'sunny-117',
  projectName: 'robuild',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        logo: {
          alt: 'encode avatar',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '完整功能',
          },
          {
            href: 'https://github.com/Sunny-117/robuild',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档说明',
            items: [
              {
                label: '完整功能',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: '我的网站',
                href: 'http://sunny-117.github.io/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/Sunny-117/robuild',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} encode studio, Inc. Built with Sunny-117.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
}

module.exports = config
