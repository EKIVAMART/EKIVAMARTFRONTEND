'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Star,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  CheckSquare,
  Square,
  Bookmark,
  ArrowRight,
  Package,
  MapPin,
  FileText,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  Loader2,
  Check,
  Truck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchCart,
  fetchCartCount,
  fetchCartSummary,
  updateCartItemQuantityApi,
  removeCartItemApi,
  selectCartItemApi,
  selectAllCartItemsApi,
  saveCartItemForLaterApi,
  moveSavedCartItemToCartApi,
  clearCartApi,
} from '@/lib/features/cart/cartSlice';
import {
  cartApi,
  orderApi,
  ordersApi,
  userAddressApi,
  taxRulesApi,
  deliveryRoutesApi,
  SavedAddressItem,
  AvailableState,
  OrderQuote,
  ExpectedDelivery,
} from '@/lib/api';
import { deliveryCopy, daysUntil, formatNaira } from '@/lib/utils/delivery';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redux state
  const activeItems = useAppSelector((state) => state.cart.activeItems);
  const savedItems = useAppSelector((state) => state.cart.savedItems);
  const activeCount = useAppSelector((state) => state.cart.activeCount);
  const savedCount = useAppSelector((state) => state.cart.savedCount);
  const summary = useAppSelector((state) => state.cart.summary);
  const loading = useAppSelector((state) => state.cart.loading);

  // Local state
  const [activeTab, setActiveTab] = useState<'active' | 'saved'>('active');
  const [mounted, setMounted] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [showClearSelectedModal, setShowClearSelectedModal] = useState(false);

  // Deliverable states from GET /api/v1/delivery-routes/available
  const [availableStates, setAvailableStates] = useState<AvailableState[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean>(false);
  const [cartSelectedState, setCartSelectedState] = useState<string>('');
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState<boolean>(false);

  // Checkout flow state & Live Quote
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'kora_pay' | 'mock'>('kora_pay');
  const [quoteData, setQuoteData] = useState<OrderQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Saved Addresses & Regional Tax state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [useSavedAddress, setUseSavedAddress] = useState<boolean>(true);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState<boolean>(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  // Tracks whether addresses have been fetched at least once (avoids double-fetch on mount)
  const addressesFetchedRef = useRef<boolean>(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    phoneNumber: '',
  });
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Order success modal state with recalculated delivery date
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [placedOrderExpectedDelivery, setPlacedOrderExpectedDelivery] = useState<ExpectedDelivery | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadSavedAddresses = async (silent = false) => {
    if (!silent) setLoadingAddresses(true);
    try {
      const res = await userAddressApi.list();
      if (res?.success) {
        let list: SavedAddressItem[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).items)) {
          list = (res.data as any).items;
        } else if (res.data && Array.isArray((res.data as any).data)) {
          list = (res.data as any).data;
        } else if (Array.isArray((res as any).items)) {
          list = (res as any).items;
        }

        setSavedAddresses(list);
        addressesFetchedRef.current = true;
        if (list.length > 0) {
          // Preserve currently selected address if still valid, else pick default
          const stillValid = list.find((a) => a.id === selectedSavedAddressId);
          const defaultAddr = stillValid || list.find((a) => a.isDefault) || list[0];
          setSelectedSavedAddressId(defaultAddr.id);
          setUseSavedAddress(true);
          // Recalculate regional tax for selected saved address
          dispatch(fetchCartSummary({ country: defaultAddr.country || 'NG', state: defaultAddr.state }));
        } else {
          setUseSavedAddress(false);
          setSelectedSavedAddressId(null);
        }
      }
    } catch (err) {
      console.error('Failed to load saved addresses', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch deliverable states and cart details on mount / auth state change
  useEffect(() => {
    let isSubscribed = true;
    const loadAvailableStates = async () => {
      setLoadingStates(true);
      try {
        const res = await deliveryRoutesApi.getAvailableStates();
        if (isSubscribed && res?.success && Array.isArray(res.data)) {
          setAvailableStates(res.data);
        }
      } catch (err) {
        console.error('Failed to load deliverable states', err);
      } finally {
        if (isSubscribed) setLoadingStates(false);
      }
    };

    loadAvailableStates();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Fetch cart details on mount / auth state change
  useEffect(() => {
    if (mounted && isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchCartSummary());
      void loadSavedAddresses(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated, dispatch]);

  // Live order quote fetcher
  const fetchOrderQuote = async () => {
    const selected = activeItems.filter((item) => item.isSelected);
    if (selected.length === 0) {
      setQuoteData(null);
      return;
    }

    let destState = '';
    let savedAddrId: string | undefined;
    let customAddr: any;

    if (useSavedAddress && selectedSavedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedSavedAddressId);
      if (addr) {
        destState = addr.state || '';
        savedAddrId = addr.id;
      }
    } else if (shippingAddress.state) {
      destState = shippingAddress.state;
      customAddr = {
        fullName: shippingAddress.fullName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Nigeria',
        phoneNumber: shippingAddress.phoneNumber,
      };
    }

    if (!destState) {
      setQuoteData(null);
      return;
    }

    setLoadingQuote(true);
    setQuoteError(null);

    try {
      const res = await ordersApi.getQuote({
        items: selected.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: savedAddrId ? undefined : customAddr,
        savedAddressId: savedAddrId,
      });

      if (res?.success && res.data) {
        setQuoteData(res.data);
        setQuoteError(null);
      } else {
        const errorMsg = res?.message || 'Failed to calculate quote for selected delivery state';
        setQuoteError(errorMsg);
      }
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message || err?.message || 'Delivery route is not configured for this state';
      setQuoteError(backendMsg);
    } finally {
      setLoadingQuote(false);
    }
  };

  // Re-quote whenever checkout is active and address or items change
  useEffect(() => {
    if (isCheckingOut) {
      const timer = setTimeout(() => {
        void fetchOrderQuote();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isCheckingOut,
    useSavedAddress,
    selectedSavedAddressId,
    shippingAddress.state,
    activeItems,
  ]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
          <ShoppingBag size={30} className="text-[#9d4ae3]" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Your Cart</h2>
        <p className="text-gray-500 max-w-sm mb-6">
          Please log in to manage your cart, save items for later, and proceed to checkout.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white px-6 py-2.5 rounded-xl font-bold hover:from-[#8236be] hover:to-[#692a99] transition shadow-md"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Count helper functions
  const selectedCount = activeItems.filter((item) => item.isSelected).length;

  // Handler functions
  const handleQuantityChange = (productId: string, currentQty: number, delta: number, stock: number) => {
    const nextQty = currentQty + delta;
    if (nextQty < 1) return;
    if (nextQty > stock) {
      toast.error(`Cannot exceed available stock of ${stock} units`, { id: 'stock-limit' });
      return;
    }
    toast.promise(
      dispatch(updateCartItemQuantityApi({ productId, quantity: nextQty })).unwrap(),
      {
        loading: 'Updating quantity...',
        success: 'Quantity updated',
        error: 'Failed to update quantity',
      },
      { id: 'qty-toast' }
    );
  };

  const handleToggleSelect = (productId: string, currentSelected: boolean) => {
    toast.promise(
      dispatch(selectCartItemApi({ productId, isSelected: !currentSelected })).unwrap(),
      {
        loading: 'Updating selection...',
        success: 'Selection updated',
        error: 'Failed to update selection',
      },
      { id: 'select-toast' }
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = activeItems.every((item) => item.isSelected);
    toast.promise(
      dispatch(selectAllCartItemsApi(!allSelected)).unwrap(),
      {
        loading: 'Updating selection...',
        success: allSelected ? 'All unselected' : 'All selected',
        error: 'Failed to update selection',
      },
      { id: 'select-all-toast' }
    );
  };

  const handleSaveForLater = (productId: string) => {
    toast.promise(
      dispatch(saveCartItemForLaterApi(productId)).unwrap(),
      {
        loading: 'Saving for later...',
        success: 'Moved to Saved for Later',
        error: 'Failed to save for later',
      },
      { id: 'save-toast' }
    );
  };

  const handleMoveToCart = (productId: string) => {
    toast.promise(
      dispatch(moveSavedCartItemToCartApi(productId)).unwrap(),
      {
        loading: 'Moving to active cart...',
        success: 'Moved to Active Cart',
        error: 'Failed to move to active cart',
      },
      { id: 'move-toast' }
    );
  };

  const handleDeleteItem = (productId: string) => {
    dispatch(removeCartItemApi(productId));
  };

  const handleClearAll = () => {
    toast.promise(
      dispatch(clearCartApi(true)).unwrap(),
      {
        loading: 'Clearing cart...',
        success: 'Cart cleared successfully',
        error: 'Failed to clear cart',
      }
    );
    setShowClearAllModal(false);
  };

  const handleClearSelected = async () => {
    const selectedItems = activeItems.filter((item) => item.isSelected);
    if (selectedItems.length === 0) return;

    setShowClearSelectedModal(false);
    setIsProcessing(true);
    const deleteToast = toast.loading(`Removing ${selectedItems.length} selected items...`);

    try {
      await Promise.all(
        selectedItems.map((item) => dispatch(removeCartItemApi(item.productId)).unwrap())
      );
      toast.success('Selected items removed successfully', { id: deleteToast });
      dispatch(fetchCart());
      dispatch(fetchCartSummary());
    } catch (err: any) {
      toast.error('Failed to remove some selected items', { id: deleteToast });
      dispatch(fetchCart());
      dispatch(fetchCartSummary());
    } finally {
      setIsProcessing(false);
    }
  };

  // Checkout flow logic
  const handleProceedToCheckout = async () => {
    if (selectedCount === 0) {
      toast.error('Please select at least one item to checkout.');
      return;
    }

    setIsProcessing(true);
    const validateToast = toast.loading('Verifying items and stock...');

    try {
      const res = await cartApi.validateCart();

      if (!res?.success || !res.data?.isValid) {
        setIsProcessing(false);
        const errorMsg = res?.message || 'Some items have insufficient stock.';
        toast.error(errorMsg, { id: validateToast });
        if (res?.data?.errors && res.data.errors.length > 0) {
          res.data.errors.forEach((err: any) => {
            toast.error(`${err.productName}: Only ${err.availableStock} available (requested ${err.requestedQuantity})`, { duration: 5000 });
          });
        }
        return;
      }

      toast.loading('Fetching applicable tax rate...', { id: validateToast });

      // Determine country/state from the selected saved address or default
      let taxCountry = 'NG';
      let taxState: string | undefined;
      if (useSavedAddress && selectedSavedAddressId) {
        const sel = savedAddresses.find((a) => a.id === selectedSavedAddressId);
        if (sel) {
          taxCountry = sel.country || 'NG';
          taxState = sel.state || undefined;
        }
      } else if (!useSavedAddress && shippingAddress.state) {
        taxCountry = shippingAddress.country || 'NG';
        taxState = shippingAddress.state || undefined;
      }

      // Explicitly query the official tax rate from the backend (GET /tax-rules/applicable)
      // No client-supplied tax is ever accepted — this always reflects what Super Admins configured.
      const cartSubtotal = summary?.subtotal;
      const taxRes = await taxRulesApi.getApplicable({
        country: taxCountry,
        state: taxState,
        subtotal: cartSubtotal,
      });

      // Re-fetch cart summary with the resolved region to reflect correct tax in the UI
      dispatch(fetchCartSummary({ country: taxCountry, state: taxState }));

      if (taxRes?.data) {
        const source = taxRes.data.source ?? 'unknown';
        const rate = taxRes.data.formattedRate ?? `${taxRes.data.percentage ?? 7.5}%`;
        const sourceLabel = source === 'state_rule' ? 'state rule' : source === 'country_default' ? 'country default' : 'platform default';
        toast.success(`Tax verified: ${rate} (${sourceLabel})`, { id: validateToast });
      } else {
        toast.success('Stock verified successfully!', { id: validateToast });
      }

      setIsProcessing(false);
      // Always re-fetch saved addresses fresh when entering checkout
      void loadSavedAddresses(false);
      setIsCheckingOut(true);
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err?.message || 'Cart validation failed. Please try again.', { id: validateToast });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      toast.error('Please select a payment method.');
      return;
    }

    let checkoutPayload: any;

    if (useSavedAddress && selectedSavedAddressId) {
      // Option 2: Use saved address ID — preferred path when a saved address is selected
      checkoutPayload = {
        savedAddressId: selectedSavedAddressId,
        notes: checkoutNotes,
      };
    } else if (useSavedAddress && !selectedSavedAddressId) {
      // User selected "use saved address" but none is actually selected
      toast.error('Please select a saved address or switch to entering a new address.');
      return;
    } else {
      // Option 1: Custom shipping address
      if (
        !shippingAddress.fullName ||
        !shippingAddress.addressLine1 ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.postalCode ||
        !shippingAddress.phoneNumber
      ) {
        toast.error('Please fill in all required shipping address fields.');
        return;
      }

      if (saveAddressToProfile) {
        try {
          await userAddressApi.create(shippingAddress);
        } catch (err) {
          console.error('Failed to save address to profile:', err);
        }
      }

      checkoutPayload = {
        shippingAddress,
        notes: checkoutNotes,
      };
    }

    setIsProcessing(true);
    const checkoutToast = toast.loading('Creating order & connecting to payment gateway...');

    try {
      const res = await cartApi.checkout(checkoutPayload);

      if (!res?.success || !res?.data) {
        setIsProcessing(false);
        toast.error(res?.message || 'Checkout failed. Please try again.', { id: checkoutToast });
        return;
      }

      const createdOrder = res.data;
      const orderId = createdOrder.id || createdOrder.orderId || createdOrder.order?.id;
      const orderNo = createdOrder.orderNumber || createdOrder.orderId || 'N/A';
      const orderExpDelivery =
        createdOrder.expectedDelivery ||
        createdOrder.order?.expectedDelivery ||
        quoteData?.expectedDelivery ||
        null;

      if (orderExpDelivery) {
        setPlacedOrderExpectedDelivery(orderExpDelivery);
      }

      if (!orderId) {
        setIsProcessing(false);
        toast.error('Order placed, but failed to retrieve order identifier for payment.', { id: checkoutToast });
        return;
      }

      // Initialize payment collection with chosen gateway (paystack, flutterwave, or mock)
      toast.loading('Redirecting to secure payment...', { id: checkoutToast });
      const paymentRes = await orderApi.processPayment(orderId, paymentMethod);

      setIsProcessing(false);

      if (paymentRes?.success && paymentRes.data) {
        const paymentData = paymentRes.data;
        const checkoutUrl =
          paymentData.payment?.paymentUrl ||
          paymentData.checkoutUrl ||
          (paymentData as any).paymentUrl;

        dispatch(fetchCart());
        dispatch(fetchCartCount());
        dispatch(fetchCartSummary());

        if (checkoutUrl) {
          toast.success('Redirecting to payment gateway...', { id: checkoutToast });
          window.location.href = checkoutUrl;
          return;
        }

        // Direct success without redirect URL
        toast.success('Order placed successfully!', { id: checkoutToast });
        setPlacedOrderNumber(orderNo);
        setIsCheckingOut(false);
        setShowOrderSuccessModal(true);
      } else {
        toast.error(paymentRes?.message || 'Payment initialization failed. Please try again.', { id: checkoutToast });
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err?.message || 'Failed to place order and process payment.', { id: checkoutToast });
    }
  };

  const getProductImage = (product: any) => {
    if (!product || !product.imageUrl) return '/placeholder.png';
    return product.imageUrl;
  };

  const activeItemsIsEmpty = activeItems.length === 0;
  const savedItemsIsEmpty = savedItems.length === 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. BREADCRUMBS */}
      <div className="border-b py-4 bg-white shadow-xs">
        <div className="mx-auto w-[95%] flex items-center gap-2 text-sm">
          <Link href="/" className="text-[#9d4ae3] font-semibold hover:underline">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600 font-medium">Your Cart</span>
        </div>
      </div>

      <main className="mx-auto w-[95%] mt-10">
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Shopping Cart</h1>
            <p className="text-gray-500 font-medium mt-1">
              Manage your selected items, save for later, and checkout securely.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/orders"
              className="px-4 py-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold rounded-xl transition text-sm flex items-center gap-2 shadow-sm"
            >
              <Package size={16} />
              View Orders
            </Link>

            {selectedCount > 1 && activeTab === 'active' && (
              <button
                onClick={() => setShowClearSelectedModal(true)}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition text-sm flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear Selected ({selectedCount})
              </button>
            )}

            {(!activeItemsIsEmpty || !savedItemsIsEmpty) && (
              <button
                onClick={() => setShowClearAllModal(true)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-bold rounded-xl transition text-sm flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All Cart
              </button>
            )}
          </div>
        </section>

        {/* 2. SECTION TABS */}
        <div className="flex border-b border-gray-200 mb-8 w-full bg-white rounded-t-2xl p-2 shadow-xs gap-2">
          <button
            onClick={() => {
              setActiveTab('active');
              setIsCheckingOut(false);
            }}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white shadow-md'
                : 'text-gray-500 hover:text-slate-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Active Items</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'active' ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white shadow-md'
                : 'text-gray-500 hover:text-slate-700 hover:bg-gray-50'
            }`}
          >
            <Bookmark size={18} />
            <span>Saved For Later</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'saved' ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {savedCount}
            </span>
          </button>
        </div>

        {/* 3. ACTIVE ITEMS VIEW */}
        {activeTab === 'active' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Items List */}
            <div className="flex-[2] w-full">
              {activeItemsIsEmpty ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100">
                  <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">Your active cart is empty</h3>
                  <p className="text-gray-400 text-sm mt-1 mb-6">Explore our special catalog and add products.</p>
                  <Link
                    href="/"
                    className="inline-flex bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition"
                  >
                    Go Shop
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xs overflow-hidden border border-gray-100">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-[auto_3fr_1.2fr_1.5fr_1fr_auto] items-center bg-gray-50 px-6 py-4 border-b border-gray-100 text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                    {/* Check All */}
                    <button onClick={handleToggleSelectAll} className="mr-3 text-purple-600 hover:scale-105 transition-transform" aria-label="Toggle select all">
                      {activeItems.every((item) => item.isSelected) ? (
                        <CheckSquare size={20} className="fill-purple-100" />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                    <div>Product</div>
                    <div className="text-center">Price</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-center">Subtotal</div>
                    <div className="text-right">Remove</div>
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-gray-100">
                    <AnimatePresence initial={false}>
                      {activeItems.map((item) => {
                        const product = item.product;
                        if (!product) return null;
                        const priceVal = product.price;

                        return (
                          <motion.div
                            key={item.productId}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className="grid grid-cols-1 md:grid-cols-[auto_3fr_1.2fr_1.5fr_1fr_auto] items-center p-5 md:p-6 gap-4 md:gap-0 hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Checkbox */}
                            <div className="flex md:block items-center justify-between border-b md:border-b-0 pb-3 md:pb-0">
                              <span className="md:hidden text-xs font-bold text-gray-400">Select Item</span>
                              <button
                                onClick={() => handleToggleSelect(item.productId, item.isSelected)}
                                className="text-purple-600 hover:scale-105 transition-transform"
                              >
                                {item.isSelected ? (
                                  <CheckSquare size={22} className="fill-purple-100" />
                                ) : (
                                  <Square size={22} />
                                )}
                              </button>
                            </div>

                            {/* Product Info */}
                            <div className="flex items-center gap-4">
                              <Link href={`/products/${item.productId}`} className="relative w-20 h-20 border border-gray-100 rounded-2xl overflow-hidden bg-white p-2 hover:opacity-90 transition-opacity flex-shrink-0">
                                <Image
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  fill
                                  sizes="80px"
                                  className="object-contain p-1"
                                />
                              </Link>
                              <div className="min-w-0 flex-1">
                                <Link href={`/products/${item.productId}`}>
                                  <h4 className="text-sm md:text-base font-bold text-slate-800 hover:text-[#9d4ae3] cursor-pointer whitespace-normal break-words leading-tight">
                                    {product.name}
                                  </h4>
                                </Link>
                                {item.notes && (
                                  <div className="mt-1 bg-purple-50 text-[#9d4ae3] text-xs px-2.5 py-1 rounded-lg border border-purple-100 inline-flex items-center gap-1">
                                    <FileText size={12} />
                                    <span className="font-semibold italic">Note: {item.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex md:block justify-between items-center text-center">
                              <span className="md:hidden text-xs font-bold text-gray-400">Price</span>
                              <span className="font-bold text-slate-700">
                                ₦{priceVal.toLocaleString()}
                              </span>
                            </div>

                            {/* Quantity */}
                            <div className="flex md:flex-col justify-between items-center gap-1.5">
                              <span className="md:hidden text-xs font-bold text-gray-400">Quantity</span>
                              <div className="flex flex-col items-center">
                                <div className="flex items-center border border-gray-200 rounded-xl px-2 py-1 bg-white shadow-inner">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(item.productId, item.quantity, -1, product.stock)
                                    }
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="px-3.5 font-bold text-sm text-slate-800">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(item.productId, item.quantity, 1, product.stock)
                                    }
                                    className="p-1 text-gray-400 hover:text-[#9d4ae3] transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 font-bold">
                                  Stock: {product.stock}
                                </span>
                              </div>
                            </div>

                            {/* Subtotal */}
                            <div className="flex md:block justify-between items-center text-center">
                              <span className="md:hidden text-xs font-bold text-gray-400">Subtotal</span>
                              <span className="font-extrabold text-[#9d4ae3]">
                                ₦{(priceVal * item.quantity).toLocaleString()}
                              </span>
                            </div>

                            {/* Action Buttons (Save/Delete) */}
                            <div className="flex justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                              <button
                                onClick={() => handleSaveForLater(item.productId)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition"
                                title="Save for Later"
                              >
                                <Bookmark size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.productId)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                title="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Summary & Checkout Forms */}
            <div className="flex-1 w-full lg:sticky lg:top-24">
              {!isCheckingOut ? (
                // 1. ORDER SUMMARY CARD
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
                  <h3 className="text-xl font-bold text-slate-800 border-b pb-4 mb-5">Order Summary</h3>

                  {/* Destination State Picker */}
                  <div className="mb-5 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#9d4ae3]" />
                        Delivery State *
                      </span>
                      {loadingStates && <Loader2 size={12} className="animate-spin text-purple-600" />}
                    </label>
                    <select
                      value={cartSelectedState || summary?.deliveryState || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCartSelectedState(val);
                        if (val) {
                          dispatch(fetchCartSummary({ state: val }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-purple-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 bg-white text-slate-800 transition shadow-xs"
                    >
                      <option value="">Select your delivery state</option>
                      {availableStates.map((s) => (
                        <option key={s.state} value={s.state}>
                          {s.state}
                        </option>
                      ))}
                    </select>

                    {/* Delivery Route Error Banner */}
                    {summary?.deliveryError && (
                      <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{summary.deliveryError}</p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Some items in your cart cannot be delivered to this state. Please select a different state or adjust items.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {summary ? (
                    <div className="space-y-3.5">
                      <div className="flex justify-between text-gray-600 text-sm font-medium">
                        <span>Subtotal</span>
                        <span className="font-bold text-slate-800">
                          ₦{summary.subtotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Dynamic Delivery Row */}
                      <div className="flex justify-between text-gray-600 text-sm font-medium items-center">
                        <span className="flex items-center gap-1.5">
                          <Truck size={15} className="text-[#9d4ae3]" />
                          Delivery
                        </span>
                        <span className="font-bold text-slate-800">
                          {summary.deliveryFeeCalculated ? (
                            `₦${(summary.deliveryFee ?? summary.shipping).toLocaleString()}`
                          ) : (
                            <span className="text-purple-600 text-xs font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              Select your state
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Expandable Breakdown Accordion */}
                      {summary.deliveryFeeCalculated && summary.deliveryBreakdown && (
                        <div className="border border-purple-100 bg-purple-50/40 rounded-xl overflow-hidden text-xs transition">
                          <button
                            type="button"
                            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                            className="w-full px-3 py-2 flex items-center justify-between text-purple-800 font-bold hover:bg-purple-100/60 transition text-left"
                          >
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <Info size={13} className="text-purple-600" />
                              How is this calculated?
                            </span>
                            {isBreakdownExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          {isBreakdownExpanded && (
                            <div className="px-3 pb-3 pt-1 space-y-1.5 text-slate-600 border-t border-purple-100 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Destination:</span>
                                <span className="font-bold text-slate-800">{summary.deliveryBreakdown.customerState}</span>
                              </div>
                              {summary.deliveryBreakdown.originStates?.length > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Ships from:</span>
                                  <span className="font-semibold text-slate-700">
                                    {summary.deliveryBreakdown.originStates.join(', ')}
                                  </span>
                                </div>
                              )}
                              {summary.deliveryBreakdown.primaryOrigin && (
                                <div className="bg-white/80 p-2 rounded-lg border border-purple-100/70 space-y-0.5">
                                  <div className="font-bold text-purple-900 flex justify-between">
                                    <span>Primary leg: {summary.deliveryBreakdown.primaryOrigin.state}</span>
                                    <span>₦{summary.deliveryBreakdown.primaryOrigin.fee.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-gray-500">
                                    <span>Route fee: ₦{summary.deliveryBreakdown.primaryOrigin.routeFee.toLocaleString()}</span>
                                    <span>Qty charge: ₦{summary.deliveryBreakdown.primaryOrigin.quantityCharge.toLocaleString()}</span>
                                  </div>
                                </div>
                              )}
                              {summary.deliveryBreakdown.secondaryOrigins?.map((sec, idx) => (
                                <div key={idx} className="bg-white/80 p-2 rounded-lg border border-purple-100/70 flex justify-between text-[10px]">
                                  <span className="font-medium text-slate-700">
                                    Additional pickup: {sec.state} ({sec.quantity} items)
                                  </span>
                                  <span className="font-bold text-slate-800">₦{sec.fee.toLocaleString()}</span>
                                </div>
                              ))}
                              {summary.deliveryBreakdown.baseLastMileFee > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Within-state fee:</span>
                                  <span className="font-semibold text-slate-800">
                                    ₦{summary.deliveryBreakdown.baseLastMileFee.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {summary.deliveryBreakdown.localQuantity > 0 && (
                                <p className="text-[10px] text-gray-500 italic">
                                  {summary.deliveryBreakdown.localQuantity} local items added no extra fee.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tax line */}
                      <div className="flex justify-between text-gray-600 text-sm font-medium">
                        <span>
                          Tax {summary?.formattedRate ? `(${summary.formattedRate})` : (summary?.taxPercentage !== undefined ? `(${summary.taxPercentage}%)` : '(7.5%)')}
                        </span>
                        <span className="font-bold text-slate-800">
                          ₦{summary.tax.toLocaleString()}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="border-t border-dashed pt-3.5 flex justify-between items-center">
                        <span className="font-bold text-slate-800">Total Amount</span>
                        <span className="text-2xl font-extrabold text-[#9d4ae3]">
                          ₦{summary.total.toLocaleString()}
                        </span>
                      </div>

                      {/* Expected Delivery Estimate Callout */}
                      {summary.expectedDelivery && (
                        <div className="mt-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-3 flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#9d4ae3] flex items-center justify-center shrink-0">
                            <Truck size={16} />
                          </div>
                          <div className="flex-1 text-xs">
                            <p className="font-bold text-purple-950">
                              {deliveryCopy(summary.expectedDelivery, 'quote')}
                            </p>
                            <p className="text-[11px] text-purple-700 mt-0.5">
                              Within {summary.expectedDelivery.maxWorkingDays} working days of processing.
                              {summary.expectedDelivery.isInterState && (
                                <span className="ml-1.5 inline-block px-1.5 py-0.2 bg-purple-200 text-purple-900 font-bold rounded text-[10px]">
                                  Inter-state
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 italic">
                              💡 Order before 3:00 PM on a working day for fastest dispatch.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-400 italic">
                      Select items to calculate checkout totals.
                    </div>
                  )}

                  <button
                    onClick={handleProceedToCheckout}
                    disabled={selectedCount === 0 || isProcessing || Boolean(summary?.deliveryError)}
                    className="w-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white font-bold py-4 rounded-xl mt-6 hover:from-[#8236be] hover:to-[#692a99] transition shadow-lg shadow-purple-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed group active:scale-95"
                  >
                    <span>Proceed To Checkout</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-4 font-medium">
                    Secure SSL Checkout • Stock verified dynamically
                  </p>
                </div>
              ) : (
                // 2. SHIPPING ADDRESS & CHECKOUT FORM
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100"
                >
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Shipping & Payment</h3>
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="text-xs font-bold text-[#9d4ae3] hover:underline"
                    >
                      Back to Cart
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    {/* ── Address Section ── */}
                    {loadingAddresses ? (
                      /* Loading spinner while fetching saved addresses */
                      <div className="mb-4 bg-purple-50/40 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
                        <Loader2 size={18} className="animate-spin text-purple-500 shrink-0" />
                        <span className="text-xs text-purple-700 font-semibold">Fetching your saved addresses…</span>
                      </div>
                    ) : (
                      <>
                        {/* Saved Address / New Address Toggle — only shown when addresses exist */}
                        {savedAddresses.length > 0 && (
                          <div className="mb-4 bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                <MapPin size={14} className="text-purple-600" /> Choose Shipping Destination
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setUseSavedAddress(true);
                                  const sel = savedAddresses.find((a) => a.id === selectedSavedAddressId) || savedAddresses[0];
                                  setSelectedSavedAddressId(sel.id);
                                  dispatch(fetchCartSummary({ country: sel.country || 'NG', state: sel.state }));
                                }}
                                className={`py-2 px-3 text-xs font-bold rounded-xl transition border text-center flex items-center justify-center gap-1.5 ${
                                  useSavedAddress
                                    ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white border-transparent shadow-xs'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {useSavedAddress && <Check size={12} />}
                                Saved Address ({savedAddresses.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setUseSavedAddress(false)}
                                className={`py-2 px-3 text-xs font-bold rounded-xl transition border text-center ${
                                  !useSavedAddress
                                    ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white border-transparent shadow-xs'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                + Enter New Address
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Saved Addresses Cards List — address fields hidden when a saved address is selected */}
                        {useSavedAddress && savedAddresses.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            <label className="text-xs font-bold text-slate-600 block mb-1">Select Saved Address *</label>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {savedAddresses.map((addr) => {
                                const isSelected = selectedSavedAddressId === addr.id;
                                const name = addr.fullName || (addr as any).name || 'Address';
                                const line1 = addr.addressLine1 || (addr as any).street || (addr as any).address || [addr.city, addr.state].filter(Boolean).join(', ');
                                const phone = addr.phoneNumber || (addr as any).phone || (addr as any).phoneNumber;
                                return (
                                  <div
                                    key={addr.id}
                                    onClick={() => {
                                      setSelectedSavedAddressId(addr.id);
                                      dispatch(fetchCartSummary({ country: addr.country || 'NG', state: addr.state }));
                                    }}
                                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-[#9d4ae3] bg-purple-50/80 ring-1 ring-[#9d4ae3]/30 shadow-xs'
                                        : 'border-gray-200 hover:border-gray-300 bg-slate-50/40'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-xs text-slate-800">{name}</span>
                                          {addr.isDefault && (
                                            <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-bold">Default</span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-gray-600 mt-0.5 break-words font-medium">
                                          {line1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                          {addr.city}{addr.city && addr.state ? ', ' : ''}{addr.state}
                                          {addr.country ? ` • ${addr.country}` : ''}
                                          {phone ? ` • ${phone}` : ''}
                                        </p>
                                      </div>
                                      <div className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                        isSelected ? 'border-[#9d4ae3] bg-[#9d4ae3]' : 'border-gray-300 bg-white'
                                      }`}>
                                        {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          /* Custom Address Form — shown when no saved addresses, or user chose "Enter New Address" */
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-bold text-slate-600 block mb-1">Full Name *</label>
                              <input
                                type="text"
                                required
                                value={shippingAddress.fullName}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                placeholder="Jane Doe"
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number *</label>
                              <input
                                type="tel"
                                required
                                value={shippingAddress.phoneNumber}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, phoneNumber: e.target.value })}
                                placeholder="+2348012345678"
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600 block mb-1">Address Line 1 *</label>
                              <input
                                type="text"
                                required
                                value={shippingAddress.addressLine1}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                                placeholder="123 Flower Street"
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600 block mb-1">Address Line 2 (Optional)</label>
                              <input
                                type="text"
                                value={shippingAddress.addressLine2}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                                placeholder="Apartment 4B"
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">City *</label>
                                <input
                                  type="text"
                                  required
                                  value={shippingAddress.city}
                                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                  placeholder="Lekki"
                                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">State *</label>
                                <select
                                  required
                                  value={shippingAddress.state}
                                  onChange={(e) => {
                                    const newState = e.target.value;
                                    setShippingAddress({ ...shippingAddress, state: newState });
                                    if (newState) {
                                      dispatch(fetchCartSummary({ country: shippingAddress.country, state: newState }));
                                    }
                                  }}
                                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50 text-slate-800"
                                >
                                  <option value="">Select State</option>
                                  {availableStates.map((s) => (
                                    <option key={s.state} value={s.state}>
                                      {s.state}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Postal Code *</label>
                                <input
                                  type="text"
                                  required
                                  value={shippingAddress.postalCode}
                                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                  placeholder="105102"
                                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Country *</label>
                                <input
                                  type="text"
                                  required
                                  value={shippingAddress.country}
                                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Checkbox: Save Address to Profile */}
                            <label className="flex items-center gap-2 pt-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={saveAddressToProfile}
                                onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                                className="w-4 h-4 text-[#9d4ae3] rounded border-gray-300 focus:ring-[#9d4ae3]"
                              />
                              <span className="text-xs text-gray-700 font-medium">Save this address to my profile for future checkouts</span>
                            </label>
                          </div>
                        )}
                      </>
                    )}

                    {/* Order Notes Field */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-600 block mb-1">Order Notes (Optional)</label>
                      <input
                        type="text"
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder="e.g. Leave with reception or call upon arrival"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                      />
                    </div>

                    {/* Payment Method Selector */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
                        <span>Payment Method *</span>
                        <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-1">
                          <ShieldCheck size={12} /> Secure 256-bit SSL
                        </span>
                      </label>
                      <div className="space-y-2">
                        <label
                          onClick={() => setPaymentMethod('paystack')}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === 'paystack'
                              ? 'border-[#9d4ae3] bg-purple-50/70 shadow-xs ring-1 ring-[#9d4ae3]/30'
                              : 'border-gray-200 hover:border-gray-300 bg-slate-50/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="paystack"
                              checked={paymentMethod === 'paystack'}
                              onChange={() => setPaymentMethod('paystack')}
                              className="text-[#9d4ae3] focus:ring-[#9d4ae3]"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span>Paystack</span>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-bold">Recommended</span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium">Card, Bank Transfer, USSD, Apple Pay</p>
                            </div>
                          </div>
                          <CreditCard size={18} className="text-[#9d4ae3] shrink-0" />
                        </label>

                        <label
                          onClick={() => setPaymentMethod('flutterwave')}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === 'flutterwave'
                              ? 'border-[#9d4ae3] bg-purple-50/70 shadow-xs ring-1 ring-[#9d4ae3]/30'
                              : 'border-gray-200 hover:border-gray-300 bg-slate-50/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="flutterwave"
                              checked={paymentMethod === 'flutterwave'}
                              onChange={() => setPaymentMethod('flutterwave')}
                              className="text-[#9d4ae3] focus:ring-[#9d4ae3]"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800">Flutterwave</div>
                              <p className="text-[11px] text-gray-500 font-medium">Cards, Mobile Money, Bank Account</p>
                            </div>
                          </div>
                          <CreditCard size={18} className="text-amber-500 shrink-0" />
                        </label>

                        <label
                          onClick={() => setPaymentMethod('kora_pay')}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === 'kora_pay'
                              ? 'border-[#9d4ae3] bg-purple-50/70 shadow-xs ring-1 ring-[#9d4ae3]/30'
                              : 'border-gray-200 hover:border-gray-300 bg-slate-50/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="kora_pay"
                              checked={paymentMethod === 'kora_pay'}
                              onChange={() => setPaymentMethod('kora_pay')}
                              className="text-[#9d4ae3] focus:ring-[#9d4ae3]"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800">Korapay</div>
                              <p className="text-[11px] text-gray-500 font-medium">Cards, Bank Transfer, Virtual Accounts, Mobile Money</p>
                            </div>
                          </div>
                          <CreditCard size={18} className="text-emerald-500 shrink-0" />
                        </label>

                        <label
                          onClick={() => setPaymentMethod('mock')}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === 'mock'
                              ? 'border-[#9d4ae3] bg-purple-50/70 shadow-xs ring-1 ring-[#9d4ae3]/30'
                              : 'border-gray-200 hover:border-gray-300 bg-slate-50/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="mock"
                              checked={paymentMethod === 'mock'}
                              onChange={() => setPaymentMethod('mock')}
                              className="text-[#9d4ae3] focus:ring-[#9d4ae3]"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span>Mock Payment Gateway</span>
                                <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.2 rounded font-bold">Test/Dev</span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium">Sandbox simulator for test orders</p>
                            </div>
                          </div>
                          <ShieldCheck size={18} className="text-blue-500 shrink-0" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Order Notes (Optional)</label>
                      <input
                        type="text"
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder="Leave at reception"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 transition-all bg-slate-50/50"
                      />
                    </div>

                    {/* Quote Loading Indicator */}
                    {loadingQuote && (
                      <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center gap-2 text-xs text-purple-700 font-semibold">
                        <Loader2 size={14} className="animate-spin text-purple-600" />
                        Calculating live delivery fee & taxes...
                      </div>
                    )}

                    {/* Route or Quote Error Alert */}
                    {quoteError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
                        <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Delivery Unavailable</p>
                          <p className="mt-0.5 leading-relaxed">{quoteError}</p>
                          <p className="text-[11px] text-red-600 mt-1 font-semibold">
                            Please choose a different delivery address or adjust items in your cart.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Expected Delivery Promise Box */}
                    {quoteData?.expectedDelivery && !quoteError && (
                      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Truck size={20} />
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-purple-950 text-sm">
                              {deliveryCopy(quoteData.expectedDelivery, 'quote')}
                            </span>
                            {quoteData.expectedDelivery.isInterState && (
                              <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded-full font-bold text-[10px]">
                                Inter-state
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-medium mt-1">
                            Within {quoteData.expectedDelivery.maxWorkingDays} working days of payment confirmation.
                          </p>
                          <p className="text-[11px] text-[#9d4ae3] mt-1 font-semibold">
                            💡 Order before 3:00 PM on a working day for the fastest delivery.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Quote Review Totals */}
                    <div className="border-t pt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Items Subtotal:</span>
                        <span className="font-bold text-slate-800">
                          ₦{(quoteData?.subtotal ?? summary?.subtotal ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Truck size={13} className="text-[#9d4ae3]" />
                          Delivery Fee:
                        </span>
                        <span className="font-bold text-slate-800">
                          {quoteData ? (
                            `₦${quoteData.shippingCost.toLocaleString()}`
                          ) : summary?.deliveryFeeCalculated ? (
                            `₦${(summary.deliveryFee ?? summary.shipping).toLocaleString()}`
                          ) : (
                            <span className="text-purple-600">Calculated from state</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>
                          Tax ({quoteData?.taxRate ? `${(quoteData.taxRate * 100).toFixed(1)}%` : summary?.formattedRate || '7.5%'}):
                        </span>
                        <span className="font-bold text-slate-800">
                          ₦{(quoteData?.taxAmount ?? summary?.tax ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t border-dashed pt-3 flex justify-between items-center text-sm font-bold text-slate-800">
                        <span>Total Due:</span>
                        <span className="text-xl font-extrabold text-[#9d4ae3]">
                          ₦{(quoteData?.total ?? summary?.total ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing || Boolean(quoteError) || (Boolean(quoteData) === false && Boolean(summary?.deliveryError))}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl mt-6 hover:from-emerald-600 hover:to-green-700 transition shadow-lg shadow-emerald-50 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag size={18} />
                      <span>Place Order & Pay</span>
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* 4. SAVED ITEMS VIEW */}
        {activeTab === 'saved' && (
          <div className="w-full">
            {savedItemsIsEmpty ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-2xl mx-auto">
                <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No items saved for later</h3>
                <p className="text-gray-400 text-sm mt-1 mb-6">
                  Save active items from your cart to buy them later.
                </p>
                <button
                  onClick={() => setActiveTab('active')}
                  className="bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition"
                >
                  View Active Cart
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xs overflow-hidden border border-gray-100 max-w-4xl mx-auto">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[3fr_1.5fr_1.5fr_0.5fr] items-center bg-gray-50 px-6 py-4 border-b border-gray-100 text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                  <div>Product</div>
                  <div className="text-center">Price</div>
                  <div className="text-center">Action</div>
                  <div className="text-right">Remove</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  <AnimatePresence initial={false}>
                    {savedItems.map((item) => {
                      const product = item.product;
                      if (!product) return null;
                      const priceVal = product.price;

                      return (
                        <motion.div
                          key={item.productId}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1.5fr_0.5fr] items-center p-5 md:p-6 gap-4 md:gap-0 hover:bg-slate-50/50 transition-colors"
                        >
                          {/* Product Info */}
                          <div className="flex items-center gap-4">
                            <Link href={`/products/${item.productId}`} className="relative w-16 h-16 border border-gray-100 rounded-2xl overflow-hidden bg-white p-2 hover:opacity-90 transition-opacity flex-shrink-0">
                              <Image
                                src={getProductImage(product)}
                                alt={product.name}
                                fill
                                sizes="64px"
                                className="object-contain p-1"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link href={`/products/${item.productId}`}>
                                <h4 className="text-sm md:text-base font-bold text-slate-800 hover:text-[#9d4ae3] cursor-pointer whitespace-normal break-words leading-tight">
                                  {product.name}
                                </h4>
                              </Link>
                              <p className="text-xs text-gray-400 mt-1 font-bold">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex md:block justify-between items-center text-center">
                            <span className="md:hidden text-xs font-bold text-gray-400">Price</span>
                            <span className="font-bold text-slate-700">
                              ₦{priceVal.toLocaleString()}
                            </span>
                          </div>

                          {/* Move to active */}
                          <div className="flex md:block justify-center">
                            <button
                              onClick={() => handleMoveToCart(item.productId)}
                              className="px-4 py-2 bg-purple-50 text-[#9d4ae3] hover:bg-purple-100 border border-purple-100 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 active:scale-95"
                            >
                              <ShoppingBag size={14} />
                              Move to Cart
                            </button>
                          </div>

                          {/* Delete */}
                          <div className="flex md:block justify-end">
                            <button
                              onClick={() => handleDeleteItem(item.productId)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                              title="Delete item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── 5. CONFIRMATION MODALS ── */}

      {/* Clear All Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowClearAllModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-red-50 animate-in zoom-in-95 duration-200 z-10">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Clear Entire Cart?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center leading-relaxed">
              Are you sure you want to clear your cart? This will delete <span className="text-red-500 font-bold">both</span> active items and saved items.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Selected Modal */}
      {showClearSelectedModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowClearSelectedModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-red-50 animate-in zoom-in-95 duration-200 z-10">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Delete Selected Items?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center leading-relaxed">
              Are you sure you want to remove the <span className="font-bold text-purple-600">{selectedCount}</span> selected items from your active cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearSelectedModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSelected}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER SUCCESS MODAL ── */}
      <AnimatePresence>
        {showOrderSuccessModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowOrderSuccessModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center border border-green-100 z-10 overflow-hidden"
            >
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-36 h-36 bg-green-200/40 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-emerald-200/30 rounded-full blur-2xl" />

              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200"
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Order Placed!</h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  Your order has been confirmed and is now being processed. You'll receive a confirmation shortly.
                </p>

                {placedOrderNumber && placedOrderNumber !== 'N/A' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 mb-4 inline-block w-full">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Order ID</p>
                    <p className="text-sm font-extrabold text-slate-800 break-all">{placedOrderNumber}</p>
                  </div>
                )}

                {placedOrderExpectedDelivery && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 text-left flex items-start gap-3 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Truck size={18} />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                        Delivery Promise
                      </p>
                      <p className="font-extrabold text-purple-950 text-sm mt-0.5">
                        {deliveryCopy(placedOrderExpectedDelivery, 'paid')}
                      </p>
                      <p className="text-purple-800 mt-1 font-medium">
                        Within {placedOrderExpectedDelivery.maxWorkingDays} working days of payment confirmation.
                        {placedOrderExpectedDelivery.isInterState && (
                          <span className="ml-1.5 px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded font-bold text-[10px]">
                            Inter-state
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowOrderSuccessModal(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition shadow-lg shadow-emerald-100 active:scale-95"
                >
                  Continue Shopping
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
