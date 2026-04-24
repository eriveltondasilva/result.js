# Result.js

[![npm version](https://img.shields.io/npm/v/@eriveltondasilva/result.js)](https://www.npmjs.com/package/@eriveltondasilva/result.js)
[![npm size](https://img.shields.io/npm/unpacked-size/@eriveltondasilva/result.js)](https://www.npmjs.com/package/@eriveltondasilva/result.js)
[![CI](https://github.com/eriveltondasilva/result.js/workflows/CI/badge.svg)](https://github.com/eriveltondasilva/result.js/actions)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?logo=biome)](https://biomejs.dev)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](https://www.npmjs.com/package/@eriveltondasilva/result.js)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

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
npm install @eriveltondasilva/result.js
```

```bash
bun add @eriveltondasilva/result.js
```

### Importación

```typescript
// ES6 - Recomendado
import { Result } from '@eriveltondasilva/result.js'

// ES6 - Importación por defecto
import Result from '@eriveltondasilva/result.js'
```

### Uso Básico

```typescript
// Crear Results
const exito = Result.ok(42)
// => Ok(42)
const error = Result.err(new Error('Algo salió mal'))
// => Err(Error: 'Algo salió mal')

// Verificar y extraer
if (exito.isOk()) {
  console.log(exito.unwrap())
  // => 42
}

// Encadenar operaciones
const duplicado = Result.ok(21)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))
  .unwrap()
// => 52

// Pattern matching
const resultado = Result.ok(42).match({
  ok: (valor) => valor * 2,
  err: (error) => error.message,
})
// => 84

// Manejar errores con seguridad
const resultado = Result.fromTry(
  () => JSON.parse('inválido'),
  (error) => new Error(`JSON inválido: ${error}`),
)
// => Err(Error: "JSON inválido: SyntaxError: Unexpected token, 'inválido' is not valid JSON")

// Async/await usage
const user = await Result.fromPromise(async () => {
  const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  return data.json()
})
// => Ok({userId: 1, id: 1, title: 'delectus aut autem', completed: false})

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

## Proyectos Relacionados

- [eriveltondasilva/option.js](https://github.com/eriveltondasilva/option.js) - Un tipo Option ligero y inspirado en Rust para Javascript y Typescript.

```typescript
import { Option } from '@eriveltondasilva/option.js'
import { Result } from '@eriveltondasilva/result.js'

const user = Option.fromNullable(null)
// => None

// Conversión de Option a Result con pattern matching
const userResult = user.match({
  some: (val) => Result.ok(val),
  none: () => Result.err('Usuario no encontrado'),
})
// => Err('Usuario no encontrado')
```
