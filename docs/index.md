---
layout: home

hero:
  name: Result.js
  text: Explicit Error Handling
  tagline: Type-safe Result<T, E> pattern inspired by Rust, for JavaScript & TypeScript
  image:
    src: /resultjs-icon.png
    alt: Result.js
  actions:
    - theme: brand
      text: Get Started
      link: ./guide/getting-started/what-is-result.md
    - theme: alt
      text: View on GitHub
      link: https://github.com/eriveltondasilva/result.js

features:
  - icon: 🦀
    title: Rust-Inspired
    details: Familiar Result<T, E> API bringing robustness and clarity to JavaScript

  - icon: 🎯
    title: Type-Safe
    details: Full TypeScript support with automatic type inference and smart type guards

  - icon: ⚡
    title: Zero Dependencies
    details: Lightweight library (~3KB minified) with no external dependencies

  - icon: 🔗
    title: Fluent API
    details: Chain operations naturally with map, andThen, orElse, and 40+ methods

  - icon: 🌳
    title: Tree-Shakeable
    details: Optimized for modern bundlers—import only what you need

  - icon: 🛡️
    title: No Exceptions
    details: Eliminate try-catch blocks and handle errors explicitly in types
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

// Chain operations
const result = Result.ok(10)
  .map((x) => x * 2)
  .andThen((x) => x > 15 ? Result.ok(x) : Result.err('too small'))
  .unwrapOr(0)

console.log(result) // 20
```

## Why Result.js?

### ✓ Errors in Types

```typescript
// With Result: errors are explicit
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Result.err('Division by zero')
  return Result.ok(a / b)
}

const result = divide(10, 0)

result.match({
  ok: (val) => console.log(val),
  err: (msg) => console.error(msg)
})
```

### ✓ Clean Composition

Chain operations without nested try-catch blocks:

```typescript
const user = await Result.ok(userId)
  .mapAsync((id) => fetchUser(id))
  .then((r) => r.andThenAsync(validateUser))
```

## Key Advantages

- **Explicit errors** — No hidden exceptions in types
- **Type safety** — TypeScript enforces error handling
- **Clean composition** — Chain operations without nesting
- **Pattern matching** — Elegant `match()` for both cases
- **Async support** — Full Promise/async-await integration
- **ESM + CommonJS** — Works everywhere
