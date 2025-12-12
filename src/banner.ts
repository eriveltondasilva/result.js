import pkg from '../package.json' with { type: 'json' }

const { name, description, version, author, license, homepage } = pkg
const year = new Date().getFullYear()

export const banner = `/**
 * ${name.toUpperCase()} - v${version}
 *
 * ${description}
 *
 * @author ${author.name} <${author.email}>
 * @license ${license.toUpperCase()}
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
