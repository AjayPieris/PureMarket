import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data passed from the ProductDetails page navigation state
  const { product, vendorName, vendorEmail } = location.state || {};

  // Redirect to home if accessed directly without an order state
  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location, navigate]);

  if (!location.state) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12 text-center relative">
          
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Order Successful!</h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Thank you for your purchase. Your <span className="font-bold text-gray-800">{product?.name}</span> will arrive within 2 days.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-md mx-auto mb-10 text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Vendor Details</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Vendor Name</p>
                <p className="font-bold text-gray-900">{vendorName || "Unknown Vendor"}</p>
              </div>
            </div>
            {vendorEmail && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Contact Email</p>
                  <a href={`mailto:${vendorEmail}`} className="font-bold text-blue-600 hover:underline">{vendorEmail}</a>
                </div>
              </div>
            )}
            {!vendorEmail && (
              <p className="text-sm text-gray-500 mt-2 italic">Contact information not provided by the vendor.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products" className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-gray-800 hover:-translate-y-1 transition-all">
              Continue Shopping
            </Link>
            <Link to={`/product/${product?._id}`} className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:-translate-y-1 transition-all">
              View Product Again
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
