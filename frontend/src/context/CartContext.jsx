import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateCartQuantity, removeFromCart as apiRemoveFromCart } from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children, user }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null); // Tracks item being updated/removed

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    setCartLoading(true);
    setCartError("");
    try {
      const data = await getCart();
      if (data && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      const status = err.response ? err.response.status : null;
      if (status !== 401) {
        setCartError("Unable to load your cart.");
      }
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  // Load cart whenever authenticated user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add product to cart
  const addToCart = async (productId) => {
    setActionLoadingId(productId);
    setCartError("");
    try {
      const data = await apiAddToCart(productId);
      if (data && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      }
      return { success: true, message: data.message || "Added to cart" };
    } catch (err) {
      console.error("Error adding to cart:", err);
      const message =
        err.response?.data?.message || "Failed to add product to cart.";
      return { success: false, message, status: err.response?.status };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    setActionLoadingId(productId);
    setCartError("");
    try {
      const data = await apiUpdateCartQuantity(productId, quantity);
      if (data && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      }
      return { success: true };
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      const message =
        err.response?.data?.message || "Failed to update quantity.";
      return { success: false, message, status: err.response?.status };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    setActionLoadingId(productId);
    setCartError("");
    try {
      const data = await apiRemoveFromCart(productId);
      if (data && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      }
      return { success: true };
    } catch (err) {
      console.error("Error removing from cart:", err);
      const message =
        err.response?.data?.message || "Failed to remove product from cart.";
      return { success: false, message };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Derived Values (Section 15: Derived Cart Values)
  // Total quantity across all items (e.g. Keyboard x 2 + Mouse x 1 = 3)
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cartItems]);

  // Number of distinct items
  const distinctItemCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  // Subtotal in INR: Σ(product.price * quantity)
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  // Check if a specific product ID is currently in the cart
  const isProductInCart = useCallback(
    (productId) => {
      return cartItems.some(
        (item) => (item.product?._id || item.product) === productId
      );
    },
    [cartItems]
  );

  // Get current quantity of a product in cart
  const getProductCartQuantity = useCallback(
    (productId) => {
      const item = cartItems.find(
        (item) => (item.product?._id || item.product) === productId
      );
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  // Clear cart state (used after verified checkout payment)
  const clearCartState = useCallback(() => {
    setCartItems([]);
    setCartError("");
  }, []);

  const value = {
    cartItems,
    cartLoading,
    cartError,
    actionLoadingId,
    cartCount,
    distinctItemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    fetchCart,
    clearCartState,
    isProductInCart,
    getProductCartQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;
