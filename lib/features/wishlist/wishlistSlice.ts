import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { WishlistState, HydratedWishlistItem } from '../../types'
import { wishlistApi } from '../../api'
import toast from 'react-hot-toast'

const initialState: WishlistState = {
    items: [],
    hydratedItems: [],
    count: 0,
    loading: false,
}

// ─── Simple thunks (no wishlistSlice.actions dependency) ─────────────────────

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.getWishlist();
      if (res?.success) {
        return res.data;
      }
      return rejectWithValue(res?.message || 'Failed to fetch wishlist');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist');
    }
  }
);

export const fetchWishlistCount = createAsyncThunk(
  'wishlist/fetchWishlistCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.getWishlistCount();
      if (res?.success) {
        return res.data;
      }
      return rejectWithValue(res?.message || 'Failed to fetch wishlist count');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist count');
    }
  }
);

export const clearWishlistApi = createAsyncThunk(
  'wishlist/clearWishlistApi',
  async (_, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.clearWishlist();
      if (res?.success) {
        toast.success(res.message || 'Wishlist cleared successfully');
        return res.data;
      }
      return rejectWithValue(res?.message || 'Failed to clear wishlist');
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
      return rejectWithValue(error.message || 'Failed to clear wishlist');
    }
  }
);

// ─── Slice (declared before thunks that reference wishlistSlice.actions) ─────

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addOptimistic: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            if (!state.items.includes(productId)) {
                state.items.push(productId);
                state.count += 1;
            }
        },
        revertAdd: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            const wasPresent = state.items.includes(productId);
            state.items = state.items.filter(id => id !== productId);
            if (wasPresent) {
                state.count = Math.max(0, state.count - 1);
            }
        },
        removeOptimistic: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            state.items = state.items.filter(id => id !== productId);
            state.hydratedItems = state.hydratedItems.filter(
                item => item.product?.id !== productId && item.product !== productId
            );
            // Always decrement: works whether items array is fully loaded or not
            state.count = Math.max(0, state.count - 1);
        },
        revertRemove: (state, action: PayloadAction<{ productId: string; item: any }>) => {
            const { productId, item } = action.payload;
            if (!state.items.includes(productId)) {
                state.items.push(productId);
                if (item) {
                    state.hydratedItems.push(item);
                }
                state.count += 1;
            }
        },
        toggleWishlist: (state, action: PayloadAction<string>) => {
            const productId = action.payload
            const index = state.items.indexOf(productId)
            if (index >= 0) {
                state.items.splice(index, 1)
                state.count = Math.max(0, state.count - 1);
            } else {
                state.items.push(productId)
                state.count += 1;
            }
        },
        removeFromWishlist: (state, action: PayloadAction<string>) => {
            const wasPresent = state.items.includes(action.payload);
            state.items = state.items.filter(id => id !== action.payload)
            state.hydratedItems = state.hydratedItems.filter(item => item.product?.id !== action.payload)
            if (wasPresent) {
                state.count = Math.max(0, state.count - 1);
            }
        },
        setWishlistItemStatus: (state, action: PayloadAction<{ productId: string; isSaved: boolean }>) => {
            const { productId, isSaved } = action.payload;
            if (isSaved) {
                if (!state.items.includes(productId)) {
                    state.items.push(productId);
                }
            } else {
                state.items = state.items.filter(id => id !== productId);
            }
        },
        clearWishlist: (state) => {
            state.items = []
            state.hydratedItems = []
            state.count = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.hydratedItems = action.payload?.items || [];
                state.items = (action.payload?.items || []).map((item: any) => item.product?.id).filter(Boolean);
                state.count = action.payload?.itemCount ?? state.items.length;
            })
            .addCase(fetchWishlist.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchWishlistCount.fulfilled, (state, action) => {
                state.count = action.payload?.count ?? 0;
            })
            .addCase(clearWishlistApi.fulfilled, (state) => {
                state.items = [];
                state.hydratedItems = [];
                state.count = 0;
            });
    }
})

// ─── Thunks that reference wishlistSlice.actions (MUST come after slice) ─────

export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async (productId: string, { dispatch, rejectWithValue }) => {
    dispatch(wishlistSlice.actions.addOptimistic(productId));
    try {
      const res = await wishlistApi.saveWishlistItem(productId);
      if (res?.success) {
        toast.success(res.message || 'Product saved to your wishlist');
        return res.data;
      }
      dispatch(wishlistSlice.actions.revertAdd(productId));
      return rejectWithValue(res?.message || 'Failed to save item');
    } catch (error: any) {
      dispatch(wishlistSlice.actions.revertAdd(productId));
      if (error.statusCode === 409) {
        dispatch(wishlistSlice.actions.addOptimistic(productId));
        toast.success('Already in your wishlist', { icon: 'ℹ️' });
        return { productId, isSaved: true };
      } else if (error.statusCode === 404) {
        toast.error('This product is no longer available.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      return rejectWithValue(error.message || 'Failed to save item');
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (productId: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as { wishlist: WishlistState };
    const itemToRevert = state.wishlist.hydratedItems.find(
      (item) => item.product?.id === productId || item.product === productId
    );

    dispatch(wishlistSlice.actions.removeOptimistic(productId));

    try {
      const res = await wishlistApi.removeWishlistItem(productId);
      if (res?.success) {
        toast.success(res.message || 'Product removed from your wishlist');
        return productId;
      }
      dispatch(wishlistSlice.actions.revertRemove({ productId, item: itemToRevert }));
      return rejectWithValue(res?.message || 'Failed to remove item');
    } catch (error: any) {
      dispatch(wishlistSlice.actions.revertRemove({ productId, item: itemToRevert }));
      if (error.statusCode === 404) {
        dispatch(wishlistSlice.actions.removeOptimistic(productId));
        return productId;
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      return rejectWithValue(error.message || 'Failed to remove item');
    }
  }
);

export const { toggleWishlist, removeFromWishlist, clearWishlist, setWishlistItemStatus } = wishlistSlice.actions
export default wishlistSlice.reducer
