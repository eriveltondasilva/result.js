import { Result } from '../src/index.ts'

const success = Result.ok(42)
const failure = Result.err('operation failed')

if (success.isOk()) {
    console.log(success.unwrap())
}

if (failure.isErr()) {
    console.log(failure.unwrapErr())
}