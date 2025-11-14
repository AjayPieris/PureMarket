import React, { useMemo, useState } from "react";
import "../components_style/productCard.css";
import { useCart } from "../context/CartContext";
import axios from "axios";

const sampleProducts = [
  { id: "1", name: "Premium Wireless Headphones", price: 299.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", category: "Electronics", rating: 4.5, vendor: "TechVendor", stock: 15, description: "High-quality wireless headphones with noise cancellation." },
  { id: "2", name: "Smart Watch Pro", price: 399.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "Electronics", rating: 4.8, vendor: "SmartTech", stock: 8, description: "Advanced smartwatch with health tracking features." },
  { id: "3", name: "Leather Backpack", price: 89.99, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", category: "Fashion", rating: 4.3, vendor: "StyleCo", stock: 25, description: "Premium leather backpack for everyday use." },
  { id: "4", name: "Running Shoes", price: 129.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", category: "Sports", rating: 4.6, vendor: "SportGear", stock: 30, description: "Comfortable running shoes for all terrains." },
  { id: "5", name: "Coffee Maker Deluxe", price: 159.99, image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500", category: "Home", rating: 4.7, vendor: "HomeEssentials", stock: 12, description: "Professional-grade coffee maker for home use." },
  { id: "6", name: "Vintage Camera", price: 599.99, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500", category: "Electronics", rating: 4.9, vendor: "PhotoPro", stock: 5, description: "Classic vintage camera with modern features." },
];



export default function ProductCardList({ searchQuery = "", category = "", sort = "name" }) {
  const [favorites, setFavorites] = useState([]);
  const { addToCart } = useCart();

  const products = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = sampleProducts.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.vendor?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCategory = !category || p.category === category;
      return matchesQuery && matchesCategory;
    });

    switch (sort) {
      case "price-low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
    }
    return list;
  }, [searchQuery, category, sort]);

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  return (
    <div className="container">
      <div className="product-list">
        {products.map((product) => {
          const isFavorite = favorites.includes(product.id);
            return (
              <div key={product.id} className="card product-card card-3d">
                <div className="product-image-container">
                  <a href={`product-detail.html?id=${product.id}`}>
                    <img src={product.image} alt={product.name} className="product-image" />
                  </a>
                  <button
                    className="btn btn-ghost btn-icon favorite-btn glass"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <svg
                      className="heart-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isFavorite ? "rgb(239 68 68)" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: isFavorite ? "rgb(239 68 68)" : "currentColor" }}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <span className="category-badge gradient-accent">{product.category}</span>
                </div>

                <div className="product-details">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="rgb(250 204 21)" stroke="rgb(250 204 21)">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span className="text-sm font-semibold">{product.rating}</span>
                    </div>
                  </div>

                  {product.vendor && (
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                      by {product.vendor}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                        ${product.price}
                      </p>
                      <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </p>
                    </div>
                    <button
                      className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:opacity-90 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={product.stock === 0}
                      onClick={() => {
                        addToCart(product);
                        // Optional toast replacement
                        // toast.success(`${product.name} added to cart`);
                        alert(`${product.name} added to cart!`);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ marginRight: "0.5rem" }}
                      >
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Add
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