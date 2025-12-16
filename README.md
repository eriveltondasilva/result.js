# Result.js — Rust-inspired Result Type

[![result.js](https://img.shields.io/npm/v/@eriveltonsilva/result.js.svg)](https://www.npmjs.com/package/@eriveltonsilva/result.js)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-blue)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0.0-blue)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](https://www.npmjs.com/package/@eriveltonsilva/result.js)
![Size](https://img.shields.io/bundlephobia/minzip/@eriveltonsilva/result.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![Result.js](./src/assets/resultjs-banner.png)

**Available in:** [Português](./README.pt.md) | [Español](./README.es.md)

A lightweight, Rust-inspired Result type for Javascript and Typescript. Handle success and error cases explicitly without exceptions.

## Features

- 🦀 **Rust-inspired API** - Familiar `Result<T, E>` pattern
- 🎯 **Type-safe** - Full Typescript support with excellent inference
- 📦 **Zero dependencies** - Lightweight and focused
- 🔗 **Chainable** - Fluent API with `map`, `andThen`, and more
- ⚡ **Tree-shakeable** - Optimized bundle size
- 🛡 **No exceptions** - Safe error handling without try-catch

## Quick Start

### Installation

```bash
npm install @eriveltonsilva/result.js
```

### Import

```typescript
// ES6 - Recommended
import { Result } from '@eriveltonsilva/result.js'

// ES6 - Default Import
import Result from '@eriveltonsilva/result.js'

// CommonJS
const { Result } = require('@eriveltonsilva/result.js')

```

### Basic Usage

```typescript
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

// Pattern matching
const result = Result.ok(42)
  .match({
    ok: (value) => value * 2,
    err: (error) => error.message,
  }) // 84

// Handle errors safely
const result = Result.fromTry(
  () => JSON.parse('invalid'),
  (error) => new Error(`Invalid JSON: ${error}`)
) // Error: Invalid JSON: SyntaxError: Unexpected token, "invalid" is not valid JSON
```

## Documentation

For comprehensive guides, API reference, and advanced usage patterns, see the **[complete documentation](https://eriveltondasilva.github.io/result.js)**.

Learn more:

- [Quick Start](https://eriveltondasilva.github.io/result.js/guide/getting-started/quick-start)
- [Examples](https://eriveltondasilva.github.io/result.js/examples/patterns)
- [API Reference](https://eriveltondasilva.github.io/result.js/api-reference)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Erivelton Silva](https://github.com/eriveltondasilva)

## Inspiration

Inspired by:

- [Rust's Result type](https://doc.rust-lang.org/std/result)
- [Gleam Result Type](https://hexdocs.pm/gleam_stdlib/gleam/result.html)
- [oxide.ts](https://www.npmjs.com/package/oxide.ts)
- [result.ts](https://www.npmjs.com/package/result.ts)
