import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import productReducer from './features/product/productSlice';
import addressReducer from './features/address/addressSlice';
import ratingReducer from './features/rating/ratingSlice';
import authReducer from './features/auth/authSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
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
