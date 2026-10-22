import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchBrands } from '../../shared/api/favoritApi'

export const searchPart = createAsyncThunk(
  'brands/search',
  (number, { signal }) => fetchBrands(number, signal),
  { serializeError: (e) => ({ message: e.message, name: e.name }) },
)

const initialState = { number: '', items: [], status: 'idle', error: null, requestId: null }

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    resetSearch: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPart.pending, (state, { meta }) => {
        state.number = meta.arg
        state.items = []
        state.status = 'loading'
        state.error = null
        state.requestId = meta.requestId
      })
      .addCase(searchPart.fulfilled, (state, { payload, meta }) => {
        if (meta.requestId !== state.requestId) return
        state.items = payload
        state.status = 'succeeded'
      })
      .addCase(searchPart.rejected, (state, { error, meta }) => {
        if (meta.requestId !== state.requestId || error.name === 'AbortError') return
        state.status = 'failed'
        state.error = error.message
      })
  },
})

export const { resetSearch } = brandsSlice.actions
export default brandsSlice.reducer

export const selectBrands = (state) => state.brands
