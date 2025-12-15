import { defineConfig } from 'tsup'
import { banner } from './src/banner'

const entry = ['./src/index.ts']

export default defineConfig([
  {
    entry,
    treeshake: true,
    dts: true,
    cjsInterop: true,
    format: ['esm', 'cjs'],
    banner: {
      js: banner,
    },
  }
])
