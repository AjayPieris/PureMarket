import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../page_style/home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import About from "../components/About";
import Card from "../components/productCard";
import HeroVideo from "../assets/Hero.mp4";
import MidVideo from "../assets/Mid.mp4";

function CountUp({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = 0;
          const startTime = performance.now();
          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * (end - start) + start));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Home() {
  return (
    <div className="home-page">
      {/* Top Nav */}
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <video
          className="hero-video"
          src={HeroVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title hero-anim-title">
            Discover Amazing <span className="accent">Products</span> Today
          </h1>
          <p className="hero-sub hero-anim-sub">
            Shop from thousands of verified vendors and find exactly what you're
            looking for
          </p>

          <div className="hero-ctas hero-anim-ctas">
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
            <Link to="/signup" className="link-plain">
              Become a Vendor
            </Link>
          </div>
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
          <div className="stat-value">
            <CountUp end={10000} suffix="+" />
          </div>
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
          <div className="stat-value">
            <CountUp end={1000} suffix="+" />
          </div>
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
          <div className="stat-value">
            <CountUp end={50000} suffix="+" />
          </div>
          <div className="stat-label">Happy Customers</div>
        </div>
      </section>

      <About />
      <h2 className="heading">Featured Products</h2>
      <p className="subheading">Check out our most popular items</p>
      <Card />
      <section className="mid-video-section">
        <video
          className="mid-video"
          src={MidVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="mid-video-overlay" />
        <div className="mid-video-content">
          <h2 className="mid-video-title">Explore Our Full Collection</h2>
          <p className="mid-video-sub">
            Thousands of products from verified vendors
          </p>
          <a href="/products" className="mid-video-btn">
            View All Products
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
