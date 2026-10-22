const API_URL = '/api/price'
const API_KEY = import.meta.env.VITE_API_KEY
const TIMEOUT_MS = 15000
const EMPTY_GOODS_ID = '00000000-0000-0000-0000-000000000000'

export class ApiError extends Error {
  constructor(message, kind = 'api') {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
  }
}

const toWarehouse = (w) => ({
  id: w.id,
  code: w.code || '',
  own: Boolean(w.own),
  price: Number(w.price) || 0,
  stock: Number(w.stock) || 0,
  shipmentDate: w.shipmentDate || null,
})

export const toPart = (g) => ({
  id: g.goodsID,
  brand: g.brand,
  number: g.number,
  name: g.name,
  count: Number(g.count) || 0,
  warehouses: (g.warehouses || []).map(toWarehouse),
})

const isFound = (g) => g && g.goodsID !== EMPTY_GOODS_ID && g.brand

async function request(params, signal) {
  const query = new URLSearchParams({ key: API_KEY, ...params })
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  let response
  try {
    response = await fetch(`${API_URL}?${query}`, { signal: combined })
  } catch (e) {
    if (signal?.aborted) throw e
    if (timeout.aborted) throw new ApiError('Сервер не ответил вовремя', 'network')
    throw new ApiError('Нет связи с сервером', 'network')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new ApiError(`Некорректный ответ сервера (${response.status})`, 'network')
  }
  if (data.error) throw new ApiError(data.error)
  if (!response.ok) throw new ApiError(`Ошибка сервера (${response.status})`, 'network')
  return (data.goods || []).filter(isFound)
}

export async function fetchBrands(number, signal) {
  const goods = await request({ number }, signal)
  return goods.map(toPart)
}

export async function fetchAnalogs(number, brand, signal) {
  const goods = await request({ number, brand, analogues: 'on' }, signal)
  const original = goods[0]
  if (!original) return { original: null, analogs: [] }
  return {
    original: toPart(original),
    analogs: (original.analogues || []).filter(isFound).map(toPart),
  }
}
