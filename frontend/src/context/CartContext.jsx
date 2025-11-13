import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// 🧺 Step 1: Create the shared "CartContext" (like one shared cart trolley)
const CartContext = createContext(null);

// 🧩 Step 2: CartProvider = The main manager that controls the cart
export function CartProvider({ children }) {
  // 🧠 Step 3: Load cart from localStorage (browser memory) or start empty
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || []; // get saved cart items
    } catch {
      return []; // if error, start empty
    }
  });

  // 💾 Step 4: Save cart to localStorage every time it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart)); // keep cart saved
  }, [cart]); // runs whenever cart updates

  // 🛍️ Step 5: Add product to cart
  const addToCart = (product) => setCart((prev) => [...prev, product]); // add new item to list

  // ❌ Step 6: Remove product from cart (by index)
  const removeFromCart = (index) =>
    setCart((prev) => prev.filter((_, i) => i !== index)); // remove one item

  // 🧹 Step 7: Clear all products
  const clearCart = () => setCart([]); // empty the cart

  // 💰 Step 8: Calculate total price using useMemo (recalculate only when cart changes)
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0), 0), // sum all prices
    [cart]
  );

  // 📦 Step 9: Prepare all values that other components can use
  const value = {
    cart,           // list of items
    cartCount: cart.length, // total number of items
    addToCart,      // function to add
    removeFromCart, // function to remove
    clearCart,      // function to clear all
    total,          // total price
  };

  // 🌍 Step 10: Share "value" with all children components
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// 🎧 Simple helper to use the cart data anywhere
export function useCart() {
  const ctx = useContext(CartContext); // get the shared cart data
  if (!ctx) {
    // if no cart found, show error message
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx; // give back the cart data and functions
}
