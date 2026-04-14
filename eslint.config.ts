import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import { importX } from 'eslint-plugin-import-x'
import prettier from 'eslint-config-prettier/flat'

export default defineConfig([
  eslint.configs.recommended,

  {
    files: ['**/*.{ts,mts,cts}'],
    extends: [tseslint.configs.strict, tseslint.configs.stylistic],

    languageOptions: {
      parserOptions: {
        projectService: true,
        // @ts-ignore: ignora erro de typescript
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.bunBuiltin },
    },

    rules: {
      // Permite variáveis que comecem com `_`
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-parameter': 'off',
    },
  },

  {
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
        node: true,
      },
    },
    rules: {
      'import-x/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index'], 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'import-x/no-duplicates': 'warn',
      'import-x/no-unresolved': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'warn',
      'import-x/no-mutable-exports': 'error',

      'import-x/first': 'error',
      'import-x/newline-after-import': 'warn',

      'import-x/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/*.test.ts', '**/*.spec.ts', 'vitest.config.*'] },
      ],

      // Disabled: high performance cost — run manually if needed
      // 'import-x/no-cycle': 'warn',
    },
  },

  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'import-x/no-unresolved': ['off', { devDependencies: true }],
      'import-x/no-unused-modules': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  { ignores: ['node_modules', 'dist/**', 'docs/**', 'tests/**'] },

  prettier,
])
