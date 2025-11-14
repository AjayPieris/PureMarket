import React from "react";
import "../components_style/navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  // If CartProvider is guaranteed present (preferred), this will not throw.
  // If you sometimes render Navbar outside provider (not recommended), you can wrap in try/catch.
  let cartCount = 0;
  try {
    const cart = useCart();
    cartCount = cart.cartCount;
  } catch {
    // Fallback if not inside CartProvider (temporary safety)
    cartCount = 0;
  }

  const pathname = location.pathname || "/";
  const isVendorPage = /^\/vendor(\/|$)/.test(pathname);
  const isAdminPage = /^\/admin(\/|$)/.test(pathname);

  const showCartLink = !isVendorPage && !isAdminPage && pathname !== "/cart";
  const showProductsLink = !isAdminPage;

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  return (
    <header className="home-nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="logo-pill" aria-hidden="true">
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

          {isAuthenticated ? (
            <button type="button" className="btn-login" onClick={handleLogout}>
              <span className="login-icon" aria-hidden="true">↩</span>
              Logout
            </button>
          ) : (
            <Link to="/signin" className="btn-login">
              <span className="login-icon" aria-hidden="true">↪</span>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;