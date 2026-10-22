import { Fragment, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadAnalogs, selectAnalogs } from './analogsSlice'
import { selectBrands } from '../search-part/brandsSlice'
import { getMinPrice, isInStock, sortParts } from '../../entities/part/model/selectors'
import { formatDate, formatPrice } from '../../shared/lib/format'
import { Loader } from '../../shared/ui/Loader'
import { ErrorAlert } from '../../shared/ui/ErrorAlert'

const PAGE_SIZE = 50

function SortHeader({ field, sort, onSort, children, className = '' }) {
  const active = sort.by === field
  const arrow = active ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return (
    <th className={className} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="btn btn-link btn-sm p-0 fw-semibold text-body text-decoration-none" onClick={() => onSort(field)}>
        {children}{arrow}
      </button>
    </th>
  )
}

function Warehouses({ part }) {
  if (!part.warehouses.length) return <span className="text-secondary">Нет предложений на складах</span>
  return (
    <table className="table table-sm mb-0 small">
      <thead>
        <tr><th>Склад</th><th className="text-end">Цена</th><th className="text-end">Остаток</th><th className="text-end">Отгрузка</th></tr>
      </thead>
      <tbody>
        {part.warehouses.map((w) => (
          <tr key={w.id}>
            <td>{w.code || '—'}{w.own && <span className="badge text-bg-success ms-2">наш склад</span>}</td>
            <td className="text-end text-nowrap">{formatPrice(w.price)}</td>
            <td className="text-end">{w.stock}</td>
            <td className="text-end text-nowrap">{formatDate(w.shipmentDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PartRow({ part, original }) {
  const [open, setOpen] = useState(false)
  const price = getMinPrice(part)
  return (
    <Fragment>
      <tr className={original ? 'table-primary' : isInStock(part) ? '' : 'text-secondary'}>
        <td>
          <div className="fw-semibold">
            {part.name}
            {original && <span className="badge text-bg-primary ms-2">искомый</span>}
          </div>
          <div className="small text-secondary">{part.brand} · {part.number}</div>
        </td>
        <td className="text-end text-nowrap">{price == null ? '—' : `от ${formatPrice(price)}`}</td>
        <td className="text-end text-nowrap">{isInStock(part) ? `${part.count} шт.` : 'нет в наличии'}</td>
        <td className="text-end">
          <button type="button" className="btn btn-sm btn-outline-secondary" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? 'Скрыть' : 'Склады'}
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={4} className="bg-body-tertiary"><Warehouses part={part} /></td>
        </tr>
      )}
    </Fragment>
  )
}

export function AnalogsTable() {
  const dispatch = useDispatch()
  const { number } = useSelector(selectBrands)
  const { brand, original, items, status, error } = useSelector(selectAnalogs)
  const [sort, setSort] = useState({ by: 'price', dir: 'asc' })
  const [onlyInStock, setOnlyInStock] = useState(true)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const visible = useMemo(() => {
    const filtered = onlyInStock ? items.filter(isInStock) : items
    return sortParts(filtered, sort.by, sort.dir)
  }, [items, onlyInStock, sort])

  if (status === 'idle') return null
  if (status === 'loading') return <Loader text={`Загружаем аналоги ${brand}…`} />
  if (status === 'failed') return <ErrorAlert error={error} onRetry={() => dispatch(loadAnalogs({ number, brand }))} />

  const onSort = (by) => setSort((s) => ({ by, dir: s.by === by && s.dir === 'asc' ? 'desc' : 'asc' }))
  const inStockCount = items.filter(isInStock).length

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h5 mb-0">
          Аналоги {brand} {original?.number}
          <span className="text-secondary fw-normal fs-6 ms-2">{inStockCount} в наличии из {items.length}</span>
        </h2>
        <div className="form-check form-switch mb-0">
          <input className="form-check-input" type="checkbox" id="in-stock" checked={onlyInStock}
            onChange={(e) => { setOnlyInStock(e.target.checked); setLimit(PAGE_SIZE) }} />
          <label className="form-check-label" htmlFor="in-stock">Только в наличии</label>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white">
          <thead>
            <tr>
              <SortHeader field="name" sort={sort} onSort={onSort}>Название</SortHeader>
              <SortHeader field="price" sort={sort} onSort={onSort} className="text-end">Цена</SortHeader>
              <SortHeader field="count" sort={sort} onSort={onSort} className="text-end">Остаток</SortHeader>
              <th />
            </tr>
          </thead>
          <tbody>
            {original && <PartRow part={original} original />}
            {visible.slice(0, limit).map((part) => <PartRow key={part.id} part={part} />)}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <div className="alert alert-secondary">
          {items.length ? 'Аналогов в наличии нет. Снимите фильтр, чтобы увидеть все.' : 'Аналогов не найдено'}
        </div>
      )}
      {visible.length > limit && (
        <button type="button" className="btn btn-outline-primary w-100" onClick={() => setLimit(limit + PAGE_SIZE)}>
          Показать ещё ({visible.length - limit})
        </button>
      )}
    </section>
  )
}
