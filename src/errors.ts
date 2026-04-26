export class ResultTypeError extends TypeError {
  constructor(message: string, cause: unknown) {
    super(`${message}.\nMake sure element is created with Result.ok() or Result.err().`, { cause })

    this.name = 'ResultTypeError'

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
