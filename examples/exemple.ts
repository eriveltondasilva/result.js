import Result from '../src/index.js'

const result = Result.ok({name: 'John', age: 30})
console.log(result.unwrap())
