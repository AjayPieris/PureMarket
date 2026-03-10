import React, { useState, useEffect, useMemo } from "react";
import "../components_style/productCard.css";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProductCardList({ searchQuery = "", category = "", sort = "name" }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("product_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Fetch all active products from the backend
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/api/products`)
      .then(({ data }) => setAllProducts(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  // Filter + sort in-memory
  const products = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = allProducts.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCategory = !category || p.category === category;
      return matchesQuery && matchesCategory;
    });

    let sortedList = [...list].sort((a, b) => {
      const isFavA = favorites.includes(a._id);
      const isFavB = favorites.includes(b._id);
      
      if (isFavA && !isFavB) return -1;
      if (!isFavA && isFavB) return 1;

      switch (sort) {
        case "price-low":  return a.price - b.price;
        case "price-high": return b.price - a.price;
        default:           return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
    });
    
    return sortedList;
  }, [allProducts, searchQuery, category, sort, favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const newFavs = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("product_favorites", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
        Loading products…
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 0", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🛍️</div>
        No products found.
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-list">
        {products.map((product) => {
          const id = product._id;
          const isFavorite = favorites.includes(id);
          const vendorName = product.vendor?.name || "Unknown";
          const userId = user?._id?.toString();
          const vendorId = (product.vendor?._id || product.vendor)?.toString();
          const isOwner = !!(userId && vendorId && userId === vendorId);

          return (
            <div key={id} className="card product-card card-3d">
              <Link to={`/product/${id}`} className="block relative group">
                <div className="product-image-container relative">
                  {(product.images?.length > 0 || product.image) ? (
                    <img src={product.images?.[0] || product.image} alt={product.name} className="product-image group-hover:scale-105 transition-transform duration-500 w-full h-full object-cover" />
                  ) : (
                    <div
                      className="product-image w-full h-full"
                      style={{ background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px", flexDirection: "column", gap: "6px" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-5 4 6"/><circle cx="8.5" cy="7.5" r="1"/></svg>
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      className="btn btn-ghost btn-icon favorite-btn glass flex items-center justify-center p-2 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(id);
                      }}
                    >
                  <svg
                    className="heart-icon"
                    width="20" height="20" viewBox="0 0 24 24"
                    fill={isFavorite ? "rgb(239 68 68)" : "none"}
                    stroke="currentColor" strokeWidth="2"
                    style={{ color: isFavorite ? "rgb(239 68 68)" : "currentColor" }}
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                  </div>
                <span className="category-badge gradient-accent z-10">{product.category}</span>
                </div>
              </Link>

              <div className="product-details p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/product/${id}`} className="hover:text-purple-600 transition-colors line-clamp-1 w-full flex-1 mr-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                  </Link>
                </div>

                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  by {vendorName}
                </p>

                <div className="flex items-end justify-between mt-4">
                  <div className="price-container">
                    <p className="text-xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-3 w-full rounded-lg shadow-md hover:opacity-90 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed add-to-cart-btn z-10"
                      disabled={product.stock === 0 || isOwner}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product);
                        toast.success(`${product.name} added to cart!`);
                      }}
                    >
                      {isOwner ? (
                        <span className="btn-text">Your Product</span>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cart-icon">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          <span className="btn-text">{product.stock === 0 ? "Out of Stock" : "Add"}</span>
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-end w-full mt-1">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="14" height="14" viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={(product.rating || 5.0) >= star ? "text-amber-400" : "text-gray-300"}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        ))}
                      </div>
                      <span className="text-[13px] text-gray-500 ml-1.5 font-medium leading-none">
                        {Number(product.rating || 5.0).toFixed(1)} <span className="text-gray-400 font-normal ml-0.5">({product.numReviews || 0})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}