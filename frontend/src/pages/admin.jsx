import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const initialPendingVendors = [];




function StatCard({ label, value, idx }) {
  return (
    <div
      className="group relative rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-purple-200"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 tracking-tight">
        {value}
      </p>
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-hover:ring-2 group-hover:ring-purple-300 transition" />
    </div>
  );
}

function VendorRow({ v, actionState, onApprove, onReject }) {
  const isApproving = actionState === "approve";
  const isRejecting = actionState === "reject";
  const disabled = isApproving || isRejecting;

  return (
    <tr className="border-b last:border-b-0 hover:bg-slate-50 transition">
      <td className="p-4 font-semibold">{v.name}</td>
      <td className="p-4">{v.email}</td>
      <td className="p-4">{v.type}</td>
      <td className="p-4">{v.registered}</td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow hover:scale-[1.03] transition disabled:opacity-60 disabled:hover:scale-100"
            onClick={() => onApprove(v)}
            disabled={disabled}
          >
            {isApproving ? "Approving..." : "Approve"}
          </button>
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-md border hover:bg-slate-100 transition disabled:opacity-60"
            onClick={() => onReject(v)}
            disabled={disabled}
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function ActivityItem({ a }) {
  const variantClass =
    a.iconVariant === "primary"
      ? "bg-gradient-to-br from-purple-600 to-indigo-500"
      : a.iconVariant === "accent"
      ? "bg-gradient-to-br from-fuchsia-500 to-pink-500"
      : "bg-gradient-to-br from-emerald-500 to-cyan-500";
  return (
    <div className="flex gap-4 items-start">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow ${variantClass}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {a.icon}
        </svg>
      </div>
      <div>
        <p className="font-semibold">{a.title}</p>
        <p className="text-sm text-slate-500">{a.detail}</p>
        <p className="mt-1 text-xs text-slate-400">{a.time}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [pending, setPending] = useState(initialPendingVendors);
  const [rowAction, setRowAction] = useState({});

  // ── Real stats ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setStats(data))
      .catch((err) => {
        console.error("Stats fetch error:", err.response?.data || err.message);
        setStats(null);
      })
      .finally(() => setStatsLoading(false));
  }, [token]);

  const statCards = statsLoading || !stats
    ? [
        { label: "Total Users", value: "…" },
        { label: "Total Vendors", value: "…" },
        { label: "Total Products", value: "…" },
        { label: "Platform Revenue", value: "…" },
      ]
    : [
        { label: "Total Users", value: stats.totalUsers.toLocaleString() },
        { label: "Total Vendors", value: stats.totalVendors.toLocaleString() },
        { label: "Total Products", value: stats.totalProducts.toLocaleString() },
        { label: "Platform Revenue", value: `$${Number(stats.platformRevenue).toFixed(2)}` },
      ];

  const handleApprove = useCallback(
    async (vendor) => {
      setRowAction((s) => ({ ...s, [vendor.email]: "approve" }));
      try {
        await new Promise((r) => setTimeout(r, 600));
        setPending((prev) => prev.filter((v) => v.email !== vendor.email));
      } catch (e) {
        console.error("Approve failed", e);
      } finally {
        setRowAction((s) => {
          const copy = { ...s };
          delete copy[vendor.email];
          return copy;
        });
      }
    },
    [setPending]
  );

  const handleReject = useCallback(
    async (vendor) => {
      setRowAction((s) => ({ ...s, [vendor.email]: "reject" }));
      try {
        await new Promise((r) => setTimeout(r, 600));
        setPending((prev) => prev.filter((v) => v.email !== vendor.email));
      } catch (e) {
        console.error("Reject failed", e);
      } finally {
        setRowAction((s) => {
          const copy = { ...s };
          delete copy[vendor.email];
          return copy;
        });
      }
    },
    [setPending]
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight">
          Admin Dashboard
        </h1>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {statCards.map((s, i) => (
            <StatCard key={s.label} {...s} idx={i} />
          ))}
        </section>

        {/* Pending Vendor Approvals */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Pending Vendor Approvals</h2>
          <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold">Vendor Name</th>
                  <th className="p-4 text-left font-semibold">Email</th>
                  <th className="p-4 text-left font-semibold">Business Type</th>
                  <th className="p-4 text-left font-semibold">Registered</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((v) => (
                  <VendorRow
                    key={v.email}
                    v={v}
                    actionState={rowAction[v.email]}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
                {pending.length === 0 && (
                  <tr>
                    <td
                      className="p-6 text-center text-slate-500"
                      colSpan={5}
                    >
                      No pending vendors 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
