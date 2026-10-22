import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchAnalogs } from '../../shared/api/favoritApi'

export const loadAnalogs = createAsyncThunk(
  'analogs/load',
  ({ number, brand }, { signal }) => fetchAnalogs(number, brand, signal),
  { serializeError: (e) => ({ message: e.message, name: e.name }) },
)

const initialState = { brand: null, original: null, items: [], status: 'idle', error: null, requestId: null }

const analogsSlice = createSlice({
  name: 'analogs',
  initialState,
  reducers: {
    resetAnalogs: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAnalogs.pending, (state, { meta }) => {
        state.brand = meta.arg.brand
        state.original = null
        state.items = []
        state.status = 'loading'
        state.error = null
        state.requestId = meta.requestId
      })
      .addCase(loadAnalogs.fulfilled, (state, { payload, meta }) => {
        if (meta.requestId !== state.requestId) return
        state.original = payload.original
        state.items = payload.analogs
        state.status = 'succeeded'
      })
      .addCase(loadAnalogs.rejected, (state, { error, meta }) => {
        if (meta.requestId !== state.requestId || error.name === 'AbortError') return
        state.status = 'failed'
        state.error = error.message
      })
  },
})

export const { resetAnalogs } = analogsSlice.actions
export default analogsSlice.reducer

export const selectAnalogs = (state) => state.analogs
