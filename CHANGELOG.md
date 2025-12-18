# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-12-15

### Added

- **Validation methods:**
  - `Result.validate()` - Create Result by validating value with predicate
  - `Result.fromNullable()` - Create Result from nullable values
  - `Result.isResult()` - Type guard for Result instances
  - `isOkAnd()` / `isErrAnd()` - Validate Result with predicates
  
- **Collection methods:**
  - `Result.allSettled()` - Collect all Results without failing
  - `Result.any()` - Return first Ok or all errors
  - `Result.partition()` - Separate successes and failures
  - `Result.values()` / `Result.errors()` - Extract values or errors

- **Transformation methods:**
  - `filter()` - Filter Ok values by predicate
  - `zip()` - Combine two Results into tuple

- **Async methods:**
  - `mapAsync()`, `mapErrAsync()`, `mapOrAsync()`, `mapOrElseAsync()`
  - `andThenAsync()`, `andAsync()`, `orAsync()`, `orElseAsync()`

- **Other methods:**
  - `contains()` / `containsErr()` - Check for specific values/errors
  - `inspectErr()` - Side effects on errors
  - `toJSON()` - JSON conversion

- VitePress documentation with comprehensive JSDoc comments

### Changed

- **BREAKING:** Complete rewrite with `Ok` and `Err` classes
- **BREAKING:** `Result.sequence()` → `Result.all()`
- **BREAKING:** `Result.is()` → `Result.isResult()`
- **BREAKING:** Errors now throw with `cause` property
- Module exports use `.js` extension (was `.mjs`)
- Homepage now points to documentation site
- `types` script renamed to `typecheck`

### Removed

- **BREAKING:** `Result.sequenceAsync()` (use async methods instead)
- **BREAKING:** `inspectOk()` (use `match()` or `inspect()` instead)

[1.2.0]: https://github.com/eriveltondasilva/result.js/compare/v1.1.0...v1.2.0

## [1.1.0] - 2025-11-20

### Added

- `Result.sequence()` - Combines multiple Results into single Result with array of values
- `Result.sequenceAsync()` - Async version of sequence for Promise-based Results
- `Result.fromPromise()` - Converts Promises to Results, catching rejections
- `Result.fromTry()` - Wraps functions that may throw into Results

### Changed

- `unwrap()` now throws the original error directly instead of wrapping it
- `expect()` now includes the original error as `cause` for better error tracing

[1.1.0]: https://github.com/eriveltondasilva/result.js/compare/v1.0.7...v1.1.0

## [1.0.0] - 2025-11-20

First stable version for production use.
