import { Result } from './index.js'

const result = Result.ok(42)

if (result.isOk()) {
  console.log(result.unwrap())
}
