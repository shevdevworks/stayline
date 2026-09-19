const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
})

// Whole amounts read as €280, not €280.00 — every venue price is a whole
// number, so the cents would be noise on nearly every label.
const wholePriceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? wholePriceFormatter.format(amount) : priceFormatter.format(amount)
}
