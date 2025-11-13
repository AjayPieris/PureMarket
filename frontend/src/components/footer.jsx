import React from "react";
import { Link } from "react-router-dom";
import "../components_style/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-col">
          <h3>About MarketPlace</h3>
          <p>
            Your trusted multi-vendor marketplace for quality products at great
            prices.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/signup">Become a Vendor</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-col">
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/shipping">Shipping Info</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/track">Track Order</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-col">
          <h3>Newsletter</h3>
          <p>Subscribe for exclusive deals</p>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Your email"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© 2024 MarketPlace. All rights reserved.</p>
      </div>
    </footer>
  );
}
