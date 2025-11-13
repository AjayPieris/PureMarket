import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart, total } = useCart();

  return (
    <>
      <Navbar />
      <section className="py-16">
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
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="card glass p-6 mb-4 flex items-center gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">by {item.vendor}</p>
                      <p className="font-bold mt-2 text-blue-600">
                        ${item.price}
                      </p>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeFromCart(index)}
                      title="Remove item"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="card glass p-8 h-fit">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span className="font-semibold">$10.00</span>
                  </div>
                  <div className="flex justify-between border-t pt-4 mb-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${(total + 10).toFixed(2)}
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
