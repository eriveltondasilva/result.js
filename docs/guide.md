# Result.js - Documentação Completa <!-- omit in toc -->

Documentação completa da biblioteca Result.js para tratamento de erros type-safe em JavaScript e TypeScript.

## 📖 Table of Contents <!-- omit in toc -->

- [1. Introdução](#1-introdução)
  - [1.1. Por que usar Result?](#11-por-que-usar-result)
- [2. Instalação](#2-instalação)
- [3. Conceitos Básicos](#3-conceitos-básicos)
- [4. API Reference](#4-api-reference)
  - [4.1. Static Methods](#41-static-methods)
    - [4.1.1. `Result.ok<T, E>(value: T): Result<T, E>`](#411-resultokt-evalue-t-resultt-e)
    - [4.1.2. `Result.err<T, E>(error: E): Result<T, E>`](#412-resulterrt-eerror-e-resultt-e)
    - [4.1.3. `Result.is<T, E>(value: unknown): value is Result<T, E>`](#413-resultist-evalue-unknown-value-is-resultt-e)
    - [4.1.4. `Result.sequence<T>(results: T[]): Result<...>`](#414-resultsequencetresults-t-result)
    - [4.1.5. `Result.sequenceAsync<T, E>(promises: Promise<Result<T, E>>[]): Promise<Result<T[], E>>`](#415-resultsequenceasynct-epromises-promiseresultt-e-promiseresultt-e)
    - [4.1.6. `Result.fromPromise<T, E>(promise: Promise<T>, mapError?: (error: unknown) => E): Promise<Result<T, E>>`](#416-resultfrompromiset-epromise-promiset-maperror-error-unknown--e-promiseresultt-e)
    - [4.1.7. `Result.fromTry<T, E>(fn: () => T, mapError?: (error: unknown) => E): Result<T, E>`](#417-resultfromtryt-efn---t-maperror-error-unknown--e-resultt-e)
    - [4.1.8. `isErr(): boolean`](#418-iserr-boolean)
  - [4.2. Access](#42-access)
    - [4.2.1. `get ok: T | null`](#421-get-ok-t--null)
    - [4.2.2. `get err: E | null`](#422-get-err-e--null)
    - [4.2.3. `unwrap(): T`](#423-unwrap-t)
    - [4.2.4. `unwrapErr(): E`](#424-unwraperr-e)
    - [4.2.5. `unwrapOr(defaultValue: T): T`](#425-unwrapordefaultvalue-t-t)
    - [4.2.6. `unwrapOrElse(fn: () => T): T`](#426-unwraporelsefn---t-t)
    - [4.2.7. `expect(message: string): T`](#427-expectmessage-string-t)
    - [4.2.8. `expectErr(message: string): E`](#428-expecterrmessage-string-e)
  - [4.3. Transformation](#43-transformation)
    - [4.3.1. `map<U>(fn: (value: T) => U): Result<U, E>`](#431-mapufn-value-t--u-resultu-e)
    - [4.3.2. `mapOr<U>(defaultValue: U, fn: (value: T) => U): U`](#432-maporudefaultvalue-u-fn-value-t--u-u)
    - [4.3.3. `mapErr<F>(fn: (error: E) => F): Result<T, F>`](#433-maperrffn-error-e--f-resultt-f)
    - [4.3.4. `andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>`](#434-andthenufn-value-t--resultu-e-resultu-e)
    - [4.3.5. `flatten<U>(): Result<U, E>`](#435-flattenu-resultu-e)
  - [4.4. Combination](#44-combination)
    - [4.4.1. `and<U>(other: Result<U, E>): Result<U, E>`](#441-anduother-resultu-e-resultu-e)
    - [4.4.2. `or(other: Result<T, E>): Result<T, E>`](#442-orother-resultt-e-resultt-e)
    - [4.4.3. `orElse(fn: (error: E) => Result<T, E>): Result<T, E>`](#443-orelsefn-error-e--resultt-e-resultt-e)
  - [4.5. Conversion](#45-conversion)
    - [4.5.1. `toPromise(): Promise<T>`](#451-topromise-promiset)
  - [4.6. Inspection](#46-inspection)
    - [4.6.1. `match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R`](#461-matchrhandlers--ok-value-t--r-err-error-e--r--r)
    - [4.6.2. `inspect(handlers: { ok: (value: T) => void; err: (error: E) => void }): Result<T, E>`](#462-inspecthandlers--ok-value-t--void-err-error-e--void--resultt-e)
    - [4.6.3. `inspectOk(fn: (value: T) => void): Result<T, E>`](#463-inspectokfn-value-t--void-resultt-e)
    - [4.6.4. `inspectErr(fn: (error: E) => void): Result<T, E>`](#464-inspecterrfn-error-e--void-resultt-e)
- [5. Padrões de Uso](#5-padrões-de-uso)
  - [5.1. Validação em Cadeia](#51-validação-em-cadeia)
  - [5.2. Fallback em Cascata](#52-fallback-em-cascata)
  - [5.3. Propagação de Erros](#53-propagação-de-erros)
  - [5.4. Múltiplas Operações](#54-múltiplas-operações)
- [6. Comparação com Exceptions](#6-comparação-com-exceptions)
  - [6.1. Com Exceptions (problemático)](#61-com-exceptions-problemático)
  - [6.2. Com Result (explícito)](#62-com-result-explícito)
- [7. TypeScript](#7-typescript)
  - [7.1. Inferência de Tipos](#71-inferência-de-tipos)
  - [7.2. Union Types](#72-union-types)
  - [7.3. Narrowing com Type Guards](#73-narrowing-com-type-guards)
  - [7.4. Tipos Genéricos](#74-tipos-genéricos)
- [8. Erros Customizados](#8-erros-customizados)
- [9. Boas Práticas](#9-boas-práticas)
  - [9.1. ✅ Faça](#91--faça)
  - [9.2. ❌ Evite](#92--evite)
  - [9.3. Exemplo Completo](#93-exemplo-completo)
- [10. Migração Gradual](#10-migração-gradual)
- [11. Performance](#11-performance)
- [12. Recursos Adicionais](#12-recursos-adicionais)

---

## 1. Introdução

Result.js é uma biblioteca inspirada no tipo `Result<T, E>` do Rust, projetada para fornecer tratamento de erros explícito e type-safe sem o uso de exceptions.

### 1.1. Por que usar Result?

**Problemas com exceptions:**
- Fluxo de controle implícito
- Difícil rastrear quais funções podem lançar erros
- Fácil esquecer de tratar erros
- Performance overhead

**Benefícios do Result:**
- Erros explícitos na assinatura da função
- Compilador força o tratamento de erros
- Composição funcional com operadores
- Type-safe e auto-documentado

---

## 2. Instalação

```bash
npm install @eriveltonsilva/result.js
```

```typescript
import { Result } from '@eriveltonsilva/result.js'
```

---

## 3. Conceitos Básicos

Um `Result<T, E>` representa:
- **Ok(T)**: operação bem-sucedida contendo valor do tipo `T`
- **Err(E)**: operação falhou contendo erro do tipo `E`

```typescript
// Função que pode falhar
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Result.err('Division by zero')
  }

  return Result.ok(a / b)
}

// Uso
const result = divide(10, 2)

if (result.isOk()) {
  console.log('Result:', result.unwrap()) // 5
} else {
  console.error('Error:', result.unwrapErr())
}
```

---

## 4. API Reference

### 4.1. Static Methods

#### 4.1.1. `Result.ok<T, E>(value: T): Result<T, E>`

Cria um Result bem-sucedido contendo um valor.

```typescript
const success = Result.ok(42)
// Result<number, never>

const data = Result.ok({ name: 'John', age: 30 })
// Result<{ name: string, age: number }, never>
```

#### 4.1.2. `Result.err<T, E>(error: E): Result<T, E>`

Cria um Result com erro.

```typescript
const failure = Result.err('Not found')
// Result<never, string>

const error = Result.err(new Error('Failed'))
// Result<never, Error>
```

#### 4.1.3. `Result.is<T, E>(value: unknown): value is Result<T, E>`

Type guard para verificar se um valor é uma instância de Result.

```typescript
const value: unknown = Result.ok(42)

if (Result.is(value)) {
  // TypeScript sabe que value é Result
  value.unwrap()
}
```

#### 4.1.4. `Result.sequence<T>(results: T[]): Result<...>`

Combina array de Results em um único Result com array de valores. Retorna o primeiro erro encontrado.

```typescript
const results = [
  Result.ok(1),
  Result.ok(2),
  Result.ok(3)
]

const combined = Result.sequence(results)
console.log(combined.unwrap()) // [1, 2, 3]

// Com erro
const withError = [
  Result.ok(1),
  Result.err('Failed'),
  Result.ok(3)
]

const failed = Result.sequence(withError)
console.log(failed.unwrapErr()) // 'Failed'
```

#### 4.1.5. `Result.sequenceAsync<T, E>(promises: Promise<Result<T, E>>[]): Promise<Result<T[], E>>`

Versão assíncrona de `sequence`. Aguarda todas as promises.

```typescript
async function fetchUser(id: number): Promise<Result<User, Error>> {
  // ... implementação
}

const promises = [fetchUser(1), fetchUser(2), fetchUser(3)]
const result = await Result.sequenceAsync(promises)

if (result.isOk()) {
  const users = result.unwrap()
  console.log(`Fetched ${users.length} users`)
}
```

#### 4.1.6. `Result.fromPromise<T, E>(promise: Promise<T>, mapError?: (error: unknown) => E): Promise<Result<T, E>>`

Converte uma Promise em Result, capturando erros.

```typescript
// Sem mapeamento de erro
const result = await Result.fromPromise(
  fetch('/api/users')
)

// Com mapeamento de erro
const result = await Result.fromPromise(
  fetch('/api/users'),
  err => new NetworkError(err)
)

if (result.isOk()) {
  const response = result.unwrap()
  // processar response
} else {
  const error = result.unwrapErr()
  console.error('Request failed:', error)
}
```

#### 4.1.7. `Result.fromTry<T, E>(fn: () => T, mapError?: (error: unknown) => E): Result<T, E>`

Converte uma função em Result, capturando erros.

```typescript
const result = Result.fromTry(() => {
  functionThatMightThrow()
}, err => new CustomError(err))

if (result.isOk()) {
  const response = result.unwrap()
  // processar response
}
})

---

### 4.2. Validation

#### 4.2.1. `isOk(): boolean`

Verifica se o Result é Ok.

```typescript
const result = Result.ok(42)

if (result.isOk()) {
  // Sabemos que há um valor
  console.log(result.unwrap())
}
```

#### 4.1.8. `isErr(): boolean`

Verifica se o Result é Err.

```typescript
const result = Result.err('Failed')

if (result.isErr()) {
  // Sabemos que há um erro
  console.error(result.unwrapErr())
}
```

---

### 4.2. Access

#### 4.2.1. `get ok: T | null`

Retorna o valor de sucesso ou null.

```typescript
const result = Result.ok(42)
console.log(result.ok) // 42

const error = Result.err('Failed')
console.log(error.ok) // null
```

#### 4.2.2. `get err: E | null`

Retorna o erro ou null.

```typescript
const result = Result.err('Failed')
console.log(result.err) // 'Failed'

const success = Result.ok(42)
console.log(success.err) // null
```

#### 4.2.3. `unwrap(): T`

Extrai o valor. Lança exceção se for Err.

```typescript
const result = Result.ok(42)
console.log(result.unwrap()) // 42

const error = Result.err('Failed')
error.unwrap() // throws Error: Called unwrap on an Err value
```

⚠️ **Atenção**: Use apenas quando tiver certeza que o Result é Ok.

#### 4.2.4. `unwrapErr(): E`

Extrai o erro. Lança exceção se for Ok.

```typescript
const error = Result.err('Failed')
console.log(error.unwrapErr()) // 'Failed'

const result = Result.ok(42)
result.unwrapErr() // throws Error
```

#### 4.2.5. `unwrapOr(defaultValue: T): T`

Retorna o valor ou um valor padrão se for Err.

```typescript
const result = Result.ok(42)
console.log(result.unwrapOr(0)) // 42

const error = Result.err('Failed')
console.log(error.unwrapOr(0)) // 0
```

#### 4.2.6. `unwrapOrElse(fn: () => T): T`

Retorna o valor ou computa um valor padrão se for Err.

```typescript
const result = Result.err('Failed')
const value = result.unwrapOrElse(() => {
  console.log('Computing default...')
  return 0
})
// Logs: "Computing default..."
// value = 0
```

#### 4.2.7. `expect(message: string): T`

Extrai o valor ou lança exceção com mensagem customizada.

```typescript
const result = Result.ok(42)
console.log(result.expect('Should have value')) // 42

const error = Result.err('Failed')
error.expect('User must exist') // throws Error: User must exist
```

#### 4.2.8. `expectErr(message: string): E`

Extrai o erro ou lança exceção com mensagem customizada.

```typescript
const error = Result.err('Failed')
console.log(error.expectErr('Should be error')) // 'Failed'

const result = Result.ok(42)
result.expectErr('Expected error') // throws Error
```

---

### 4.3. Transformation

#### 4.3.1. `map<U>(fn: (value: T) => U): Result<U, E>`

Transforma o valor de sucesso. Erro é propagado.

```typescript
const result = Result.ok(21)
  .map(x => x * 2)
  .map(x => x.toString())

console.log(result.unwrap()) // "42"

// Com erro
const error = Result.err<number, string>('Failed')
  .map(x => x * 2) // não executa

console.log(error.unwrapErr()) // 'Failed'
```

#### 4.3.2. `mapOr<U>(defaultValue: U, fn: (value: T) => U): U`

Transforma o valor ou retorna padrão se for Err.

```typescript
const result = Result.ok(21).mapOr(0, x => x * 2)
console.log(result) // 42

const error = Result.err('Failed').mapOr(0, (x: number) => x * 2)
console.log(error) // 0
```

#### 4.3.3. `mapErr<F>(fn: (error: E) => F): Result<T, F>`

Transforma o erro. Valor é propagado.

```typescript
const result = Result.err('not found')
  .mapErr(msg => new Error(msg))
  .mapErr(err => ({ code: 404, message: err.message }))

console.log(result.unwrapErr())
// { code: 404, message: 'not found' }
```

#### 4.3.4. `andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>`

Encadeia operações que retornam Result. Para na primeira falha.

```typescript
function parseNumber(s: string): Result<number, string> {
  const n = Number(s)
  return isNaN(n) ? Result.err('Not a number') : Result.ok(n)
}

function isPositive(n: number): Result<number, string> {
  return n > 0 ? Result.ok(n) : Result.err('Not positive')
}

const result = parseNumber('42')
  .andThen(isPositive)
  .map(n => n * 2)

console.log(result.unwrap()) // 84

// Com erro
const error = parseNumber('abc')
  .andThen(isPositive) // não executa
  .map(n => n * 2) // não executa

console.log(error.unwrapErr()) // 'Not a number'
```

#### 4.3.5. `flatten<U>(): Result<U, E>`

Achata um Result aninhado.

```typescript
const nested = Result.ok(Result.ok(42))
// Result<Result<number, string>, string>

const flat = nested.flatten()
// Result<number, string>

console.log(flat.unwrap()) // 42
```

---

### 4.4. Combination

#### 4.4.1. `and<U>(other: Result<U, E>): Result<U, E>`

Retorna `other` se este Result for Ok, senão retorna o erro.

```typescript
const result = Result.ok(1).and(Result.ok(2))
console.log(result.unwrap()) // 2

const error = Result.err('Failed').and(Result.ok(2))
console.log(error.unwrapErr()) // 'Failed'
```

#### 4.4.2. `or(other: Result<T, E>): Result<T, E>`

Retorna este Result se for Ok, senão retorna `other`.

```typescript
const result = Result.ok(1).or(Result.ok(2))
console.log(result.unwrap()) // 1

const error = Result.err('Failed').or(Result.ok(2))
console.log(error.unwrap()) // 2
```

#### 4.4.3. `orElse(fn: (error: E) => Result<T, E>): Result<T, E>`

Retorna este Result se for Ok, senão chama `fn` com o erro.

```typescript
const result = Result.err('cache miss')
  .orElse(err => {
    console.log(`Fallback due to: ${err}`)
    return fetchFromDatabase()
  })
```

---

### 4.5. Conversion

#### 4.5.1. `toPromise(): Promise<T>`

Converte Result em Promise. Resolve se Ok, rejeita se Err.

```typescript
const result = Result.ok(42)

result.toPromise()
  .then(value => console.log(value)) // 42
  .catch(err => console.error(err))

// Com erro
const error = Result.err('Failed')

error.toPromise()
  .then(value => console.log(value))
  .catch(err => console.error(err)) // 'Failed'
```

---

### 4.6. Inspection

#### 4.6.1. `match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R`

Pattern matching. Executa o handler apropriado.

```typescript
const result = Result.ok(42)

const message = result.match({
  ok: value => `Success: ${value}`,
  err: error => `Error: ${error}`
})

console.log(message) // "Success: 42"
```

#### 4.6.2. `inspect(handlers: { ok: (value: T) => void; err: (error: E) => void }): Result<T, E>`

Inspeciona o valor sem consumi-lo. Retorna o Result para encadeamento.

```typescript
const result = Result.ok(42)
  .inspect({
    ok: value => console.log('Value:', value),
    err: error => console.error('Error:', error)
  })
  .map(x => x * 2)

// Logs: "Value: 42"
console.log(result.unwrap()) // 84
```

#### 4.6.3. `inspectOk(fn: (value: T) => void): Result<T, E>`

Inspeciona apenas se for Ok.

```typescript
Result.ok(42)
  .inspectOk(value => console.log('Got:', value))
  .map(x => x * 2)

// Logs: "Got: 42"
```

#### 4.6.4. `inspectErr(fn: (error: E) => void): Result<T, E>`

Inspeciona apenas se for Err.

```typescript
Result.err('Failed')
  .inspectErr(error => console.error('Error:', error))
  .mapErr(e => new Error(e))

// Logs: "Error: Failed"
```

---

## 5. Padrões de Uso

### 5.1. Validação em Cadeia

```typescript
function validateUser(data: unknown): Result<User, ValidationError> {
  return validateEmail(data)
    .andThen(validateAge)
    .andThen(validateName)
    .map(fields => new User(fields))
}

function validateEmail(data: any): Result<string, ValidationError> {
  if (!data.email || !data.email.includes('@')) {
    return Result.err(new ValidationError('Invalid email'))
  }
  return Result.ok(data.email)
}
```

### 5.2. Fallback em Cascata

```typescript
async function getUser(id: string): Promise<Result<User, Error>> {
  return fetchFromCache(id)
    .orElse(() => fetchFromDatabase(id))
    .orElse(() => fetchFromBackup(id))
}
```

### 5.3. Propagação de Erros

```typescript
function processOrder(orderId: string): Result<Receipt, OrderError> {
  return fetchOrder(orderId)
    .andThen(order => validateOrder(order))
    .andThen(order => chargePayment(order))
    .andThen(payment => generateReceipt(payment))
}
```

### 5.4. Múltiplas Operações

```typescript
async function loadDashboard(): Promise<Result<Dashboard, Error>> {
  const promises = [
    fetchUserData(),
    fetchNotifications(),
    fetchAnalytics()
  ]

  const result = await Result.sequenceAsync(promises)

  return result.map(([user, notifications, analytics]) => ({
    user,
    notifications,
    analytics
  }))
}
```

---

## 6. Comparação com Exceptions

### 6.1. Com Exceptions (problemático)

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

try {
  const result = divide(10, 0)
  console.log(result)
} catch (error) {
  // Fácil esquecer de tratar
  console.error(error)
}
```

### 6.2. Com Result (explícito)

```typescript
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Result.err('Division by zero')
  }
  return Result.ok(a / b)
}

const result = divide(10, 0)
// TypeScript força verificação:
// result.unwrap() // compilador avisa!

if (result.isOk()) {
  console.log(result.unwrap())
} else {
  console.error(result.unwrapErr())
}
```

---

## 7. TypeScript

### 7.1. Inferência de Tipos

```typescript
// Tipos são inferidos automaticamente
const result = Result.ok(42)
// Result<number, never>

const error = Result.err('Failed')
// Result<never, string>

// Especificando tipos explicitamente
const typed = Result.ok<number, string>(42)
// Result<number, string>
```

### 7.2. Union Types

```typescript
type AppError = NetworkError | ValidationError | DatabaseError

function fetchData(): Result<Data, AppError> {
  // ...
}

const result = fetchData()

result.match({
  ok: data => console.log(data),
  err: error => {
    // TypeScript sabe que error é AppError
    if (error instanceof NetworkError) {
      // tratar erro de rede
    }
  }
})
```

### 7.3. Narrowing com Type Guards

```typescript
const result: Result<number, string> = getUserAge()

if (result.isOk()) {
  // TypeScript sabe que result é Result<number, never>
  const age: number = result.unwrap()
}

if (result.isErr()) {
  // TypeScript sabe que result é Result<never, string>
  const error: string = result.unwrapErr()
}
```

### 7.4. Tipos Genéricos

```typescript
function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.map(fn)
}

// Uso
const numberResult = Result.ok(42)
const stringResult = mapResult(numberResult, n => n.toString())
// Result<string, never>
```

---

## 8. Erros Customizados

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public query: string,
    public code?: string
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

function validateEmail(email: string): Result<string, ValidationError> {
  if (!email.includes('@')) {
    return Result.err(
      new ValidationError('Invalid email', 'email', email)
    )
  }
  return Result.ok(email)
}

function saveUser(user: User): Result<User, DatabaseError> {
  // ... implementação
}
```

---

## 9. Boas Práticas

### 9.1. ✅ Faça

- Use `andThen` para encadear operações que podem falhar
- Use `map` para transformar valores de sucesso
- Use `mapErr` para transformar/enriquecer erros
- Use pattern matching com `match` para clareza
- Especifique tipos de erro explícitos

### 9.2. ❌ Evite

- Usar `unwrap()` sem verificar `isOk()`
- Ignorar Results sem tratamento
- Misturar exceptions com Results
- Tipos de erro muito genéricos (apenas `Error`)

### 9.3. Exemplo Completo

```typescript
type UserError =
  | ValidationError
  | DatabaseError
  | NetworkError

async function createUser(data: unknown): Promise<Result<User, UserError>> {
  return validateUserData(data)
    .andThen(data => Result.fromPromise(
      saveToDatabase(data),
      err => new DatabaseError(err)
    ))
    .andThen(user => Result.fromPromise(
      sendWelcomeEmail(user),
      err => new NetworkError(err)
    ))
}

// Uso
const result = await createUser(formData)

result.match({
  ok: user => console.log('User created:', user.id),
  err: error => {
    if (error instanceof ValidationError) {
      showValidationError(error.field, error.message)
    } else if (error instanceof DatabaseError) {
      showError('Database error occurred')
      logError(error.query)
    } else {
      showError('Network error')
    }
  }
})
```

---

## 10. Migração Gradual

Você pode adotar Result.js gradualmente:

```typescript
// Função legada com exceptions
function legacyFetch(): User {
  // pode lançar
}

// Wrapper com Result
function safeFetch(): Result<User, Error> {
  try {
    const user = legacyFetch()
    return Result.ok(user)
  } catch (error) {
    return Result.err(error as Error)
  }
}
```

---

## 11. Performance

Result.js é extremamente leve:
- Zero dependências
- Bundle size mínimo
- Overhead negligível
- Tree-shakeable

---

## 12. Recursos Adicionais

- [Repositório GitHub](https://github.com/eriveltondasilva/result.js)
- [Rust Result Documentation](https://doc.rust-lang.org/std/result/)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)