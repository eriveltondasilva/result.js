# Project Overview

This project is a TypeScript library that provides a lightweight, Rust-inspired `Result` type for handling success and error cases in a functional and type-safe way. It's designed to be a zero-dependency, tree-shakeable, and fluent API for error handling without exceptions.

The main technologies used are TypeScript and Node.js. The project is built with `tsup`, tested with `vitest`, and linted/formatted with `biome`. Documentation is generated with `vitepress`.

The core of the library is the `Result` type, which can be either an `Ok` value (representing success) or an `Err` value (representing failure). The library provides a set of factory functions and methods for creating and working with `Result` objects, such as `map`, `andThen`, `fromTry`, and `fromPromise`.

# Building and Running

## Building the project

To build the project, run the following command:

```bash
npm run build
```

This will compile the TypeScript code and generate the distribution files in the `dist` directory.

## Running tests

To run the tests, use the following command:

```bash
npm test
```

This will execute the test suite using `vitest`.

## Running in development mode

To run the project in development mode with hot-reloading, use:

```bash
npm run dev
```

# Development Conventions

## Coding Style

The project uses `biome` for formatting and linting. Before committing any code, make sure to run the following commands to format and check for any issues:

```bash
npm run fmt
npm run lint
npm run check
```

## Testing

The project uses `vitest` for testing. All new features and bug fixes should be accompanied by tests. The tests are located in files ending with `.test.ts`.

## Contribution Guidelines

Contributions are welcome. Please read the `CONTRIBUTING.md` file for more details on how to contribute to the project.
