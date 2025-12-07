import { Result } from '../src/index.js'
import type { OkTuple } from '../src/core/types.js'

const result = Result.err(new Error('Something went wrong'))
console.log(result.toString())

const results = [
  Result.ok(1),
  Result.ok('hello'),
  Result.ok(true)
] as const

type Values = OkTuple<typeof results> // [number, string, boolean]