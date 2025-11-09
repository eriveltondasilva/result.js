import { defineConfig } from 'tsup'
import { banner } from './src/banner'

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    treeshake: true,
    format: 'esm',
    dts: {
      only: true,
      banner: banner,
    },
  },
  {
    entry: ['./src/index.ts'],
    treeshake: true,
    format: ['esm', 'cjs'],
    outExtension: ({ format }) => ({
      js: format === 'esm' ? '.mjs' : '.cjs',
    }),
    banner: {
      js: banner,
    },
  },
])
