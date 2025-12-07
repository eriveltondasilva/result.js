const Result = require('../src/index.js')

console.log(Result.ok(1))
console.log(Result.err(new Error('Something went wrong')))