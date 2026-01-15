// Types for the Store
import { StaticImageData } from 'next/image'

export interface User {
  id: string
  name: string
  email: string
  image?: string | StaticImageData
}

export interface Store {
  id: string
  userId: string
  name: string
  description: string
  username: string
  address: string
  status: string
  isActive: boolean
  logo: StaticImageData
  email: string
  contact: string
  createdAt: string
  updatedAt: string
  user: User
}

export interface Rating {
  id: string
  rating: number
  review: string
  user: { name: string; image: StaticImageData }
  productId: string
  createdAt: string
  updatedAt: string
  product: {
    name: string
    category: string
    id: string
  }
}

export interface Product {
  id: string
  name: string
  description: string
  mrp: number
  price: number
  images: StaticImageData[]
  category: string
  storeId: string
  inStock: boolean
  store: Store
  rating: Rating[]
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  name: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  createdAt: string
}

// Redux State Types
export interface CartState {
  total: number
  cartItems: Record<string, number>
}

export interface ProductState {
  list: Product[]
}

export interface AddressState {
  list: Address[]
}

export interface RatingState {
  ratings: Rating[]
}

export interface RootState {
  cart: CartState
  product: ProductState
  address: AddressState
  rating: RatingState
}
