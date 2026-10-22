import { resetSearch, searchPart } from '../features/search-part/brandsSlice'
import { loadAnalogs, resetAnalogs } from '../features/analogs/analogsSlice'


const readUrl = () => {
  const params = new URLSearchParams(window.location.search)
  return { number: params.get('number')?.trim() || '', brand: params.get('brand') || '' }
}

const writeUrl = ({ number, brand }, { replace = false } = {}) => {
  const params = new URLSearchParams()
  if (number) params.set('number', number)
  if (brand) params.set('brand', brand)
  const query = params.toString()
  const url = query ? `?${query}` : window.location.pathname
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url)
}

const apply = ({ number, brand }) => async (dispatch, getState) => {
  dispatch(resetAnalogs())
  if (!number) return dispatch(resetSearch())
  if (brand) {
    dispatch(searchPart(number))
    return dispatch(loadAnalogs({ number, brand }))
  }
  const result = await dispatch(searchPart(number))
  const first = searchPart.fulfilled.match(result) && result.payload[0]
  if (first && getState().brands.requestId === result.meta.requestId) {
    writeUrl({ number, brand: first.brand }, { replace: true })
    dispatch(loadAnalogs({ number, brand: first.brand }))
  }
}

export const search = (number) => (dispatch) => {
  writeUrl({ number })
  dispatch(apply({ number }))
}

export const chooseBrand = (brand) => (dispatch, getState) => {
  const { number } = getState().brands
  writeUrl({ number, brand })
  dispatch(loadAnalogs({ number, brand }))
}

export const syncFromUrl = () => (dispatch, getState) => {
  const { number, brand } = readUrl()
  const state = getState()
  if (number && number === state.brands.number && state.brands.status === 'succeeded') {
    if (!brand) return dispatch(resetAnalogs())
    if (brand !== state.analogs.brand) return dispatch(loadAnalogs({ number, brand }))
    return
  }
  dispatch(apply({ number, brand }))
}

export const startUrlSync = (store) => {
  store.dispatch(syncFromUrl())
  const onPop = () => store.dispatch(syncFromUrl())
  window.addEventListener('popstate', onPop)
  return () => window.removeEventListener('popstate', onPop)
}
