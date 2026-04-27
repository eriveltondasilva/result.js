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
      { text: 'Guide', link: '/guide/what-is-result.md' },
      { text: 'Reference', link: '/reference/index.md' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'What is Result?', link: '/guide/what-is-result.md' },
            { text: 'Installation', link: '/guide/installation.md' },
            { text: 'Quick Start', link: '/guide/quick-start.md' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Error Handling', link: '/guide/error-handling.md' },
            { text: 'Operation Chaining', link: '/guide/chaining.md' },
            { text: 'Pattern Matching', link: '/guide/matching.md' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Async Operations', link: '/guide/async.md' },
            { text: 'Type Safety', link: '/guide/type-safety.md' },
            { text: 'Best Practices', link: '/guide/best-practices.md' },
          ],
        },
        {
          text: 'Changelog',
          link: '/changelog.md',
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
