import { defineConfig } from 'tsup'

import pkg from './package.json'

const { name, description, version, author, license, homepage } = pkg
const year = new Date().getFullYear()

const isProduction = process.env.NODE_ENV === 'production'

export const banner = `
/**
 * ${name?.toUpperCase()} - v${version}
 *
 * ${description || 'no description'}
 *
 * @author ${author.name} <${author.email}>
 * @license ${license?.toUpperCase()}
 * @copyright ${year} ${author.name}
 * @version ${version}
 *
 * @see ${homepage} - Documentation
 *
 * Inspired by:
 * @see https://doc.rust-lang.org/std/result - Rust Result Type
 * @see https://hexdocs.pm/gleam_stdlib/gleam/result.html - Gleam Result Type
 * @see https://www.npmjs.com/package/oxide.ts - oxide.ts Package
 * @see https://www.npmjs.com/package/result.ts - result.ts Package
 */
`

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    tsconfig: './tsconfig.build.json',
    banner: { js: banner },
    dts: { banner },
    format: 'esm',
    treeshake: true,
    clean: true,
    sourcemap: !isProduction,
    minify: isProduction,
  },
])
