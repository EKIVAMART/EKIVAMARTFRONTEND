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
  location?: string
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
  activeItems: any[]
  savedItems: any[]
  activeProductIds: string[]
  savedProductIds: string[]
  activeCount: number
  savedCount: number
  total: number // totalCount
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    taxRate?: number;
    taxPercentage?: number;
    region?: string | null;
    country?: string;
    total: number;
    currency: string;
    formattedRate?: string;
  } | null
  loading: boolean
  noteModal: {
    isOpen: boolean
    productId: string | null
    quantity: number
  }
}

export interface HydratedWishlistItem {
  id: string;
  addedAt: string;
  product: any;
}

export interface WishlistState {
  items: string[]; // Store product IDs
  hydratedItems: HydratedWishlistItem[];
  count: number;
  loading: boolean;
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
  wishlist: WishlistState
}
