import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { addressDummyData } from '@/assets/assets'
import { AddressState, Address } from '../../types'

const initialState: AddressState = {
  list: [addressDummyData],
}

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<Address>) => {
      state.list.push(action.payload)
    },
  },
})

export const { addAddress } = addressSlice.actions

export default addressSlice.reducer
