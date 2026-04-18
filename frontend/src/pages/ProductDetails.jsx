import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [buying, setBuying] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [sortOrder, setSortOrder] = useState("high");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  const isOwner = user && product?.vendor && (user._id === product.vendor._id || user._id === product.vendor);

  const fetchReviewsAndPurchaseStatus = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/reviews/product/${id}`);
      setReviews(data);
      
      if (user && token) {
        const { data: purchaseData } = await axios.get(`${API_BASE}/api/reviews/check-purchase/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasPurchased(purchaseData.hasPurchased);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyNow = () => {
    if (!user || !token) {
      toast.error("Please login to buy products.");
      return;
    }
    if (!product || product.stock <= 0) return;

    // Build a list of items representing the chosen quantity
    const items = Array.from({ length: orderQuantity }, () => ({ ...product }));

    // Navigate to checkout with the item(s) pre-filled
    navigate("/checkout", {
      state: {
        directItems: items,
      }
    });
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

    fetchReviewsAndPurchaseStatus();
  }, [id, user, token]);

  // Auto-cycle images every 2.5s (pause on hover)
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    
    if (!isHoveringImage) {
      const interval = setInterval(() => {
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          if (currentIndex === -1) return product.images[0];
          const nextIndex = (currentIndex + 1) % product.images.length;
          return product.images[nextIndex];
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [product, isHoveringImage]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (isOwner) {
      toast.error("You cannot review your own product!");
      return;
    }
    if (!user) {
      toast.error("Please login to leave a review");
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/reviews/product/${id}`,
        { rating: reviewRating, comment: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
      setReviewText("");
      setReviewRating(0);
      setHoverRating(0);
      
      const [reviewsRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE}/api/reviews/product/${id}`),
        axios.get(`${API_BASE}/api/products/${id}`)
      ]);
      setReviews(reviewsRes.data);
      setProduct(prodRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOrder === "high") return b.rating - a.rating;
    return a.rating - b.rating;
  });

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
      <main className="flex-1 max-w-6xl mx-auto px-4 pt-24 pb-10 w-full animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          {/* Images Section */}
          <div className="md:w-1/2 p-6 lg:p-10 bg-gray-50 flex flex-col items-center">
            <div 
              className="w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-6 flex items-center justify-center relative group"
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => setIsHoveringImage(false)}
            >
              {mainImage ? (
                <img src={mainImage} className="w-full h-full object-cover transition-opacity duration-500" alt={product.name} />
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
            <div className="flex items-center gap-3 mb-4">
              <p className="text-gray-500 font-medium text-lg">by <span className="text-purple-600 border-b border-purple-200 pb-0.5">{product.vendor?.name || "Unknown Vendor"}</span></p>
              {product.vendor?.profileImage ? (
                <img src={product.vendor.profileImage} alt={product.vendor?.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {(product.vendor?.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

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
            
            <div className="flex flex-wrap items-end gap-3 mb-6">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                LKR {Number(product.price).toFixed(2)}
              </div>
              <div className={`text-sm font-semibold px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? `✓ ${product.stock} in stock` : "✕ Out of stock"}
              </div>
            </div>

            <div className="h-px w-full bg-gray-100 mb-6 mt-auto"></div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center border border-gray-200 rounded-lg w-max bg-white">
                <button 
                  onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                  disabled={orderQuantity <= 1 || product.stock === 0}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-colors disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <div className="w-12 text-center font-bold text-gray-900 border-x border-gray-200 py-2">
                  {orderQuantity}
                </div>
                <button 
                  onClick={() => setOrderQuantity(prev => Math.min(product.stock, prev + 1))}
                  disabled={orderQuantity >= product.stock || product.stock === 0}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-colors disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Add to Cart */}
              <button
                onClick={() => {
                  if (isOwner) { toast.error("You cannot buy your own product!"); return; }
                  for (let i = 0; i < orderQuantity; i++) addToCart(product);
                  toast.success(`${orderQuantity} × ${product.name} added to cart!`);
                }}
                disabled={product.stock === 0 || isOwner}
                title="Add to Cart"
                className="flex-1 min-w-0 h-12 px-3 sm:px-6 bg-white border-2 border-purple-600 text-purple-700 font-bold rounded-xl hover:bg-purple-50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white flex items-center justify-center gap-2"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {/* Text hidden on mobile, visible on sm+ */}
                <span className="hidden sm:inline text-base">Add to Cart</span>
              </button>

              {/* Order Now */}
              <button
                onClick={() => {
                  if (isOwner) { toast.error("You cannot buy your own product!"); return; }
                  handleBuyNow();
                }}
                disabled={product.stock === 0 || buying || isOwner}
                title="Order Now"
                className="flex-1 min-w-0 h-12 px-3 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_10px_20px_-5px_rgba(124,58,237,0.6)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {buying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white flex-shrink-0"></div>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                )}
                {/* Text hidden on mobile, visible on sm+ */}
                <span className="hidden sm:inline text-base">{buying ? "Ordering..." : "Order Now"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Description & Reviews */}
        <div className="mt-10 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Product details</h3>
          <p className="text-gray-600 leading-relaxed mb-10 whitespace-pre-wrap">
            {product.description || "No description provided. Experience the quality and detail in this meticulously crafted product."}
          </p>

          <hr className="my-10 border-gray-100" />

          {/* Reviews Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortOrder('high')} 
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${sortOrder === 'high' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                High Rate
              </button>
              <button 
                onClick={() => setSortOrder('low')} 
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${sortOrder === 'low' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Low Rate
              </button>
            </div>
          </div>

          <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {hasPurchased || isOwner ? (
              <>
                 <h4 className="font-bold text-gray-900 mb-3">Leave a Review</h4>
                 <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex text-2xl gap-1">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewRating(num)}
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none focus:scale-110 transition-transform"
                      >
                        <svg
                          width="28" height="28" viewBox="0 0 24 24"
                          fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className={`transition-colors duration-200 ${(hoverRating || reviewRating) >= num ? "text-amber-500" : "text-gray-300"}`}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea 
                    rows={3}
                    placeholder="Tell others what you think..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-3 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  ></textarea>
                </div>
                    <button 
                      type="submit" 
                      disabled={submittingReview || reviewRating === 0}
                      className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                 </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Verified Buyers Only</h4>
                <p className="text-gray-500">You must purchase this product before you can leave a review.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {sortedReviews.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No reviews yet. Be the first to review this product!</p>
            ) : (
              sortedReviews.map(review => (
                <div key={review._id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{review.customer?.name || "User"}</span>
                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-500 text-sm mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        width="16" height="16" viewBox="0 0 24 24"
                        fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={review.rating >= star ? "text-amber-500" : "text-gray-300"}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
