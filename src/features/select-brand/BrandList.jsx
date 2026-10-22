import { useDispatch, useSelector } from 'react-redux'
import { searchPart, selectBrands } from '../search-part/brandsSlice'
import { selectAnalogs } from '../analogs/analogsSlice'
import { chooseBrand } from '../../app/navigation'
import { getMinPrice } from '../../entities/part/model/selectors'
import { formatPrice } from '../../shared/lib/format'
import { Loader } from '../../shared/ui/Loader'
import { ErrorAlert } from '../../shared/ui/ErrorAlert'

export function BrandList() {
  const dispatch = useDispatch()
  const { number, items, status, error } = useSelector(selectBrands)
  const { brand: selected } = useSelector(selectAnalogs)

  if (status === 'idle') return null
  if (status === 'loading') return <Loader text="Ищем производителей…" />
  if (status === 'failed') return <ErrorAlert error={error} onRetry={() => dispatch(searchPart(number))} />
  if (!items.length) {
    return <div className="alert alert-secondary">По артикулу {number} ничего не найдено</div>
  }

  return (
    <section>
      <h2 className="h5 mb-3">Выберите производителя</h2>
      <div className="list-group">
        {items.map((part) => {
          const price = getMinPrice(part)
          const active = part.brand === selected
          return (
            <button
              key={part.id}
              type="button"
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3 ${active ? 'active' : ''}`}
              aria-current={active}
              onClick={() => dispatch(chooseBrand(part.brand))}
            >
              <span>
                <strong>{part.brand}</strong> <span className={active ? '' : 'text-secondary'}>{part.number}</span>
                <span className="d-block small">{part.name}</span>
              </span>
              <span className="text-nowrap small text-end">
                {part.count > 0 ? <>от {formatPrice(price)}<br />{part.count} шт.</> : 'нет в наличии'}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
