---
layout: home

hero:
  name: Result.js
  text: Explicit Error Handling
  tagline: Type-safe Result<T, E> pattern inspired by Rust, for Javascript & Typescript
  image:
    src: /resultjs-icon.png
    alt: Result.js
  actions:
    - theme: brand
      text: Quick Start
      link: ./guide/getting-started/quick-start.md

    - theme: alt
      text: View on GitHub
      link: https://github.com/eriveltondasilva/result.js

features:
  - icon: 🦀
    title: Rust-Inspired
    details: Familiar Result<T, E> API bringing robustness and clarity to Javascript

  - icon: 🎯
    title: Type-Safe
    details: Full Typescript support with automatic type inference and smart type guards

  - icon: ⚡
    title: Zero Dependencies
    details: Lightweight library with no external dependencies

  - icon: 🔗
    title: Fluent API
    details: Chain operations naturally with `map`, `andThen`, `orElse`, and 40+ methods

  - icon: 🌳
    title: Tree-Shakeable
    details: Optimized for modern bundlers — import only what you need

  - icon: 🛡️
    title: No Exceptions
    details: Eliminate try-catch blocks and handle errors explicitly in types
---

## Quick Install

```bash
npm install @eriveltonsilva/result.js
```

::: warning
Requires node.js 22.0.0+
:::

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

With Result, errors are explicit in your function signatures:

```typescript
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
async function loadUserData(userId: string): AsyncResult<User, ApiError> {
  return (await fetchUser(userId))
    .andThenAsync((user) => validateUser(user))
    .andThenAsync((user) => saveToCache(user))
    .orElseAsync(() => fetchFromBackup(userId))
}

const result = await loadUserData('123')

result.match({
  ok: (user) => console.log('User:', user),
  err: (error) => console.error('Failed:', error)
})
```

## Core Benefits

- **Explicit errors** — No hidden exceptions in types; Typescript enforces handling
- **Type safety** — Compiler prevents accessing values from error states
- **Clean composition** — Chain operations without nesting or try-catch blocks
- **Pattern matching** — Elegant `match()` for handling both success and failure
- **Async support** — Full Promise and async/await integration
- **Universal compatibility** — Works with ESM and CommonJS
