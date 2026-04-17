import React, { useState, useRef, useEffect } from "react";
import "../components_style/navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, role } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropRef = useRef(null);

  let cartCount = 0;
  try {
    const cart = useCart();
    cartCount = cart.cartCount;
  } catch {
    cartCount = 0;
  }

  const pathname = location.pathname || "/";
  const isVendorPage = /^\/vendor(\/|$)/.test(pathname);
  const isAdminPage = /^\/admin(\/|$)/.test(pathname);

  const showCartLink = !isVendorPage && !isAdminPage && pathname !== "/cart";
  const showProductsLink = !isAdminPage;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate("/signin", { replace: true });
  };

  // Derive dashboard link based on role
  const dashboardLink =
    role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : "/dashboard";

  const profileImage = user?.profileImage || "";
  const userName = user?.name || "";
  const initials = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="home-nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <img src={logo} alt="PureMarket Logo" className="app-logo-img" />
          <span className="brand-name">PureMarket</span>
        </Link>

        {/* ── Desktop Right Side ── */}
        <div className="nav-right desktop-only">
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
            /* ── Profile Avatar + Dropdown ── */
            <div className="nav-avatar-wrap" ref={dropRef}>
              <button
                type="button"
                className="nav-avatar-btn"
                onClick={() => setDropOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={dropOpen}
                aria-label="Open profile menu"
              >
                {profileImage ? (
                  <img src={profileImage} alt={userName || "Profile"} className="nav-avatar-img" />
                ) : (
                  <span className="nav-avatar-initials" aria-hidden="true">
                    {initials}
                  </span>
                )}
                <svg
                  className={`nav-avatar-caret${dropOpen ? " open" : ""}`}
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropOpen && (
                <div className="nav-dropdown" role="menu">
                  {/* User info header */}
                  <div className="nav-drop-header">
                    <div className="nav-drop-avatar">
                      {profileImage ? (
                        <img src={profileImage} alt={userName} className="nav-drop-avatar-img" />
                      ) : (
                        <span className="nav-drop-initials">{initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="nav-drop-name">{userName || "User"}</p>
                      <p className="nav-drop-role">{role || "member"}</p>
                    </div>
                  </div>

                  <div className="nav-drop-divider" />

                  <Link
                    to={dashboardLink}
                    className="nav-drop-item"
                    role="menuitem"
                    onClick={() => setDropOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    Dashboard
                  </Link>

                  <Link
                    to="/account"
                    className="nav-drop-item"
                    role="menuitem"
                    onClick={() => setDropOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M4 20.5c0-3.59 3.582-6.5 8-6.5s8 2.91 8 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Manage Account
                  </Link>

                  <div className="nav-drop-divider" />

                  <button
                    type="button"
                    className="nav-drop-item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin" className="btn-login">
              <span className="login-icon" aria-hidden="true">↪</span>
              Login
            </Link>
          )}
        </div>

        {/* ── Mobile Hamburger Toggle ── */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle mobile menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            {showProductsLink && (
              <Link to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Products
              </Link>
            )}
            
            {showCartLink && (
              <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                🛒 Cart {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <div className="mobile-divider" />
                <div className="mobile-user-info">
                  {profileImage ? (
                    <img src={profileImage} alt={userName} className="mobile-avatar-img" />
                  ) : (
                    <span className="mobile-avatar-initials">{initials}</span>
                  )}
                  <div>
                    <div className="mobile-user-name">{userName || "User"}</div>
                    <div className="mobile-user-role">{role || "member"}</div>
                  </div>
                </div>
                
                <Link to={dashboardLink} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/account" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Manage Account
                </Link>
                <button type="button" className="mobile-nav-link danger text-left w-full" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/signin" className="btn-login w-full text-center items-center justify-center mt-4" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;