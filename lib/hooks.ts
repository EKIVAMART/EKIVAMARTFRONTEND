import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <TSelected,>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector<RootState, TSelected>(selector)

// Product-specific selectors
export const useProducts = () => useAppSelector(state => state.product.list)
export const useProductById = (id: string) => {
  const products = useAppSelector(state => state.product.list)
  return products.find(p => p.id === id)
}

// Cart & Wishlist selectors
export const useCartCount = () => useAppSelector(state => state.cart.total)
export const useWishlist = () => useAppSelector(state => state.wishlist.items)

