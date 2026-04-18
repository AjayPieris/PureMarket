import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function UserDashboard() {
  const { user, token, isAuthenticated, initialized } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  // Favorites from localStorage
  const [favorites, setFavorites] = useState([]);
  const [favProducts, setFavProducts] = useState([]);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated || !token) {
      navigate("/signin");
      return;
    }

    // Fetch orders
    axios
      .get(`${API_BASE}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setOrders(data))
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));

    // Load favorites from localStorage and fetch product details
    const saved = localStorage.getItem("product_favorites");
    const favIds = saved ? JSON.parse(saved) : [];
    setFavorites(favIds);

    if (favIds.length > 0) {
      axios
        .get(`${API_BASE}/api/products`)
        .then(({ data }) => {
          setFavProducts(data.filter((p) => favIds.includes(p._id)));
        })
        .catch(() => {});
    }
  }, [isAuthenticated, token, navigate, initialized]);

  // Stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pending = orders.filter(
      (o) => o.status === "Pending" || o.status === "Processing",
    ).length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    return { totalOrders, totalSpent, pending, delivered };
  }, [orders]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Recently";

  if (!initialized || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-skeuo-bg pt-20 font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        {/* ── Profile Header ── */}
        <div className="bg-skeuo-bg rounded-[2rem] shadow-skeuo p-8 mb-10 border border-white/40">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-skeuo border-4 border-white flex items-center justify-center bg-skeuo-bg shrink-0 text-4xl font-black text-purple-500">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="text-center md:text-left shadow-skeuo-inner p-6 rounded-3xl flex-1 bg-skeuo-bg flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-700 tracking-tight">
                  Welcome back, {user?.name || "User"}! 👋
                </h1>
                <p className="text-slate-500 mt-2 font-bold text-lg">
                  {user?.email}
                </p>
                <div className="inline-block mt-3 px-4 py-1.5 shadow-skeuo rounded-full text-xs font-bold text-purple-600 tracking-widest uppercase">
                  Member since {memberSince}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 px-6 py-4 rounded-2xl shadow-skeuo bg-skeuo-bg flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Status
                </span>
                <span className="px-3 py-1 rounded-full shadow-skeuo-inner text-green-500 font-black text-sm uppercase tracking-wide">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-skeuo-bg rounded-[2rem] p-6 shadow-skeuo flex flex-col items-center hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 mb-4 rounded-full shadow-skeuo-inner flex items-center justify-center text-blue-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <p className="text-4xl font-black text-slate-700">
              {stats.totalOrders}
            </p>
            <p className="text-xs font-bold tracking-widest text-slate-400 mt-2 uppercase">
              Total Orders
            </p>
          </div>
          <div className="bg-skeuo-bg rounded-[2rem] p-6 shadow-skeuo flex flex-col items-center hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 mb-4 rounded-full shadow-skeuo-inner flex items-center justify-center text-green-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <p className="text-3xl font-black text-slate-700">
              LKR {stats.totalSpent.toFixed(2)}
            </p>
            <p className="text-xs font-bold tracking-widest text-slate-400 mt-2 uppercase">
              Total Spent
            </p>
          </div>
          <div className="bg-skeuo-bg rounded-[2rem] p-6 shadow-skeuo flex flex-col items-center hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 mb-4 rounded-full shadow-skeuo-inner flex items-center justify-center text-amber-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <p className="text-4xl font-black text-slate-700">
              {stats.pending}
            </p>
            <p className="text-xs font-bold tracking-widest text-slate-400 mt-2 uppercase">
              Pending
            </p>
          </div>
          <div className="bg-skeuo-bg rounded-[2rem] p-6 shadow-skeuo flex flex-col items-center hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 mb-4 rounded-full shadow-skeuo-inner flex items-center justify-center text-emerald-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p className="text-4xl font-black text-slate-700">
              {stats.delivered}
            </p>
            <p className="text-xs font-bold tracking-widest text-slate-400 mt-2 uppercase">
              Delivered
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-6 mb-10 justify-center">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-8 py-3 rounded-full font-extrabold text-sm tracking-widest uppercase transition-all duration-300 ${
              activeTab === "orders"
                ? "bg-skeuo-bg shadow-skeuo-inner text-purple-600 scale-95"
                : "bg-skeuo-bg shadow-skeuo text-slate-500 hover:text-slate-800 hover:scale-105 active:shadow-skeuo-inner active:scale-95"
            }`}
          >
            📦 My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-8 py-3 rounded-full font-extrabold text-sm tracking-widest uppercase transition-all duration-300 ${
              activeTab === "favorites"
                ? "bg-skeuo-bg shadow-skeuo-inner text-purple-600 scale-95"
                : "bg-skeuo-bg shadow-skeuo text-slate-500 hover:text-slate-800 hover:scale-105 active:shadow-skeuo-inner active:scale-95"
            }`}
          >
            ❤️ Favorites ({favProducts.length})
          </button>
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "orders" && (
          <div className="bg-skeuo-bg rounded-[3rem] shadow-skeuo-inner p-6 sm:p-10 border border-white/20">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-500 font-bold tracking-widest uppercase">
                <div className="w-12 h-12 rounded-full shadow-skeuo flex items-center justify-center mb-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-slate-300 border-t-purple-600"></div>
                </div>
                Loading your orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="w-32 h-32 rounded-full shadow-skeuo flex items-center justify-center mx-auto mb-8 text-slate-400">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-slate-700 mb-4">
                  No orders yet
                </h3>
                <p className="text-slate-500 mb-10 font-medium text-lg">
                  Start shopping to see your orders here!
                </p>
                <Link
                  to="/products"
                  className="inline-block px-10 py-4 bg-skeuo-bg text-purple-600 font-extrabold rounded-full shadow-skeuo hover:shadow-skeuo-inner hover:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-skeuo-bg p-8 rounded-[2.5rem] shadow-skeuo hover:shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-slate-200/50 pb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 shadow-skeuo-inner rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            ORDER REFERENCE
                          </span>
                          <p className="text-sm text-slate-600 font-bold font-mono tracking-wider">
                            #{order._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <p className="text-base font-extrabold text-slate-700">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-5 bg-skeuo-bg shadow-skeuo-inner px-6 py-3 rounded-3xl">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-skeuo ${
                            order.status === "Delivered"
                              ? "text-green-600"
                              : order.status === "Pending"
                                ? "text-amber-500"
                                : order.status === "Processing"
                                  ? "text-blue-500"
                                  : "text-slate-500"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-2xl font-black text-slate-800">
                          LKR {Number(order.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {(order.orderItems || []).map((item, idx) => {
                        const productImg = item.product?.images?.[0];
                        const vendorImg = item.vendor?.profileImage;
                        const vendorName = item.vendor?.name;
                        return (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row items-center gap-6 bg-skeuo-bg shadow-skeuo-inner rounded-[2rem] p-5"
                          >
                            {/* Product Image */}
                            <div className="w-20 h-20 rounded-[1.5rem] shadow-skeuo overflow-hidden shrink-0 border-[3px] border-white/50 bg-white">
                              {productImg ? (
                                <img
                                  src={productImg}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-wider">
                                  No img
                                </div>
                              )}
                            </div>
                            {/* Details */}
                            <div className="flex flex-col min-w-0 flex-1 text-center sm:text-left">
                              <span className="text-lg font-black text-slate-700 truncate mb-1">
                                {item.product?.name || item.name || "Product"}
                              </span>
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                {vendorImg ? (
                                  <img
                                    src={vendorImg}
                                    alt={vendorName}
                                    className="w-6 h-6 rounded-full object-cover shadow-skeuo-sm border border-white"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full shadow-skeuo-inner flex items-center justify-center text-[10px] font-black text-slate-400">
                                    {vendorName?.charAt(0)?.toUpperCase() ||
                                      "V"}
                                  </div>
                                )}
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">
                                  {vendorName || "Active Vendor"}
                                </span>
                              </div>
                            </div>
                            {/* Qty & Price */}
                            <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 bg-skeuo-bg shadow-skeuo px-5 py-3 rounded-2xl">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Qty: {item.qty}
                              </span>
                              <span className="text-lg font-black text-slate-700">
                                LKR {Number(item.price * item.qty).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {order.shippingAddress && (
                      <div className="mt-8 bg-skeuo-bg shadow-skeuo flex items-center gap-4 rounded-2xl p-5">
                        <div className="w-10 h-10 rounded-full shadow-skeuo-inner flex items-center justify-center text-purple-500 shrink-0">
                          📍
                        </div>
                        <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                          {order.shippingAddress.address},{" "}
                          {order.shippingAddress.city}
                          {order.shippingAddress.postalCode &&
                          order.shippingAddress.postalCode !== "000000"
                            ? `, ${order.shippingAddress.postalCode}`
                            : ""}
                          {order.shippingAddress.country &&
                          order.shippingAddress.country !== "Default Country"
                            ? `, ${order.shippingAddress.country}`
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Favorites Tab ── */}
        {activeTab === "favorites" && (
          <div className="bg-skeuo-bg rounded-[3rem] shadow-skeuo-inner p-8 sm:p-12 border border-white/20">
            {favProducts.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="w-32 h-32 rounded-full shadow-skeuo flex items-center justify-center mx-auto mb-8 text-red-400">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-slate-700 mb-4">
                  No favorites yet
                </h3>
                <p className="text-slate-500 mb-10 font-medium text-lg">
                  Click the heart icon on products you love!
                </p>
                <Link
                  to="/products"
                  className="inline-block px-10 py-4 bg-skeuo-bg text-red-500 font-extrabold rounded-full shadow-skeuo hover:shadow-skeuo-inner hover:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                  Discover Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {favProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="block group"
                  >
                    <div className="bg-skeuo-bg rounded-[2rem] p-5 shadow-skeuo group-hover:shadow-[10px_10px_20px_#c5c5c5,-10px_-10px_20px_#ffffff] group-hover:-translate-y-2 transition-all duration-300">
                      <div className="w-full aspect-square rounded-[1.5rem] shadow-skeuo-inner overflow-hidden mb-5 border-4 border-white/40 bg-white">
                        {product.images?.length > 0 || product.image ? (
                          <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="px-2 text-center text-slate-700">
                        <h4 className="font-black text-lg truncate mb-1 group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h4>
                        <div className="inline-block px-3 py-1 mt-1 mb-3 rounded-full shadow-skeuo-inner text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          by {product.vendor?.name || "Vendor"}
                        </div>
                        <p className="text-xl font-black text-slate-800">
                          LKR {Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
