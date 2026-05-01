# Result.js

[![npm version](https://img.shields.io/npm/v/@eriveltondasilva/result.js)](https://www.npmjs.com/package/@eriveltondasilva/result.js)
[![npm size](https://img.shields.io/npm/unpacked-size/@eriveltondasilva/result.js)](https://www.npmjs.com/package/@eriveltondasilva/result.js)
[![CI](https://github.com/eriveltondasilva/result.js/workflows/CI/badge.svg)](https://github.com/eriveltondasilva/result.js/actions)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?logo=biome)](https://biomejs.dev)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](https://www.npmjs.com/package/@eriveltondasilva/result.js)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![Result.js](./src/assets/resultjs-banner.png)

**Available in:** [Português](./README.pt.md) | [Español](./README.es.md)

A lightweight, Rust-inspired Result type for Javascript and Typescript. Handle success and error cases explicitly without exceptions.

## Features

- 🦀 **Rust-inspired API** - Familiar `Result<T, E>` pattern
- 🎯 **Type-safe** - Full Typescript support with excellent inference
- 📦 **Zero dependencies** - Lightweight and focused
- 🔗 **Chainable** - Fluent API with `map`, `andThen`, and more
- ⚡ **Tree-shakeable** - Optimized bundle size
- 🛡️ **No exceptions** - Safe error handling without try-catch

## Quick Start

### Installation

```bash
npm install @eriveltondasilva/result.js
```

```bash
bun add @eriveltondasilva/result.js
```

### Import

```typescript
// Recommended
import { Result } from '@eriveltondasilva/result.js'

// Default Import
import Result from '@eriveltondasilva/result.js'

// Named Helpers - shortcuts for Result.ok() and Result.err()
import { ok, err } from '@eriveltondasilva/result.js'

// Types
import type { Result, AsyncResult, Ok, Err } from '@eriveltondasilva/result.js'
```

### Basic Usage

```typescript
// Create Results
const success = Result.ok(42)
// => Ok(42)

const failure = Result.err(new Error('Something went wrong'))
// => Err(Error: "Something went wrong")

// Check and unwrap
if (success.isOk()) {
  console.log(success.unwrap())
  // => 42
}

// Chain operations
const doubled = Result.ok(21)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))
  .unwrap()
// => 52

// Pattern matching
const result = Result.ok(42).match({
  ok: (value) => value * 2,
  err: (error) => error.message,
})
// => 84

// Handle errors safely
const result = Result.fromTry(
  () => JSON.parse('invalid'),
  (error) => new Error(`Invalid JSON: ${error}`),
)
// => Err(Error: "Invalid JSON: SyntaxError: Unexpected token, 'invalid' is not valid JSON")

// Async/await usage
const user = await Result.fromPromise(async () => {
  const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  return data.json()
})
// => Ok({userId: 1, id: 1, title: 'delectus aut autem', completed: false})
```

## Documentation

For comprehensive guides, API reference, and advanced usage patterns, see the **[complete documentation](https://eriveltondasilva.github.io/result.js)**.

Learn more:

- [Quick Start](https://eriveltondasilva.github.io/result.js/guide/getting-started/03.quick-start)
- [API Reference](https://eriveltondasilva.github.io/result.js/reference)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each release.

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

## Related Projects

- [eriveltondasilva/option.js](https://github.com/eriveltondasilva/option.js) - A lightweight, Rust-inspired Option type for JavaScript and TypeScript.

```typescript
import { Option } from '@eriveltondasilva/option.js'
import { Result } from '@eriveltondasilva/result.js'

const user = Option.fromNullable(null)
// => None

// Converting an Option to a Result (conceptually)
const userResult = user.match({
  some: (val) => Result.ok(val),
  none: () => Result.err('User not found'),
})
// => Err("User not found")
```
