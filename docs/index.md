---
layout: home

hero:
  name: Result.js
  text: Explicit Error Handling
  tagline: Type-safe Result<T, E> pattern inspired by Rust, for Javascript & Typescript
  image:
    src: /result-js-icon.png
    alt: Result.js
  actions:
    - theme: brand
      text: Quick Start
      link: ./guide/03.quick-start

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
npm install @eriveltondasilva/result.js
```

::: warning
Requires node.js 20.0.0+
:::

## Basic Example

```typescript
import { Result } from '@eriveltondasilva/result.js'
// import Result from '@eriveltondasilva/result.js'

// Create Results
const success = Result.ok(42)
const failure = Result.err(new Error('Something went wrong'))

// Chain operations
const result = Result.ok(10)
  .map((x) => x * 2)
  .andThen((x) => x > 15 ? Result.ok(x) : Result.err('too small'))
  .unwrapOr(0)

console.log(result)
// => 20
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
// => "Division by zero"
```