//src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const calculateShipping = (total) => {
  return total > 500 ? 0 : 5.99;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('cartItems')) || [],
    total: (JSON.parse(localStorage.getItem('cartItems')) || []).reduce((sum, item) => sum + (item.price * item.quantity), 0),
    shipping: calculateShipping((JSON.parse(localStorage.getItem('cartItems')) || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)),
    shippingAddress: null,
    coupon: JSON.parse(localStorage.getItem('coupon')) || null, // Replaces simple codes
  },
  reducers: {
    addToCart: (state, action) => {
      const { id, selectedSize, selectedColor, selectedAge, selectedPack } = action.payload;

      // Generate unique Cart ID based on variants
      const variantKey = [
        id,
        selectedSize || '',
        selectedColor || '',
        selectedAge || '',
        selectedPack || ''
      ].join('-');

      const existingItemIndex = state.items.findIndex(item => item.cartId === variantKey);

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += action.payload.quantity || 1;
      } else {
        state.items.push({
          ...action.payload,
          cartId: variantKey, // Valid Unique Key
          quantity: action.payload.quantity || 1
        });
      }

      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.shipping = calculateShipping(state.total);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    removeFromCart: (state, action) => {
      // Action payload can be cartId (preferred) or id (fallback)
      const targetId = action.payload;
      state.items = state.items.filter(item => (item.cartId || item.id) !== targetId);

      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.shipping = calculateShipping(state.total);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    updateQuantity: (state, action) => {
      const { id, cartId, quantity } = action.payload;
      // Prefer cartId, fallback to id
      const targetId = cartId || id;
      const itemIndex = state.items.findIndex(item => (item.cartId || item.id) === targetId);

      if (itemIndex >= 0) {
        if (quantity < 1) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }

        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        state.shipping = calculateShipping(state.total);
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.shipping = 5.99;
      state.coupon = null;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('coupon');
    },

    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload; // Stores { code, type, value, maxDiscount, ... }
      localStorage.setItem('coupon', JSON.stringify(action.payload));
    },

    removeCoupon: (state) => {
      state.coupon = null;
      localStorage.removeItem('coupon');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setShippingAddress, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;