---
layout: home

hero:
  name: Result.js
  text: Result Type for JavaScript
  tagline: Explicit, type-safe error handling inspired by Rust
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/eriveltondasilva/result.js

features:
  - icon: 🦀
    title: Rust-Inspired
    details: Familiar API based on Rust's Result<T, E>, bringing robustness and reliability to JavaScript

  - icon: 🎯
    title: Type-Safe
    details: Full TypeScript support with automatic type inference and smart type guards

  - icon: 📦
    title: Zero Dependencies
    details: Lightweight and focused library with no external dependencies. Only ~3KB minified

  - icon: 🔗
    title: Fluent API
    details: Chain operations with map, andThen, orElse and 40+ available methods

  - icon: ⚡
    title: Tree-Shakeable
    details: Optimized for modern bundlers. Import only what you need

  - icon: 🛡️
    title: No Exceptions
    details: Eliminate try-catch. Handle errors explicitly in return types
---

## Quick Install

```bash
npm install @eriveltonsilva/result.js
```

## Basic Example

```typescript
import { Result } from '@eriveltonsilva/result.js'

// Create Results
const success = Result.ok(42)
const failure = Result.err(new Error('Something went wrong'))

// Check and extract values
if (success.isOk()) {
  console.log(success.unwrap()) // 42
}

// Chain operations
const result = Result.ok(10)
  .map((x) => x * 2)
  .andThen((x) => x > 15 ? Result.ok(x) : Result.err('too small'))
  .unwrapOr(0)

console.log(result) // 20
```

## Why Result.js?

### Before (with exceptions)

```typescript
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

try {
  const result = divide(10, 0)
  console.log(result)
} catch (error) {
  console.error(error)
}
```

### After (with Result)

```typescript
function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('Division by zero')
  return Result.ok(a / b)
}

const result = divide(10, 0)
if (result.isErr()) {
  console.error(result.unwrapErr()) // TypeScript knows it's string
}
```

## Key Features

- **Errors in return type** - No runtime surprises
- **Pattern matching** - Elegant decisions with `match()`
- **Async operations** - Full Promise support
- **Functional composition** - Combine operations easily
- **ESM and CommonJS compatible** - Use anywhere

## Next Steps

<div class="vp-doc">

- **[Getting Started Guide](/guide/)** - Learn the fundamentals
- **[API Reference](/api/)** - Explore all methods
- **[Examples](/examples/)** - See real-world patterns

</div>
