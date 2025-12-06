# Result.js — Rust-inspired Result Type

[![npm version](https://img.shields.io/npm/v/@eriveltonsilva/result.js.svg)](https://www.npmjs.com/package/@eriveltonsilva/result.js)
![Node](https://img.shields.io/badge/node-%3E%3D22-blue)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](https://www.npmjs.com/package/@eriveltonsilva/result.js)
![Size](https://img.shields.io/bundlephobia/minzip/@eriveltonsilva/result.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, Rust-inspired Result type for JavaScript and TypeScript. Handle success and error cases explicitly without exceptions.

## Features

- 🦀 **Rust-inspired API** - Familiar `Result<T, E>` pattern
- 🎯 **Type-safe** - Full TypeScript support with excellent inference
- 🪶 **Zero dependencies** - Lightweight and focused
- 🔗 **Chainable** - Fluent API with `map`, `andThen`, and more
- 📦 **Tree-shakeable** - Optimized bundle size

## Quick Start

### Installation

```bash
npm install @eriveltonsilva/result.js
```

### Basic Usage

```typescript
import { Result } from '@eriveltonsilva/result.js'
// import Result from '@eriveltonsilva/result.js'

// Create Results
const success = Result.ok(42)
const failure = Result.err(new Error('Something went wrong'))

// Check and unwrap
if (success.isOk()) {
  console.log(success.unwrap()) // 42
}

// Chain operations
const doubled = Result.ok(21)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))
  .unwrap() // 52

// Handle errors safely
const result = Result.fromTry(() => JSON.parse('{"valid": true}'))
```

## Documentation

For comprehensive guides, API reference, and advanced usage patterns, see the **[complete documentation](./docs)**.

### Quick Links

- [Getting Started Guide](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Examples & Patterns](./docs/examples.md)
- [Architecture & Concepts](./docs/architecture.md)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Erivelton Silva](https://github.com/eriveltondasilva)

## Inspiration

Inspired by [Rust's Result type](https://doc.rust-lang.org/std/result), [oxide.ts](https://www.npmjs.com/package/oxide.ts), and [result.ts](https://www.npmjs.com/package/result.ts).
