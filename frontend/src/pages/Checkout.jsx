import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // If coming directly from "Order Now" (not cart), use those items instead
  const directItems = location.state?.directItems;
  const items = directItems || cart;
  const itemsTotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    return itemsTotal.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("No items to order!");
      return;
    }

    if (!user) {
      toast.error("Please login to place an order.");
      navigate("/signin");
      return;
    }

    setLoading(true);

    try {
      // In a real app we'd send the shipping info to the backend.
      // Currently, the backend expects POST /api/products/:id/buy for single items 
      // or we can map them if an order endpoint exists.
      // Let's loop the cart and buy them individually since the backend API handles stock per product.
      
      const orderPromises = items.map(item => 
        axios.post(
          `${API_BASE}/api/products/${item._id}/buy`,
          { quantity: 1, shippingAddress: formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(orderPromises);
      
      // Only clear the main cart if we didn't bypass it
      if (!directItems) clearCart();
      toast.success("Order placed successfully!");
      
      // Navigate to order success with the first item's vendor details, or just generic success
      navigate("/order-success", { 
        state: { 
          product: items[0],
          vendorName: items[0]?.vendor?.name || items[0]?.vendor,
          vendorEmail: items[0]?.vendor?.email 
        } 
      });

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products to find something you like!</p>
          <button onClick={() => navigate("/products")} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">
            Start Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Shipping Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Shipping Details
              </h2>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full rounded-xl border-gray-300 border p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border-gray-300 border p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="john@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full rounded-xl border-gray-300 border p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="123 Main St, Apt 4B" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border-gray-300 border p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full rounded-xl border-gray-300 border p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="10001" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border-gray-300 border p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition" placeholder="(555) 123-4567" />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.images?.[0] || item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">by {item.vendor?.name || item.vendor}</p>
                      <p className="text-sm font-bold text-gray-900">${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-6 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={loading}
                className="w-full py-4 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                )}
                {loading ? "Processing..." : `Pay $${calculateTotal()}`}
              </button>
              <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Secure and encrypted checkout
              </p>
            </div>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
