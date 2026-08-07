const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
})

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount)
}
