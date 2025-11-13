import React from "react";
import "../components_style/navbar.css";
import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

function Navbar() {
  const location = useLocation();
  const { cartCount } = useCart() || { cartCount: 0 };

  const pathname = location.pathname || "/";

  // Route guards
  const isVendorPage = /^\/vendor(\/|$)/.test(pathname);
  const isAdminPage = /^\/admin(\/|$)/.test(pathname);

  // Show/hide controls
  // - Hide cart on vendor AND admin pages, and also when already at /cart
  const showCartLink = !isVendorPage && !isAdminPage && pathname !== "/cart";

  // - Hide Products link on admin pages (as requested). Keep it visible elsewhere (home, vendor, etc.)
  const showProductsLink = !isAdminPage;

  return (
    <header className="home-nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="logo-pill" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l7 4v8l-7 4-7-4V6l7-4z" stroke="white" strokeWidth="1.6" />
              <path d="M12 2v8l7 4M12 10L5 14" stroke="white" strokeWidth="1.2" opacity=".7" />
            </svg>
          </span>
          <span className="brand-name">PureMarket</span>
        </Link>

        <div className="nav-right">
          {showProductsLink && (
            <Link to="/products" className="nav-link">
              Products
            </Link>
          )}

          {showCartLink && (
            <Link to="/cart" className="nav-link cart-link-wrapper" aria-label="Open cart">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="cart-badge" aria-label={`${cartCount} items in cart`}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <Link to="/signin" className="btn-login">
            <span className="login-icon" aria-hidden>↪</span>
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;