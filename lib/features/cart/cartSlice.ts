import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartState } from '../../types';
import { cartApi } from '../../api';
import toast from 'react-hot-toast';

const initialState: CartState = {
  activeItems: [],
  savedItems: [],
  activeProductIds: [],
  savedProductIds: [],
  activeCount: 0,
  savedCount: 0,
  total: 0, // totalCount
  summary: null,
  loading: false,
  noteModal: {
    isOpen: false,
    productId: null,
    quantity: 1,
  },
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart();
      if (res?.success) {
        return res.data;
      }
      return rejectWithValue(res?.message || 'Failed to fetch cart');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const fetchCartCount = createAsyncThunk(
  'cart/fetchCartCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCartCount();
      if (res?.success) {
        return res.data;
      }
      return rejectWithValue(res?.message || 'Failed to fetch cart count');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart count');
    }
  }
);

export const fetchCartSummary = createAsyncThunk(
  'cart/fetchCartSummary',
  async (params: { country?: string; state?: string } | undefined, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCartSummary(params);
      if (res?.success) {
        return res.data;
      }
      return rejectWithValue(res?.message || 'Failed to fetch cart summary');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart summary');
    }
  }
);

export const addItemToCartApi = createAsyncThunk(
  'cart/addItemToCartApi',
  async (
    payload: { productId: string; quantity: number; notes?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await cartApi.addItemToCart(payload.productId, payload.quantity, payload.notes);
      if (res?.success) {
        toast.success(res.message || 'Product added to cart');
        dispatch(fetchCart());
        dispatch(fetchCartCount());
        return res.data;
      }
      return rejectWithValue(res?.message || 'Failed to add item to cart');
    } catch (error: any) {
      if (error.statusCode === 409) {
        toast.error('This item is already in your cart.');
      } else {
        toast.error(error.message || 'Something went wrong. Please try again.');
      }
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItemQuantityApi = createAsyncThunk(
  'cart/updateCartItemQuantityApi',
  async (
    payload: { productId: string; quantity: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await cartApi.updateItemQuantity(payload.productId, payload.quantity);
      if (res?.success) {
        dispatch(fetchCart());
        dispatch(fetchCartCount());
        dispatch(fetchCartSummary());
        return payload;
      }
      return rejectWithValue(res?.message || 'Failed to update quantity');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
      return rejectWithValue(error.message || 'Failed to update quantity');
    }
  }
);

export const removeCartItemApi = createAsyncThunk(
  'cart/removeCartItemApi',
  async (productId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await cartApi.removeItemFromCart(productId);
      if (res?.success) {
        toast.success('Item removed from cart');
        dispatch(fetchCart());
        dispatch(fetchCartCount());
        dispatch(fetchCartSummary());
        return productId;
      }
      return rejectWithValue(res?.message || 'Failed to remove item');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
      return rejectWithValue(error.message || 'Failed to remove item');
    }
  }
);

export const selectCartItemApi = createAsyncThunk(
  'cart/selectCartItemApi',
  async (
    payload: { productId: string; isSelected: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await cartApi.selectOrUnselectItem(payload.productId, payload.isSelected);
      if (res?.success) {
        dispatch(fetchCart());
        dispatch(fetchCartSummary());
        return payload;
      }
      return rejectWithValue(res?.message || 'Failed to update selection');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update selection');
      return rejectWithValue(error.message || 'Failed to update selection');
    }
  }
);

export const selectAllCartItemsApi = createAsyncThunk(
  'cart/selectAllCartItemsApi',
  async (isSelected: boolean, { dispatch, rejectWithValue }) => {
    try {
      const res = await cartApi.selectOrUnselectAllItems(isSelected);
      if (res?.success) {
        dispatch(fetchCart());
        dispatch(fetchCartSummary());
        return isSelected;
      }
      return rejectWithValue(res?.message || 'Failed to update selection');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update selection');
      return rejectWithValue(error.message || 'Failed to update selection');
    }
  }
);

export const saveCartItemForLaterApi = createAsyncThunk(
  'cart/saveCartItemForLaterApi',
  async (productId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await cartApi.saveItemForLater(productId);
      if (res?.success) {
        toast.success('Item saved for later');
        dispatch(fetchCart());
        dispatch(fetchCartCount());
        dispatch(fetchCartSummary());
        return productId;
      }
      return rejectWithValue(res?.message || 'Failed to save for later');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save for later');
      return rejectWithValue(error.message || 'Failed to save for later');
    }
  }
);

export const moveSavedCartItemToCartApi = createAsyncThunk(
  'cart/moveSavedCartItemToCartApi',
  async (productId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await cartApi.moveSavedItemBackToCart(productId);
      if (res?.success) {
        toast.success('Item moved to active cart');
        dispatch(fetchCart());
        dispatch(fetchCartCount());
        dispatch(fetchCartSummary());
        return productId;
      }
      return rejectWithValue(res?.message || 'Failed to move to cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to move to cart');
      return rejectWithValue(error.message || 'Failed to move to cart');
    }
  }
);

export const clearCartApi = createAsyncThunk(
  'cart/clearCartApi',
  async (clearAll: boolean, { dispatch, rejectWithValue }) => {
    try {
      const res = await cartApi.clearCart(clearAll);
      if (res?.success) {
        toast.success(res.message || 'Items removed from cart');
        dispatch(fetchCart());
        dispatch(fetchCartCount());
        dispatch(fetchCartSummary());
        return clearAll;
      }
      return rejectWithValue(res?.message || 'Failed to clear cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart');
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    openNoteModal: (
      state,
      action: PayloadAction<{ productId: string; quantity?: number }>
    ) => {
      state.noteModal = {
        isOpen: true,
        productId: action.payload.productId,
        quantity: action.payload.quantity ?? 1,
      };
    },
    closeNoteModal: (state) => {
      state.noteModal.isOpen = false;
      state.noteModal.productId = null;
      state.noteModal.quantity = 1;
    },
    clearCartLocally: (state) => {
      state.activeItems = [];
      state.savedItems = [];
      state.activeProductIds = [];
      state.savedProductIds = [];
      state.activeCount = 0;
      state.savedCount = 0;
      state.total = 0;
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.activeItems = action.payload?.activeItems || [];
        state.savedItems = action.payload?.savedItems || [];
        state.activeProductIds = (action.payload?.activeItems || [])
          .map((item: any) => item.productId)
          .filter(Boolean);
        state.savedProductIds = (action.payload?.savedItems || [])
          .map((item: any) => item.productId)
          .filter(Boolean);
        state.activeCount = action.payload?.activeCount ?? 0;
        state.savedCount = action.payload?.savedCount ?? 0;
        state.total = state.activeCount + state.savedCount;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })

      // fetchCartCount
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        state.activeCount = action.payload?.activeCount ?? 0;
        state.savedCount = action.payload?.savedCount ?? 0;
        state.total = action.payload?.totalCount ?? (state.activeCount + state.savedCount);
      })

      // fetchCartSummary
      .addCase(fetchCartSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const { openNoteModal, closeNoteModal, clearCartLocally } = cartSlice.actions;

export default cartSlice.reducer;
