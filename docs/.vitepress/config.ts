// https://vitepress.dev/reference/site-config
// https://vitepress.dev/reference/default-theme-config
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en',
  title: 'Result.js',
  description: 'Explicit, type-safe error handling for JavaScript & TypeScript',
  head: [['link', { rel: 'icon', href: '/result.js/result-js-icon.ico', type: 'image/x-icon' }]],
  base: '/result.js/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/01.what-is-result' },
      { text: 'Reference', link: '/reference' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'What is Result?', link: '/guide/01.what-is-result' },
            { text: 'Installation', link: '/guide/02.installation' },
            { text: 'Quick Start', link: '/guide/03.quick-start' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Error Handling', link: '/guide/04.error-handling' },
            { text: 'Collections', link: '/guide/05.collections' },
            { text: 'Operation Chaining', link: '/guide/06.chaining' },
            { text: 'Pattern Matching', link: '/guide/07.matching' },
            { text: 'Type Safety', link: '/guide/08.type-safety' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Async Operations', link: '/guide/09.async' },
            { text: 'Best Practices', link: '/guide/10.best-practices' },
          ],
        },
        {
          text: 'Changelog',
          link: '/changelog',
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/eriveltondasilva/result.js/edit/main/docs/:path',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/eriveltondasilva/result.js' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@eriveltondasilva/result.js' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright:
        'Copyright © 2026-present <a href="https://github.com/eriveltondasilva">Erivelton Silva</a>',
    },
  },
})
