import { result } from './result'

import { Err } from './err'
import { Ok } from './ok'

import type { Result as ResultType, AsyncResult as AsyncResultType } from './types'

export const Result = Object.freeze(result)

export type Result<T, E> = ResultType<T, E>
export type AsyncResult<T, E> = AsyncResultType<T, E>

export { Ok, Err }
export default Result
