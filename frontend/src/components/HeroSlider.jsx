import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "../components_style/heroSlider.css";

import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";

const SLIDES = [
  {
    id: 1,
    image: banner1,
    badge: "Limited Time",
    title: "Special Offer",
    highlight: "Up to 60% Off",
    subtitle: "Shop the best deals from thousands of verified vendors. Don't miss out!",
    cta: "Shop Now",
    ctaLink: "/products",
    ctaSecondary: "Browse All",
    ctaSecondaryLink: "/products",
    accent: "#7c3aed",
  },
  {
    id: 2,
    image: banner2,
    badge: "Just Landed",
    title: "New Arrivals",
    highlight: "Flash Sale",
    subtitle: "Be the first to grab the hottest electronics and gadgets at unbeatable prices.",
    cta: "Explore Now",
    ctaLink: "/products",
    ctaSecondary: "View All",
    ctaSecondaryLink: "/products",
    accent: "#0891b2",
  },
  {
    id: 3,
    image: banner3,
    badge: "Free Delivery",
    title: "Free Shipping",
    highlight: "On All Orders",
    subtitle: "Order anything and get it delivered to your door — completely free, every time.",
    cta: "Start Shopping",
    ctaLink: "/products",
    ctaSecondary: "Learn More",
    ctaSecondaryLink: "/products",
    accent: "#ea580c",
  },
];

const AUTO_PLAY_DELAY = 4500;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next"); // 'next' | 'prev'
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback(
    (index, dir = "next") => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 480);
    },
    [isAnimating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, "next");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, "prev");
  }, [current, goTo]);

  // Auto play
  useEffect(() => {
    timerRef.current = setTimeout(next, AUTO_PLAY_DELAY);
    return () => clearTimeout(timerRef.current);
  }, [current, next]);

  // Touch / swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  const slide = SLIDES[current];

  return (
    <section
      className="hero-slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Banner Image ── */}
      <div className={`slider-track ${isAnimating ? `slide-out-${direction}` : "slide-in"}`}>
        <img
          src={slide.image}
          alt={slide.title}
          className="slider-bg-image"
          draggable={false}
        />
        {/* Dark overlay for text readability */}
        <div className="slider-overlay" />
      </div>

      {/* ── Content ── */}
      <div className={`slider-content ${isAnimating ? "content-fade-out" : "content-fade-in"}`}>
        <span className="slider-badge">{slide.badge}</span>
        <h1 className="slider-title">
          {slide.title}{" "}
          <span className="slider-highlight">{slide.highlight}</span>
        </h1>
        <p className="slider-subtitle">{slide.subtitle}</p>
        <div className="slider-ctas">
          <Link to={slide.ctaLink} className="slider-btn-primary">
            {slide.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to={slide.ctaSecondaryLink} className="slider-btn-ghost">
            {slide.ctaSecondary}
          </Link>
        </div>
      </div>

      {/* ── Prev / Next Arrows ── */}
      <button className="slider-arrow slider-arrow-prev" onClick={prev} aria-label="Previous slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="slider-arrow slider-arrow-next" onClick={next} aria-label="Next slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── Dot Indicators ── */}
      <div className="slider-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`slider-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Slide Counter ── */}
      <div className="slider-counter">
        {current + 1} / {SLIDES.length}
      </div>
    </section>
  );
}
