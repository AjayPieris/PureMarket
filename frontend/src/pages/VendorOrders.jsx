import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function VendorOrders() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "Pending" | "Delivered"

  const vendorId = user?._id || localStorage.getItem("userId");

  useEffect(() => {
    if (!token || !vendorId) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/api/orders/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token, vendorId]);

  async function handleMarkDelivered(orderId) {
    setUpdatingOrderId(orderId);
    try {
      await axios.put(
        `${API_BASE}/api/orders/${orderId}/vendor-status`,
        { status: "Delivered" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "Delivered" } : o))
      );
      toast.success("Order marked as Delivered!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const pendingCount = orders.filter((o) => o.status !== "Delivered").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/vendor"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium mb-2 inline-flex items-center gap-1"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900">📦 Store Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              {orders.length} total order{orders.length !== 1 ? "s" : ""} &middot;{" "}
              <span className="text-amber-600 font-semibold">{pendingCount} pending</span> &middot;{" "}
              <span className="text-green-600 font-semibold">{deliveredCount} delivered</span>
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "all", label: `All (${orders.length})` },
            { key: "Pending", label: `⏳ Pending (${pendingCount})` },
            { key: "Delivered", label: `✅ Delivered (${deliveredCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === tab.key
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
            Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 text-3xl">
              📦
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === "all" ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
            </h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "When customers buy your products, orders will appear here."
                : "Try switching to a different filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const myItems = (order.orderItems || []).filter(
                (it) =>
                  (it.vendor?.toString?.() ||
                    it.vendor?._id?.toString?.() ||
                    it.vendor) === vendorId
              );

              return (
                <div
                  key={order._id}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* Customer Photo */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {order.customer?.profileImage ? (
                          <img
                            src={order.customer.profileImage}
                            alt={order.customer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          order.customer?.name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {order.customer?.name || "Unknown Customer"}
                        </p>
                        <p className="text-xs text-gray-400">{order.customer?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Product Items */}
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-3">
                        {myItems.map((item, idx) => {
                          const productImg =
                            item.product?.images?.[0] || null;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                            >
                              {/* Product Photo */}
                              {productImg ? (
                                <img
                                  src={productImg}
                                  alt={item.name}
                                  className="w-11 h-11 rounded-lg object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0">
                                  No img
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {item.name || "Product"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Qty: <span className="font-semibold text-gray-600">{item.qty}</span>
                                  &nbsp;&middot;&nbsp;
                                  <span className="font-bold text-gray-800">
                                    ${Number(item.price * item.qty).toFixed(2)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.status === "Delivered" ? "✅ Delivered" : "⏳ Pending"}
                      </span>
                      {order.status !== "Delivered" && (
                        <button
                          onClick={() => handleMarkDelivered(order._id)}
                          disabled={updatingOrderId === order._id}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow hover:scale-[1.03] transition disabled:opacity-60"
                        >
                          {updatingOrderId === order._id
                            ? "Updating…"
                            : "Mark Delivered"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
