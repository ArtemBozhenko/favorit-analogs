const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
})

export const formatPrice = (value) => (value == null ? '—' : priceFormat.format(value))
export const formatDate = (iso) => (iso ? dateFormat.format(new Date(iso)) : '—')
