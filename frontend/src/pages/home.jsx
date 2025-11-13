import React from "react";
import { Link } from "react-router-dom";
import "../page_style/home.css";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import About from "../components/About";
import Card from "../components/productCard";

export default function Home() {
  return (
    <div className="home-page">
      {/* Top Nav */}
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Discover Amazing <span className="accent">Products</span> Today
        </h1>
        <p className="hero-sub">
          Shop from thousands of verified vendors and find exactly what you're
          looking for
        </p>

        <div className="hero-ctas">
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
          <Link to="/signup" className="link-plain">
            Become a Vendor
          </Link>
        </div>
      </section>

      {/* Centered, big stats */}
      <section className="stats">
        <div className="stat-card small center">
          <span className="stat-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3l8 4-8 4-8-4 8-4z"
                stroke="#7C3AED"
                strokeWidth="1.6"
              />
              <path d="M4 7v10l8 4 8-4V7" stroke="#7C3AED" strokeWidth="1.6" />
            </svg>
          </span>
          <div className="stat-value">10,000+</div>
          <div className="stat-label">Products</div>
        </div>

        <div className="stat-card small center">
          <span className="stat-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 10h16l-1-5H5l-1 5z"
                stroke="#7C3AED"
                strokeWidth="1.6"
              />
              <path
                d="M5 10v8h6v-6h2v6h6v-8"
                stroke="#7C3AED"
                strokeWidth="1.6"
              />
            </svg>
          </span>
          <div className="stat-value">1,000+</div>
          <div className="stat-label">Vendors</div>
        </div>

        <div className="stat-card small center">
          <span className="stat-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="#7C3AED"
                strokeWidth="1.6"
              />
              <path
                d="M9 10h.01M15 10h.01"
                stroke="#7C3AED"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8.5 14c1 .9 2.2 1.4 3.5 1.4s2.5-.5 3.5-1.4"
                stroke="#7C3AED"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="stat-value">50,000+</div>
          <div className="stat-label">Happy Customers</div>
        </div>
      </section>

      <About />
      <h2 className="heading">Featured Products</h2>
      <p className="subheading">Check out our most popular items</p>
      <Card />
      <div className="text-center mt-4 mb-16">
        <a
          href="/products"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:opacity-90 hover:-translate-y-1 transition-all duration-300"
        >
          View All Products
        </a>
      </div>
      <Footer />
    </div>
  );
}
