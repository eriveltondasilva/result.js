export class ResultTypeError extends TypeError {
  constructor(message: string) {
    super(`${message}. Make sure element is created with Result.ok() or Result.err().`)

    this.name = 'ResultTypeError'

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
