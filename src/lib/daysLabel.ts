export function daysLabel(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`
}
