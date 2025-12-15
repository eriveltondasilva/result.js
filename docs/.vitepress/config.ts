// https://vitepress.dev/reference/site-config
// https://vitepress.dev/reference/default-theme-config
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en',
  title: 'Result.js',
  description: 'Explicit, type-safe error handling for JavaScript & TypeScript',
  head: [['link', { rel: 'icon', href: '/resultjs-icon.png' }]],
  base: '/repo/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/what-is-result.md' },
      { text: 'Examples', link: '/examples/patterns.md' },
      { text: 'Reference', link: '/api-reference.md' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'What is Result?', link: '/guide/getting-started/what-is-result.md' },
            { text: 'Installation', link: '/guide/getting-started/installation.md' },
            { text: 'Quick Start', link: '/guide/getting-started/quick-start.md' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Type Safety', link: '/guide/core-concepts/type-safety.md' },
            { text: 'Error Handling', link: '/guide/core-concepts/error-handling.md' },
            { text: 'Operation Chaining', link: '/guide/core-concepts/chaining.md' },
            { text: 'Pattern Matching', link: '/guide/core-concepts/matching.md' },
            { text: 'Async Operations', link: '/guide/core-concepts/async.md' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Best Practices', link: '/guide/advanced/best-practices.md' },
            { text: 'Migration Guide', link: '/guide/advanced/migration.md' },
            { text: 'Troubleshooting', link: '/guide/advanced/troubleshooting.md' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Patterns', link: '/examples/patterns.md' },
            { text: 'Express.js', link: '/examples/express.md' },
            { text: 'React.js', link: '/examples/react.md' },
            { text: 'Database', link: '/examples/database.md' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/eriveltondasilva/result.js/edit/main/docs/:path',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/eriveltondasilva/result.js' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@eriveltonsilva/result.js' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present <a href="https://github.com/eriveltondasilva">Erivelton Silva</a>',
    },
  },
})