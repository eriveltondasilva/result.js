const { Result } = require('../dist/index.cjs')

const result = Result.ok(1)

if (result.isOk()) {
    console.log(result.unwrap())
}
