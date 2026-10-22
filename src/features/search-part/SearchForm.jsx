import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectBrands } from './brandsSlice'
import { search } from '../../app/navigation'

const EXAMPLES = ['0189', '7160500039S', 'OC90']

export function SearchForm() {
  const dispatch = useDispatch()
  const { number, status } = useSelector(selectBrands)
  const [value, setValue] = useState(number)
  const [touched, setTouched] = useState(false)

  useEffect(() => setValue(number), [number])

  const trimmed = value.trim()
  const invalid = touched && !trimmed

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (trimmed) dispatch(search(trimmed))
  }

  const pick = (example) => {
    setValue(example)
    dispatch(search(example))
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="number" className="form-label fw-semibold">Артикул детали</label>
      <div className="input-group">
        <input
          id="number"
          className={`form-control form-control-lg ${invalid ? 'is-invalid' : ''}`}
          placeholder="Например, 0189"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button className="btn btn-primary btn-lg" type="submit" disabled={status === 'loading'}>
          {status === 'loading' && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          Найти
        </button>
        {invalid && <div className="invalid-feedback">Введите артикул</div>}
      </div>
      <div className="form-text">
        Попробуйте:{' '}
        {EXAMPLES.map((ex, i) => (
          <span key={ex}>
            {i > 0 && ', '}
            <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => pick(ex)}>{ex}</button>
          </span>
        ))}
      </div>
    </form>
  )
}
