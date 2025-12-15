import { Result } from '../dist/index.js'

const result = Result.ok(1)

Result.all([Result.ok(1), Result.ok(2), Result.ok(3)])


if (result.isOk()) {
    console.log(result.unwrap())
}
