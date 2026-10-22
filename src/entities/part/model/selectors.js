export function getMinPrice(part) {
  const prices = part.warehouses.filter((w) => w.stock > 0 && w.price > 0).map((w) => w.price)
  return prices.length ? Math.min(...prices) : null
}

export const isInStock = (part) => part.count > 0

const compareNullableAsc = (a, b) => (a == null) - (b == null) || (a ?? 0) - (b ?? 0)

export function sortParts(parts, sortBy, direction = 'asc') {
  const sign = direction === 'asc' ? 1 : -1
  return [...parts].sort((a, b) => {
    const stockDiff = isInStock(b) - isInStock(a)
    if (stockDiff) return stockDiff
    if (sortBy === 'price') {
      const pa = getMinPrice(a)
      const pb = getMinPrice(b)
      if (pa == null || pb == null) return compareNullableAsc(pa, pb)
      return sign * (pa - pb)
    }
    if (sortBy === 'count') return sign * (a.count - b.count)
    return sign * a.name.localeCompare(b.name, 'ru')
  })
}
