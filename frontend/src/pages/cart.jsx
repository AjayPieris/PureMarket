import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart, total } = useCart();

  // Aggregate cart items by _id
  const groupedCart = cart.reduce((acc, item, index) => {
    // We keep track of the first index this item was added so we can still remove it
    // A more robust cart system would remove by ID, but we'll use the original index
    const existing = acc.find(g => g._id === item._id);
    if (existing) {
      existing.quantity += 1;
      // Store all original indices so removing it removes all instances, 
      // or we can just remove the first instance of it.
      existing.indices.push(index);
    } else {
      acc.push({ ...item, quantity: 1, indices: [index] });
    }
    return acc;
  }, []);

  // Require CartContext and context functions
  const { addToCart } = useCart();
  
  return (
    <>
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mx-auto mb-4 text-gray-400"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">
                Add some products to get started!
              </p>
              <a
                href="/products"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:opacity-90 hover:-translate-y-1 transition-all duration-300"
              >
                Browse Products
              </a>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {groupedCart.map((group) => (
                  <div
                    key={group._id || group.indices[0]}
                    className="card glass p-6 mb-4 flex flex-col sm:flex-row items-center sm:items-stretch gap-6"
                  >
                    {/* Left: Image & Name */}
                    <div className="flex items-center gap-4 w-full sm:w-1/3 shrink-0">
                      <img
                        src={group.images?.[0] || group.image}
                        alt={group.name}
                        className="w-24 h-24 object-cover rounded-xl shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate" title={group.name}>{group.name}</h3>
                        <p className="text-sm text-gray-500 truncate mt-1">by {group.vendor?.name || group.vendor}</p>
                      </div>
                    </div>

                    {/* Center: Description */}
                    <div className="hidden sm:flex flex-1 items-center px-4 border-l border-gray-100 min-w-0">
                      <p className="text-sm text-gray-500 line-clamp-3" title={group.description}>
                        {group.description || "No description available for this product."}
                      </p>
                    </div>

                    {/* Right: Price & Controls */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto shrink-0 sm:pl-6 sm:border-l border-gray-100 relative">
                       {/* Remove Button - Top Right on Desktop */}
                       <button
                        className="hidden sm:block absolute -top-4 -right-4 btn btn-ghost btn-icon text-gray-300 hover:text-red-600 p-2 rounded-full"
                        onClick={() => {
                          const reversedIndices = [...group.indices].sort((a,b) => b - a);
                          reversedIndices.forEach(idx => removeFromCart(idx));
                        }}
                        title="Remove all of this item"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>

                      <p className="font-bold text-blue-600 text-xl">
                        LKR {Number(group.price).toFixed(2)}
                      </p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-lg w-max bg-white overflow-hidden shadow-sm">
                        <button 
                          onClick={() => removeFromCart(group.indices[group.indices.length - 1])}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors"
                          title="Decrease quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        
                        <div className="w-10 text-center font-bold text-gray-900 border-x border-gray-200 py-1.5 text-sm bg-gray-50">
                          {group.quantity}
                        </div>
                        
                        <button 
                          onClick={() => {
                            const { quantity, indices, ...rawItem } = group;
                            addToCart(rawItem);
                          }}
                          disabled={group.quantity >= group.stock}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Increase quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>

                      {/* Mobile Remove Button */}
                       <button
                        className="sm:hidden btn btn-ghost btn-icon text-red-500 p-2"
                        onClick={() => {
                          const reversedIndices = [...group.indices].sort((a,b) => b - a);
                          reversedIndices.forEach(idx => removeFromCart(idx));
                        }}
                        title="Remove item"
                      >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card glass p-8 h-fit">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span className="font-semibold">LKR {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between border-t pt-4 mb-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      LKR {total.toFixed(2)}
                    </span>
                  </div>
                  <a
                    href="/checkout"
                    className="btn btn-primary gradient-primary w-full mb-2"
                  >
                    Proceed to Checkout
                  </a>
                  <button
                    onClick={clearCart}
                    className="btn btn-ghost w-full mt-2"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
