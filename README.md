# 1. Result.js — Rust-inspired Result Type <!-- omit in toc -->

[![npm version](https://img.shields.io/npm/v/@eriveltonsilva/result.js.svg)](https://www.npmjs.com/package/@eriveltonsilva/result.js)
![Typescript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Size](https://img.shields.io/bundlephobia/minzip/@eriveltonsilva/result.js)
[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)
[![Linted with Biome](https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
![Tests](https://img.shields.io/badge/tests-passing-success)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, Rust-inspired Result type for JavaScript and TypeScript — handle success and error cases without exceptions.

## 📖 Table of Contents <!-- omit in toc -->

- [1. ✨ Features](#1--features)
- [2. 📦 Installation](#2--installation)
- [3. 🚀 Quick Start](#3--quick-start)
- [4. 📚 Documentation](#4--documentation)
- [5. 🤝 Contributing](#5--contributing)
- [6. 📝 License](#6--license)
- [7. 🙏 Inspiration](#7--inspiration)

## 1. ✨ Features

- 🦀 **Rust-inspired API** - Familiar if you know Rust's `Result<T, E>`
- 🎯 **Type-safe** - Full TypeScript support with excellent inference
- 🪶 **Zero dependencies** - Lightweight and focused
- 🔗 **Chainable** - Fluent API with `map`, `andThen`, and more
- 🧪 **Well-tested** - Comprehensive test coverage
- 📦 **Tree-shakeable** - Optimized bundle size

## 2. 📦 Installation
```bash
npm install @eriveltonsilva/result.js
```

## 3. 🚀 Quick Start
```typescript
import { Result } from '@eriveltonsilva/result.js'

// Create Results
const success = Result.ok(42)
const failure = Result.err(new Error('Something went wrong'))

// Check state
if (result.isOk()) {
  console.log(result.unwrap()) // => 42
}

if (result.isErr()) {
  console.log(result.unwrapErr().message) // => 'Something went wrong'
}

// Chain operations
const doubled = Result.ok(21)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))

// Pattern matching
const message = result.match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error.message}`
})

// Handle promises
const result = await Result.fromPromise(
  fetch('/api/data'),
  (err) => new NetworkError(err)
)
```

## 4. 📚 Documentation

For detailed documentation and examples, see the [docs](./docs/guide.md) directory.

## 5. 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 6. 📝 License

MIT © [Erivelton Silva](https://github.com/eriveltondasilva) - Please read [LICENSE.md](./LICENSE.md)

## 7. 🙏 Inspiration

Inspired by:
- [Rust's Result type - documentation](https://doc.rust-lang.org/std/result)
- [oxide.ts package](https://www.npmjs.com/package/oxide.ts)
- [result.ts package](https://www.npmjs.com/package/result.ts)