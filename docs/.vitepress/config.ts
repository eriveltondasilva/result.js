// https://vitepress.dev/reference/site-config
// https://vitepress.dev/reference/default-theme-config

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Result.js',
  description: 'Result type for JavaScript & TypeScript',

  themeConfig: {
    // logo: '',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Reference', link: '/reference/types' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'Migration Guide', link: '/guide/migration' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Creation', link: '/api/creation' },
            { text: 'Validation', link: '/api/validation' },
            { text: 'Transformation', link: '/api/transformation' },
            { text: 'Chaining', link: '/api/chaining' },
            { text: 'Async Operations', link: '/api/async' },
            { text: 'Collections', link: '/api/collections' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Form Validation', link: '/examples/validation' },
            { text: 'API Calls', link: '/examples/api-calls' },
            { text: 'Database', link: '/examples/database' },
            { text: 'Error Handling', link: '/examples/error-handling' },
          ],
        },
      ],

      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'TypeScript Types', link: '/reference/types' },
            { text: 'Comparison', link: '/reference/comparison' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/eriveltondasilva/result.js' }],
  },
})
