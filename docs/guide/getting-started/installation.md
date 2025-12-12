# Installation

## Requirements

- **Node.js:** ≥ 22.0.0
- **TypeScript:** ≥ 5.0 *(optional, but recommended)*

## Package Installation

```bash
npm install @eriveltonsilva/result.js
```

## Import

### ESM (Recommended)

```typescript
import { Result } from '@eriveltonsilva/result.js'
```

### CommonJS

```javascript
const { Result } = require('@eriveltonsilva/result.js')
```

## TypeScript Setup

Result.js is fully typed. No additional configuration needed.

```typescript
import { Result, type AsyncResult } from '@eriveltonsilva/result.js'

const result: Result<number, string> = Result.ok(42)
const asyncOp: AsyncResult<User, Error> = Result.fromPromise(() => fetchUser(id))
```

## Next Steps

- **[Quick Start](./quick-start.md)** — Learn the basics
- **[What is Result?](./what-is-result.md)** — Understand the pattern
