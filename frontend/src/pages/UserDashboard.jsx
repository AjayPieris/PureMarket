import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
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
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  // Favorites from localStorage
  const [favorites, setFavorites] = useState([]);
  const [favProducts, setFavProducts] = useState([]);

  useEffect(() => {
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
  }, [isAuthenticated, token, navigate]);

  // Stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pending = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    return { totalOrders, totalSpent, pending, delivered };
  }, [orders]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "Recently";

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        {/* ── Profile Header ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 shadow-lg flex items-center justify-center text-white text-4xl font-bold shrink-0">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900">
                Welcome back, {user?.name || "User"}! 👋
              </h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">Member since {memberSince}</p>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-50 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Spent</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-12 h-12 mx-auto mb-3 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.delivered}</p>
            <p className="text-sm text-gray-500 mt-1">Delivered</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "orders" ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            📦 My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "favorites" ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            ❤️ Favorites ({favProducts.length})
          </button>
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-16 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                Loading your orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                <Link to="/products" className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <div key={order._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 font-mono">#{order._id?.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                        <span className="text-lg font-extrabold text-gray-900">${Number(order.totalPrice).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(order.orderItems || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium text-gray-700">{item.name || "Product"}</span>
                          <span className="text-xs text-gray-400">×{item.qty}</span>
                          <span className="text-sm font-bold text-gray-900">${Number(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.shippingAddress && (
                      <p className="text-xs text-gray-400 mt-3">
                        📍 {order.shippingAddress.address}, {order.shippingAddress.city}
                        {order.shippingAddress.postalCode && order.shippingAddress.postalCode !== "000000" ? `, ${order.shippingAddress.postalCode}` : ""}
                        {order.shippingAddress.country && order.shippingAddress.country !== "Default Country" ? `, ${order.shippingAddress.country}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            {favProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">Click the heart icon on products you love!</p>
                <Link to="/products" className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition">
                  Discover Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden">
                      {(product.images?.length > 0 || product.image) ? (
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">by {product.vendor?.name || "Vendor"}</p>
                      <p className="text-sm font-bold text-purple-600 mt-1">${Number(product.price).toFixed(2)}</p>
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
