# Result.js — Tipo Result Inspirado en Rust

[![result.js](https://img.shields.io/npm/v/@eriveltonsilva/result.js.svg)](https://www.npmjs.com/package/@eriveltonsilva/result.js)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-blue)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0.0-blue)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](https://www.npmjs.com/package/@eriveltonsilva/result.js)
![Size](https://img.shields.io/bundlephobia/minzip/@eriveltonsilva/result.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![Result.js](./src/assets/resultjs-banner.png)

**Disponible en:** [English](./README.md) | [Português](./README.pt.md)

Un tipo Result ligero e inspirado en Rust para Javascript y Typescript. Maneja los casos de éxito y error explícitamente sin excepciones.

## Características

- 🦀 **API inspirada en Rust** - Patrón familiar `Result<T, E>`
- 🎯 **Type-safe** - Soporte completo de Typescript con excelente inferencia de tipos
- 📦 **Cero dependencias** - Ligero y enfocado
- 🔗 **Encadenable** - API fluida con `map`, `andThen` y más
- ⚡ **Tree-shakeable** - Tamaño de bundle optimizado
- 🛡️ **Sin excepciones** - Manejo seguro de errores sin try-catch

## Inicio Rápido

### Instalación

```bash
npm install @eriveltonsilva/result.js
```

### Importación

```typescript
// ES6 - Recomendado
import { Result } from '@eriveltonsilva/result.js'

// ES6 - Importación por defecto
import Result from '@eriveltonsilva/result.js'

// CommonJS
const { Result } = require('@eriveltonsilva/result.js')
```

### Uso Básico

```typescript
// Crear Results
const exito = Result.ok(42)
const error = Result.err(new Error('Algo salió mal'))

// Verificar y extraer
if (exito.isOk()) {
  console.log(exito.unwrap()) // 42
}

// Encadenar operaciones
const duplicado = Result.ok(21)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))
  .unwrap() // 52

// Pattern matching
const resultado = Result.ok(42).match({
  ok: (valor) => valor * 2,
  err: (error) => error.message,
}) // 84

// Manejar errores con seguridad
const resultado = Result.fromTry(
  () => JSON.parse('inválido'),
  (error) => new Error(`JSON inválido: ${error}`),
) // Error: JSON inválido: SyntaxError: Unexpected token, "inválido" is not valid JSON
```

## Documentación

Para guías completas, referencia de API y patrones de uso avanzados, consulta la **[documentación completa](https://eriveltondasilva.github.io/result.js)**.

Aprende más:

- [Inicio Rápido](https://eriveltondasilva.github.io/result.js/guide/getting-started/quick-start)
- [Ejemplos](https://eriveltondasilva.github.io/result.js/examples/patterns)
- [Referencia de API](https://eriveltondasilva.github.io/result.js/reference)

## Changelog

Consulta [CHANGELOG.md](./CHANGELOG.md) para una lista detallada de cambios en cada versión.

## Contribuyendo

¡Las contribuciones son bienvenidas! Por favor, lee nuestra [Guía de Contribución](./CONTRIBUTING.md) para más detalles.

## Licencia

MIT © [Erivelton Silva](https://github.com/eriveltondasilva)

## Inspiración

Inspirado por:

- [Tipo Result de Rust](https://doc.rust-lang.org/std/result)
- [Tipo Result de Gleam](https://hexdocs.pm/gleam_stdlib/gleam/result.html)
- [oxide.ts](https://www.npmjs.com/package/oxide.ts)
- [result.ts](https://www.npmjs.com/package/result.ts)
