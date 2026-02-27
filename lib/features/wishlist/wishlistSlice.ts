import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WishlistState } from '../../types'

const initialState: WishlistState = {
    items: [],
}

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlist: (state, action: PayloadAction<string>) => {
            const productId = action.payload
            const index = state.items.indexOf(productId)
            if (index >= 0) {
                state.items.splice(index, 1)
            } else {
                state.items.push(productId)
            }
        },
        removeFromWishlist: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(id => id !== action.payload)
        },
        clearWishlist: (state) => {
            state.items = []
        },
    },
})

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
