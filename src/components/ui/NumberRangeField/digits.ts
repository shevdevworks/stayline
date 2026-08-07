export function toDigits(raw: string): string {
  return raw.replace(/\D/g, '')
}

export function toNumberOrNull(digits: string): number | null {
  return digits === '' ? null : Number(digits)
}
