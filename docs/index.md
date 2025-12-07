# Result.js Documentation

Welcome to the complete documentation for Result.js - a Rust-inspired Result type for JavaScript and TypeScript.

## Table of Contents

### Getting Started

- **[Getting Started](./getting-started.md)** - Installation, setup, and your first Result
- **[Core Concepts](./architecture.md)** - Understanding the Result pattern and architecture

### Reference

- **[API Reference](./api-reference.md)** - Complete API documentation with all methods
- **[Type Reference](./type-reference.md)** - TypeScript types and utilities

### Guides

- **[Examples & Patterns](./examples.md)** - Real-world usage patterns and best practices
- **[Migration Guide](./migration-guide.md)** - Migrating from exceptions to Results

### Development

- **[Contributing](../CONTRIBUTING.md)** - How to contribute to Result.js
- **[Changelog](../CHANGELOG.md)** - Version history and updates

## What is Result.js?

Result.js brings Rust's powerful `Result<T, E>` pattern to JavaScript and TypeScript. It provides a type-safe way to handle operations that can succeed or fail without throwing exceptions.

### Why Use Result.js?

**Explicit Error Handling**

```typescript
// Instead of try-catch
try {
  const data = JSON.parse(input)
  processData(data)
} catch (error) {
  handleError(error)
}

// Use Result
const result = Result.fromTry(() => JSON.parse(input))
if (result.isOk()) {
  processData(result.unwrap())
} else {
  handleError(result.unwrapErr())
}
```

**Type-Safe Chaining**

```typescript
const user = Result.ok(userData)
  .map(validateEmail)
  .andThen(checkPermissions)
  .andThen(saveToDatabase)
```

**Better Composability**

```typescript
const results = Result.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id)
])
```

## Quick Navigation

### By Use Case

- **Error handling** → [Getting Started](./getting-started.md#error-handling)
- **Async operations** → [Examples: Async Patterns](./examples.md#async-patterns)
- **Validation** → [Examples: Validation](./examples.md#validation-patterns)
- **Collections** → [API: Collections](./api-reference.md#collections)

### By Experience Level

- **New to Result pattern?** Start with [Getting Started](./getting-started.md)
- **Coming from Rust?** Check [Architecture](./architecture.md#comparison-with-rust)
- **Migrating existing code?** See [Migration Guide](./migration-guide.md)

## Community & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/eriveltondasilva/result.js/issues)
- **npm**: [Package on npm](https://www.npmjs.com/package/@eriveltonsilva/result.js)

## License

Result.js is [MIT licensed](../LICENSE.md).
