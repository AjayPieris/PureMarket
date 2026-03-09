import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [buying, setBuying] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const isOwner = user && product?.vendor && (user._id === product.vendor._id || user._id === product.vendor);

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;
    setBuying(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/products/${id}/buy`);
      setProduct(data.product);
      toast.success(data.message || "Successfully booked now");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book product");
    } finally {
      setBuying(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/api/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        } else if (data.image) {
          setMainImage(data.image);
        }
      })
      .catch((err) => setError(err.response?.data?.message || "Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mr-3"></div>
          Loading details...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <span className="text-4xl mb-4">😕</span>
          <span className="text-lg font-medium">{error || "Product not found"}</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          {/* Images Section */}
          <div className="md:w-1/2 p-6 lg:p-10 bg-gray-50 flex flex-col items-center">
            <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-6 flex items-center justify-center relative">
              {mainImage ? (
                <img src={mainImage} className="w-full h-full object-cover" alt={product.name} />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  No Image
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {(product.images?.length > 1) && (
              <div className="w-full flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-purple-600 scale-105 shadow-md' : 'border-transparent hover:border-purple-300 opacity-80 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-6 lg:p-12 flex flex-col">
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-gray-500 mb-2 font-medium">by <span className="text-purple-600 border-b border-purple-200 pb-0.5">{product.vendor?.name || "Unknown Vendor"}</span></p>

            <div className="flex items-center mb-8">
              <div className="flex text-amber-500 text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={(product.rating || 5.0) >= star ? "text-amber-500" : "text-gray-300"}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2 font-semibold">
                {Number(product.rating || 5.0).toFixed(1)} <span className="text-gray-400 font-normal">({product.numReviews || 0} reviews)</span>
              </span>
            </div>
            
            <div className="flex items-end gap-4 mb-6">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                ${Number(product.price).toFixed(2)}
              </div>
              <div className={`text-sm font-semibold mb-1.5 px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? `✓ ${product.stock} in stock` : "✕ Out of stock"}
              </div>
            </div>

            <div className="h-px w-full bg-gray-100 mb-6"></div>



            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => {
                  if (isOwner) {
                    toast.error("You cannot buy your own product!");
                    return;
                  }
                  addToCart(product);
                  toast.success(`${product.name} added to cart!`);
                }}
                disabled={product.stock === 0 || isOwner}
                className="flex-[1] h-14 px-6 bg-white border-2 border-purple-600 text-purple-700 text-lg font-bold rounded-xl hover:bg-purple-50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  if (isOwner) {
                    toast.error("You cannot buy your own product!");
                    return;
                  }
                  handleBuyNow();
                }}
                disabled={product.stock === 0 || buying || isOwner}
                className="flex-[1] h-14 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_10px_20px_-5px_rgba(124,58,237,0.6)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {buying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                )}
                {buying ? "Booking..." : "Buy Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Description & Reviews */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-10 flex flex-col md:flex-row gap-10">
          
          {/* Left Column: Description */}
          <div className="md:w-1/2 flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              About this product
            </h3>
            <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap flex-1">
              {product.description || "No description provided. Experience the quality and detail in this meticulously crafted product."}
            </div>
          </div>
          
          <div className="hidden md:block w-px bg-gray-100 flex-shrink-0"></div>
          <div className="md:hidden h-px w-full bg-gray-100"></div>

          {/* Right Column: Fake Reviews Filter Block for layout */}
          <div className="md:w-1/2 flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Customer Reviews
            </h3>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl font-black text-gray-900">{Number(product.rating || 5.0).toFixed(1)}</div>
                <div>
                  <div className="flex text-amber-500 text-xl mb-1">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className={(product.rating || 5.0) >= star ? "text-amber-500" : "text-gray-300"}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{product.numReviews || 0} Ratings</div>
                </div>
              </div>

              {/* Fake Rating Bars */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(stars => (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-12 font-medium text-gray-600 flex items-center justify-end gap-1">
                      {stars} <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: stars === 5 ? '80%' : stars === 4 ? '15%' : '0%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock highest/lowest review toggle placeholders */}
            <div className="flex gap-2 mb-6">
              <button className="px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg text-sm transition hover:bg-purple-200">
                Highest Rated
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm transition hover:bg-gray-200">
                Lowest Rated
              </button>
            </div>

            <div className="text-center text-gray-500 italic py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No written reviews yet. Be the first to review this product!
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
