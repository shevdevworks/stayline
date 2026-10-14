export function guestsLabel(guests: number): string {
  return `${guests} ${guests === 1 ? 'guest' : 'guests'}`
}
