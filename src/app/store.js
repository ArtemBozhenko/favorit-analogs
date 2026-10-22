import { configureStore } from '@reduxjs/toolkit'
import brands from '../features/search-part/brandsSlice'
import analogs from '../features/analogs/analogsSlice'

export const store = configureStore({ reducer: { brands, analogs } })
