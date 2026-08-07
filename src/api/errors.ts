export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class BookingUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookingUnavailableError'
  }
}
