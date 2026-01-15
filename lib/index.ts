// Re-export store and types for convenient imports
export { makeStore } from './store'
export type { AppStore, RootState, AppDispatch } from './store'

// Re-export types
export type {
  User,
  Store,
  Rating,
  Product,
  Address,
  CartState,
  ProductState,
  AddressState,
  RatingState,
  RootState as StoreRootState,
} from './types'

// Re-export actions
export { addToCart, removeFromCart, clearCart, deleteItemFromCart } from './features/cart/cartSlice'
export { setProduct, clearProduct } from './features/product/productSlice'
export { addAddress } from './features/address/addressSlice'
export { addRating } from './features/rating/ratingSlice'
