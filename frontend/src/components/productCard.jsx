import React, { useState, useEffect, useMemo } from "react";
import "../components_style/productCard.css";
import { useCart } from "../context/CartContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ProductCardList({ searchQuery = "", category = "", sort = "name" }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const { addToCart } = useCart();

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

    switch (sort) {
      case "price-low":  return [...list].sort((a, b) => a.price - b.price);
      case "price-high": return [...list].sort((a, b) => b.price - a.price);
      default:           return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    }
  }, [allProducts, searchQuery, category, sort]);

  const toggleFavorite = (id) =>
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

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

          return (
            <div key={id} className="card product-card card-3d">
              <div className="product-image-container">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-image" />
                ) : (
                  <div
                    className="product-image"
                    style={{ height: "100%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px", flexDirection: "column", gap: "6px" }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-5 4 6"/><circle cx="8.5" cy="7.5" r="1"/></svg>
                    No Image
                  </div>
                )}
                <button
                  className="btn btn-ghost btn-icon favorite-btn glass"
                  onClick={() => toggleFavorite(id)}
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
                <span className="category-badge gradient-accent">{product.category}</span>
              </div>

              <div className="product-details">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                </div>

                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  by {vendorName}
                </p>

                {product.description && (
                  <p className="text-sm mt-1" style={{ color: "#6b7280", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="price-container">
                    <p className="text-xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </p>
                  </div>
                  <button
                    className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:opacity-90 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed add-to-cart-btn"
                    disabled={product.stock === 0}
                    onClick={() => {
                      addToCart(product);
                      alert(`${product.name} added to cart!`);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cart-icon">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span className="btn-text">Add</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}