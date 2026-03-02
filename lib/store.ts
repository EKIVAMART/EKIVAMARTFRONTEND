import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import cartReducer from './features/cart/cartSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';
import productReducer from './features/product/productSlice';
import addressReducer from './features/address/addressSlice';
import ratingReducer from './features/rating/ratingSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      wishlist: wishlistReducer,
      product: productReducer,
      address: addressReducer,
      rating: ratingReducer,
      auth: authReducer,
    },
  });
};

// Create and export a store instance for server-side usage
export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
