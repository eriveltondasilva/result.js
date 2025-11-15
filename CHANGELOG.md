# Changelog

All notable changes to `@eriveltonsilva/result.js` will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2023-11-20

### Added ➕

- You can now use **`Result.fromTry()`** to safely handle code that might throw exceptions. This returns a **`Result.ok()`** if execution is successful or a **`Result.err()`** if an exception is caught.
- `Result.unwrapOrElse()`
- `Result.isOkAnd()`
- `Result.isErrAnd()`

---

## [1.0.0] - 2025-11-20

First stable version for production use.

---

## Change Categories
- **Added**: For new features
- **Changed**: For changes in existing functionality
- **Deprecated**: For features to be removed in upcoming releases
- **Removed**: For features removed in this release
- **Fixed**: For bug fixes
- **Security**: For vulnerability fixes