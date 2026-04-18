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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "Delivered" } : o,
        ),
      );
      toast.success("Order marked as Delivered!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filtered =
    filter === "all"
      ? orders
      : filter === "Pending"
        ? orders.filter(
            (o) => o.status !== "Delivered" && o.status !== "Cancelled",
          )
        : orders.filter((o) => o.status === filter);

  const pendingCount = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled",
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div className="min-h-screen flex flex-col bg-skeuo-bg pt-20 font-sans antialiased text-slate-800">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-16 pb-10 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 bg-skeuo-bg p-6 sm:p-8 rounded-[2.5rem] shadow-skeuo border border-white/30">
          <div>
            <Link
              to="/vendor"
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-purple-600 mb-4 inline-flex items-center gap-2 px-6 py-2 rounded-full shadow-skeuo hover:scale-95 active:shadow-skeuo-inner transition-all duration-300"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-700 tracking-tight flex items-center gap-3">
              <span className="w-12 h-12 rounded-full shadow-skeuo-inner flex items-center justify-center text-2xl">
                📦
              </span>
              Store Orders
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-4 tracking-wide">
              {orders.length} total order{orders.length !== 1 ? "s" : ""}{" "}
              <span className="mx-2 text-slate-300">•</span>{" "}
              <span className="text-amber-500">{pendingCount} pending</span>{" "}
              <span className="mx-2 text-slate-300">•</span>{" "}
              <span className="text-green-500">{deliveredCount} delivered</span>
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-10">
          {[
            { key: "all", label: `All (${orders.length})` },
            { key: "Pending", label: `⏳ Pending (${pendingCount})` },
            { key: "Delivered", label: `✅ Delivered (${deliveredCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                filter === tab.key
                  ? "bg-skeuo-bg shadow-skeuo-inner text-purple-600 scale-95"
                  : "bg-skeuo-bg shadow-skeuo text-slate-500 hover:text-purple-500 hover:scale-105 active:shadow-skeuo-inner active:scale-95"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 font-bold tracking-widest uppercase">
            <div className="w-16 h-16 rounded-full shadow-skeuo flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-purple-600"></div>
            </div>
            Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 px-6 rounded-[3rem] shadow-skeuo-inner bg-skeuo-bg border border-white/20">
            <div className="w-24 h-24 rounded-full shadow-skeuo flex flex-col items-center justify-center mx-auto mb-8 text-4xl text-slate-400">
              📦
            </div>
            <h3 className="text-2xl font-black text-slate-700 mb-3">
              {filter === "all"
                ? "No orders yet"
                : `No ${filter.toLowerCase()} orders`}
            </h3>
            <p className="text-slate-500 font-bold">
              {filter === "all"
                ? "When customers buy your products, orders will appear here."
                : "Try switching to a different filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {(() => {
              // Group orders by customer
              const grouped = {};
              filtered.forEach((order) => {
                const custId =
                  order.customer?._id || order.customer || "unknown";
                if (!grouped[custId]) {
                  grouped[custId] = { customer: order.customer, orders: [] };
                }
                grouped[custId].orders.push(order);
              });

              return Object.entries(grouped).map(([custId, group]) => (
                <div
                  key={custId}
                  className="rounded-[2rem] bg-skeuo-bg shadow-skeuo p-6 sm:p-8 border border-white/20"
                >
                  {/* Customer Header — shown once */}
                  <div className="flex flex-wrap items-center gap-5 pb-6 border-b border-slate-200/50 mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-skeuo-inner border-2 border-white/40 bg-white flex items-center justify-center text-slate-400 font-black text-lg shrink-0">
                      {group.customer?.profileImage ? (
                        <img
                          src={group.customer.profileImage}
                          alt={group.customer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        group.customer?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-lg mb-1">
                        {group.customer?.name || "Unknown Customer"}
                      </p>
                      <p className="text-xs font-bold text-slate-400 tracking-wider">
                        {group.customer?.email}
                      </p>
                    </div>
                  </div>

                  {/* All orders from this customer */}
                  <div className="space-y-6">
                    {group.orders.map((order) => {
                      const myItems = (order.orderItems || []).filter((it) => {
                        const v =
                          it.vendor?._id?.toString?.() ||
                          it.vendor?.toString?.() ||
                          it.vendor;
                        return v === vendorId;
                      });

                      return (
                        <div
                          key={order._id}
                          className="p-6 rounded-[1.5rem] shadow-skeuo-inner bg-skeuo-bg border border-white/20"
                        >
                          {/* Order meta */}
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/50">
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-skeuo-bg shadow-skeuo px-4 py-2 rounded-full">
                                #{order._id?.slice(-8).toUpperCase()}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                              <span
                                className={`px-5 py-2.5 rounded-full shadow-skeuo-inner text-xs font-black uppercase tracking-widest ${
                                  order.status === "Delivered"
                                    ? "text-green-500"
                                    : "text-amber-500"
                                }`}
                              >
                                {order.status === "Delivered"
                                  ? "✅ Delivered"
                                  : "⏳ Pending"}
                              </span>
                              {order.status !== "Delivered" && (
                                <button
                                  onClick={() => handleMarkDelivered(order._id)}
                                  disabled={updatingOrderId === order._id}
                                  className="px-6 py-2.5 rounded-full shadow-skeuo bg-skeuo-bg text-green-500 text-xs font-black uppercase tracking-widest hover:scale-95 active:shadow-skeuo-inner transition-all duration-300 disabled:opacity-50"
                                >
                                  {updatingOrderId === order._id
                                    ? "Updating…"
                                    : "Mark Delivered"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Product items */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {myItems.map((item, idx) => {
                              const productImg =
                                item.product?.images?.[0] || null;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 bg-skeuo-bg shadow-skeuo rounded-[1.5rem] p-4 hover:shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#ffffff] transition-all"
                                >
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
                                      {item.product?.name ||
                                        item.name ||
                                        "Product"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Qty:{" "}
                                      <span className="font-semibold text-gray-600">
                                        {item.qty}
                                      </span>
                                      &nbsp;&middot;&nbsp;
                                      <span className="font-bold text-gray-800">
                                        LKR{" "}
                                        {Number(item.price * item.qty).toFixed(
                                          2,
                                        )}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
