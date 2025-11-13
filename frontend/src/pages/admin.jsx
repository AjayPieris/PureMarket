import React, { useCallback, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

/*
AdminDashboard (Tailwind)
- Replaces inline styles with Tailwind utility classes
- Includes animated stat cards & activity timeline
- Uses responsive grids
- Placeholder data arrays for easy future mapping
*/

const stats = [
  { label: "Total Users", value: "50,234", change: "+12% this month" },
  { label: "Total Vendors", value: "542", change: "+8% this month" },
  { label: "Total Products", value: "10,456", change: "+15% this month" },
  { label: "Platform Revenue", value: "$245,890", change: "+22% this month" },
];

const initialPendingVendors = [
  {
    name: "TechVendor LLC",
    email: "tech@vendor.com",
    type: "Electronics",
    registered: "2024-01-15",
  },
  {
    name: "Fashion Hub",
    email: "info@fashionhub.com",
    type: "Fashion",
    registered: "2024-01-14",
  },
  {
    name: "SportsPro",
    email: "contact@sportspro.com",
    type: "Sports",
    registered: "2024-01-13",
  },
];

const activities = [
  {
    iconVariant: "primary",
    title: "New vendor approved",
    detail: "TechGear Store was approved and is now active",
    time: "2 hours ago",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 0 2 2 4-4"
      />
    ),
  },
  {
    iconVariant: "accent",
    title: "Product flagged for review",
    detail: "Product #12345 reported by multiple users",
    time: "5 hours ago",
    icon: (
      <>
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </>
    ),
  },
  {
    iconVariant: "green",
    title: "High revenue day",
    detail: "Platform generated $15,234 today",
    time: "1 day ago",
    icon: (
      <>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </>
    ),
  },
];

function StatCard({ label, value, change, idx }) {
  return (
    <div
      className="group relative rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-purple-200"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 tracking-tight">
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-emerald-500">{change}</p>
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
  const [pending, setPending] = useState(initialPendingVendors);
  // Tracks per-vendor action state: { [email]: 'approve' | 'reject' }
  const [rowAction, setRowAction] = useState({});

  // Simulate an API call; replace with real fetch/axios calls
  const simulateApi = (ms = 600) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleApprove = useCallback(
    async (vendor) => {
      setRowAction((s) => ({ ...s, [vendor.email]: "approve" }));
      try {
        // await fetch('/api/vendors/approve', { method: 'POST', body: JSON.stringify({ email: vendor.email }) })
        await simulateApi();
        setPending((prev) => prev.filter((v) => v.email !== vendor.email));
        // Optional: toast/notification here
        // e.g., toast.success(`${vendor.name} approved`)
      } catch (e) {
        console.error("Approve failed", e);
        // Optional: toast.error('Failed to approve vendor')
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
        // await fetch('/api/vendors/reject', { method: 'POST', body: JSON.stringify({ email: vendor.email }) })
        await simulateApi();
        setPending((prev) => prev.filter((v) => v.email !== vendor.email));
        // Optional: toast/notification here
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
          {stats.map((s, i) => (
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