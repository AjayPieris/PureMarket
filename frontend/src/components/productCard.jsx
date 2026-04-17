import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import "../components_style/productCard.css";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

import product1 from "../assets/product1.png";
import product2 from "../assets/product2.png";
import product3 from "../assets/product3.png";
import product4 from "../assets/product4.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/* ── Sample products shown when backend is unavailable ── */
const SAMPLE_PRODUCTS = [
  {
    _id: "sample-1",
    name: "Wireless Noise-Cancel Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 30hr battery life, and studio-quality sound.",
    price: 12500,
    stock: 15,
    rating: 4.8,
    numReviews: 124,
    category: "Electronics",
    images: [product1],
    vendor: { _id: "demo-vendor", name: "TechZone Store" },
  },
  {
    _id: "sample-2",
    name: "Premium Running Sneakers",
    description: "Lightweight, breathable running shoes with cloud-cushion sole technology. Perfect for daily training.",
    price: 8750,
    stock: 30,
    rating: 4.6,
    numReviews: 89,
    category: "Fashion",
    images: [product2],
    vendor: { _id: "demo-vendor", name: "SportsPro LK" },
  },
  {
    _id: "sample-3",
    name: "Luxury Smart Watch",
    description: "Stainless steel smartwatch with AMOLED display, health tracking, GPS, and 7-day battery life.",
    price: 21000,
    stock: 8,
    rating: 4.9,
    numReviews: 210,
    category: "Electronics",
    images: [product3],
    vendor: { _id: "demo-vendor", name: "GadgetWorld" },
  },
  {
    _id: "sample-4",
    name: "Premium Leather Handbag",
    description: "Handcrafted genuine leather bag with spacious interior, gold-tone hardware, and adjustable strap.",
    price: 15990,
    stock: 5,
    rating: 4.7,
    numReviews: 67,
    category: "Fashion",
    images: [product4],
    vendor: { _id: "demo-vendor", name: "LuxeFashion" },
  },
];

/* ── Reusable single product card with image cycling ── */
function ProductCard({ product, isFavorite, toggleFavorite, addToCart, isOwner }) {
  const id = product._id;
  const vendorName = product.vendor?.name || "Unknown";

  // Collect all available images (up to 4)
  const images = useMemo(() => {
    const imgs = [];
    if (product.images?.length) {
      imgs.push(...product.images.slice(0, 4));
    } else if (product.image) {
      imgs.push(product.image);
    }
    return imgs;
  }, [product.images, product.image]);

  const hasMultipleImages = images.length > 1;

  // Image cycling state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  // Start auto-cycle on hover
  const startCycling = useCallback(() => {
    if (!hasMultipleImages) return;
    setIsHovering(true);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 1500);
  }, [hasMultipleImages, images.length]);

  // Stop cycling on leave
  const stopCycling = useCallback(() => {
    setIsHovering(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveIndex(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="card product-card card-modern">
      <Link
        to={`/product/${id}`}
        className="product-card-link"
        onMouseEnter={startCycling}
        onMouseLeave={stopCycling}
      >
        <div className="product-image-container">
          {/* ── Image Stack ── */}
          {images.length > 0 ? (
            <div className="image-stack">
              {images.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`${product.name} - ${idx + 1}`}
                  className={`product-image ${idx === activeIndex ? "img-active" : "img-hidden"}`}
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="product-image-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9l4-4 4 4 4-5 4 6" />
                <circle cx="8.5" cy="7.5" r="1" />
              </svg>
              <span>No Image</span>
            </div>
          )}

          {/* ── Image Dots indicator ── */}
          {hasMultipleImages && (
            <div className={`image-dots ${isHovering ? "dots-visible" : ""}`}>
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === activeIndex ? "dot-active" : ""}`}
                />
              ))}
            </div>
          )}

          {/* ── Image count badge ── */}
          {hasMultipleImages && (
            <div className="image-count-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9l4-4 4 4 4-5 4 6" />
              </svg>
              {images.length}
            </div>
          )}

          {/* ── Shimmer overlay on hover ── */}
          <div className="image-shimmer" />

          {/* ── Favorite Button ── */}
          <button
            className="favorite-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(id);
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              className="heart-icon"
              width="20" height="20" viewBox="0 0 24 24"
              fill={isFavorite ? "#ef4444" : "none"}
              stroke={isFavorite ? "#ef4444" : "#6b7280"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* ── Category Badge ── */}
          <span className="category-badge">{product.category}</span>
        </div>
      </Link>

      {/* ── Product Details ── */}
      <div className="product-details">
        <Link to={`/product/${id}`} className="product-title-link">
          <h3 className="product-title">{product.name}</h3>
        </Link>

        <div className="product-vendor-info">
          <p className="product-vendor">by {vendorName}</p>
          {product.vendor?.profileImage ? (
            <img src={product.vendor.profileImage} alt={vendorName} className="vendor-avatar" />
          ) : (
            <div className="vendor-avatar-fallback">
              {vendorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="product-footer">
          <div className="price-block">
            <p className="product-price">LKR {Number(product.price).toFixed(2)}</p>
            <p className={`product-stock ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <div className="action-block">
            <button
              className="add-to-cart-btn"
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="cart-icon">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span className="btn-text">{product.stock === 0 ? "Out of Stock" : "Add"}</span>
                </>
              )}
            </button>

            <div className="rating-row">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="13" height="13" viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor" strokeWidth="2"
                    className={`star ${(product.rating || 5.0) >= star ? "star-filled" : "star-empty"}`}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="rating-text">
                {Number(product.rating || 5.0).toFixed(1)}
                <span className="review-count">({product.numReviews || 0})</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Product Card List (parent) ── */
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

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/api/products`)
      .then(({ data }) => {
        // If API returns real products use them, otherwise fall back to samples
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        } else {
          setAllProducts(SAMPLE_PRODUCTS);
        }
      })
      .catch(() => {
        // Backend unavailable — show sample products for demo/Vercel preview
        setAllProducts(SAMPLE_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

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

    return [...list].sort((a, b) => {
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
      <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
        <div className="loading-spinner" />
        <p className="loading-text">Loading products…</p>
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
          const userId = user?._id?.toString();
          const vendorId = (product.vendor?._id || product.vendor)?.toString();
          const isOwner = !!(userId && vendorId && userId === vendorId);

          return (
            <ProductCard
              key={id}
              product={product}
              isFavorite={favorites.includes(id)}
              toggleFavorite={toggleFavorite}
              addToCart={addToCart}
              isOwner={isOwner}
            />
          );
        })}
      </div>
    </div>
  );
}