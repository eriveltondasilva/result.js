# Installation

## Requirements

- **Node.js:** 22.0.0+
- **Typescript:** 5.0+ *(optional, but recommended)*

## Package Installation

```bash
npm install @eriveltonsilva/result.js
```

## Import

### ESM (Recommended)

::: code-group

```typescript [ESM (Recommended)]
import { Result } from '@eriveltonsilva/result.js'
```

```typescript [ESM - default]
import Result from '@eriveltonsilva/result.js'
```

```javascript [CommonJS]
const { Result } = require('@eriveltonsilva/result.js')
```

:::

## Typescript Setup

Result.js is fully typed. No additional configuration needed.

```typescript
import { Result, type AsyncResult } from '@eriveltonsilva/result.js'

const result: Result<number, string> = Result.ok(42)
const asyncOp: AsyncResult<User, Error> = Result.fromPromise(() => fetchUser(id))
```

## Next Steps

- **[Quick Start](./quick-start.md)** — Learn the basics
- **[What is Result?](./what-is-result.md)** — Understand the pattern
