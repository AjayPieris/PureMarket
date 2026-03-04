import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/* ─── Animated slide-down wrapper ─── */
function SlidePanel({ open, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setHeight(ref.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open, children]);

  return (
    <div
      style={{
        height: open ? height : 0,
        overflow: "hidden",
        transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

/* ─── Stat Card (clickable variant for Total Users) ─── */
function StatCard({ label, value, idx, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border bg-white p-6 shadow-sm transition
        ${onClick ? "cursor-pointer hover:shadow-lg hover:border-purple-300 select-none" : "hover:shadow-md"}
        ${active ? "border-purple-400 ring-2 ring-purple-300" : ""}
      `}
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 tracking-tight">
        {value}
      </p>
      {onClick && (
        <p className="mt-1 text-xs text-purple-400">{active ? "▲ Click to hide" : "▼ Click to expand"}</p>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-hover:ring-2 group-hover:ring-purple-200 transition" />
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  /* ─── Stats ─── */
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  /* ─── Pending vendors ─── */
  const [pending, setPending] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [rowAction, setRowAction] = useState({});

  /* ─── All users panel ─── */
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [blockingId, setBlockingId] = useState(null);

  /* ─── All vendors panel ─── */
  const [showVendors, setShowVendors] = useState(false);
  const [allVendors, setAllVendors] = useState([]);
  const [allVendorsLoading, setAllVendorsLoading] = useState(false);
  const [allVendorsFetched, setAllVendorsFetched] = useState(false);
  const [blockingVendorId, setBlockingVendorId] = useState(null);

  useEffect(() => {
    if (!token) return;
    // Stats
    axios.get(`${API_BASE}/api/admin/stats`, { headers })
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));

    // Pending vendors
    axios.get(`${API_BASE}/api/admin/vendors`, { headers })
      .then(({ data }) => setPending(data.filter((v) => !v.isApproved)))
      .catch(() => setPending([]))
      .finally(() => setVendorsLoading(false));
  }, [token]);

  /* Fetch users only first time panel opens */
  function handleToggleUsers() {
    const next = !showUsers;
    setShowUsers(next);
    if (next && !usersFetched) {
      setUsersLoading(true);
      axios.get(`${API_BASE}/api/admin/users`, { headers })
        .then(({ data }) => { setUsers(data); setUsersFetched(true); })
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }

  async function handleToggleBlock(user) {
    setBlockingId(user._id);
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/admin/users/${user._id}/toggle-block`, {}, { headers }
      );
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, isBlocked: data.isBlocked } : u)
      );
    } catch (e) {
      console.error("Block toggle failed", e);
    } finally {
      setBlockingId(null);
    }
  }

  /* Fetch vendors only first time panel opens */
  function handleToggleVendors() {
    setShowVendors((prev) => {
      const next = !prev;
      if (next && !allVendorsFetched) {
        setAllVendorsLoading(true);
        axios.get(`${API_BASE}/api/admin/vendors`, { headers })
          .then(({ data }) => { setAllVendors(data); setAllVendorsFetched(true); })
          .catch(() => setAllVendors([]))
          .finally(() => setAllVendorsLoading(false));
      }
      return next;
    });
  }

  async function handleToggleVendorBlock(vendor) {
    setBlockingVendorId(vendor._id);
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/admin/users/${vendor._id}/toggle-block`, {}, { headers }
      );
      setAllVendors((prev) =>
        prev.map((v) => v._id === vendor._id ? { ...v, isBlocked: data.isBlocked } : v)
      );
    } catch (e) { console.error("Vendor block toggle failed", e); }
    finally { setBlockingVendorId(null); }
  }

  const handleApprove = useCallback(async (vendor) => {
    setRowAction((s) => ({ ...s, [vendor._id]: "approve" }));
    try {
      await axios.put(`${API_BASE}/api/admin/vendors/${vendor._id}/approve`, {}, { headers });
      setPending((prev) => prev.filter((v) => v._id !== vendor._id));
    } catch (e) { console.error("Approve failed", e); }
    finally { setRowAction((s) => { const c = { ...s }; delete c[vendor._id]; return c; }); }
  }, [token]);

  const handleReject = useCallback(async (vendor) => {
    setRowAction((s) => ({ ...s, [vendor._id]: "reject" }));
    try {
      await axios.delete(`${API_BASE}/api/admin/vendors/${vendor._id}`, { headers });
      setPending((prev) => prev.filter((v) => v._id !== vendor._id));
    } catch (e) { console.error("Reject failed", e); }
    finally { setRowAction((s) => { const c = { ...s }; delete c[vendor._id]; return c; }); }
  }, [token]);

  const statCards = [
    {
      label: "Total Users",
      value: statsLoading ? "…" : (stats?.totalUsers ?? 0).toLocaleString(),
      onClick: handleToggleUsers,
      active: showUsers,
    },
    {
      label: "Total Vendors",
      value: statsLoading ? "…" : (stats?.totalVendors ?? 0).toLocaleString(),
      onClick: handleToggleVendors,
      active: showVendors,
    },
    { label: "Total Products", value: statsLoading ? "…" : (stats?.totalProducts ?? 0).toLocaleString() },
    { label: "Platform Revenue", value: statsLoading ? "…" : `$${Number(stats?.platformRevenue ?? 0).toFixed(2)}` },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight">Admin Dashboard</h1>

        {/* ── Stats ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {statCards.map((s, i) => (
            <StatCard key={s.label} {...s} idx={i} />
          ))}
        </section>

        {/* ── All Users Panel ── */}
        <SlidePanel open={showUsers}>
          <section className="mb-6 rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b">
              <h2 className="font-bold text-slate-700">All Customers</h2>
              <button onClick={() => setShowUsers(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none transition" title="Close">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 text-left font-semibold">Name</th>
                    <th className="p-4 text-left font-semibold">Email</th>
                    <th className="p-4 text-left font-semibold">Total Orders</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">Loading users…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">No users found.</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="border-b last:border-b-0 hover:bg-slate-50 transition">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-slate-500">{u.email}</td>
                      <td className="p-4 text-center font-semibold text-purple-600">{u.totalOrders ?? 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.isBlocked
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {u.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleBlock(u)}
                          disabled={blockingId === u._id}
                          className={`relative px-3 py-1.5 text-xs font-semibold rounded-md border transition
                            ${u.isBlocked
                              ? "border-green-300 text-green-700 hover:bg-green-50"
                              : "border-red-200 text-red-600 hover:bg-red-50"
                            }
                            disabled:opacity-50 overflow-hidden
                          `}
                        >
                          {blockingId === u._id ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-current rounded-full border-t-transparent animate-spin" />
                              {u.isBlocked ? "Unblocking…" : "Blocking…"}
                            </span>
                          ) : (
                            u.isBlocked ? "Unblock" : "Block"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </SlidePanel>

        {/* ── All Vendors Panel ── */}
        <SlidePanel open={showVendors}>
          <section className="mb-6 rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b">
              <h2 className="font-bold text-slate-700">All Vendors</h2>
              <button onClick={() => setShowVendors(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none transition" title="Close">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 text-left font-semibold">Name</th>
                    <th className="p-4 text-left font-semibold">Email</th>
                    <th className="p-4 text-left font-semibold">Store Link</th>
                    <th className="p-4 text-left font-semibold">Products</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allVendorsLoading ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Loading vendors…</td></tr>
                  ) : allVendors.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">No vendors found.</td></tr>
                  ) : allVendors.map((v) => (
                    <tr key={v._id} className="border-b last:border-b-0 hover:bg-slate-50 transition">
                      <td className="p-4 font-medium">{v.name}</td>
                      <td className="p-4 text-slate-500">{v.email}</td>
                      <td className="p-4">
                        {v.storeLink ? (
                          <a href={v.storeLink} target="_blank" rel="noopener noreferrer"
                            className="text-purple-600 underline text-xs break-all hover:text-purple-800">
                            {v.storeLink}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Not submitted</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-semibold text-purple-600">{v.totalProducts ?? 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          !v.isApproved ? "bg-amber-100 text-amber-700"
                          : v.isBlocked ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                        }`}>
                          {!v.isApproved ? "Pending" : v.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleVendorBlock(v)}
                          disabled={blockingVendorId === v._id}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition
                            ${v.isBlocked
                              ? "border-green-300 text-green-700 hover:bg-green-50"
                              : "border-red-200 text-red-600 hover:bg-red-50"
                            } disabled:opacity-50`}
                        >
                          {blockingVendorId === v._id ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-current rounded-full border-t-transparent animate-spin" />
                              {v.isBlocked ? "Unblocking…" : "Blocking…"}
                            </span>
                          ) : (
                            v.isBlocked ? "Unblock" : "Block"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </SlidePanel>

        {/* ── Pending Vendor Approvals ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Pending Vendor Approvals</h2>
          <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold">Vendor Name</th>
                  <th className="p-4 text-left font-semibold">Email</th>
                  <th className="p-4 text-left font-semibold">Store Link</th>
                  <th className="p-4 text-left font-semibold">Registered</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorsLoading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">Loading…</td></tr>
                ) : pending.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">No pending vendors 🎉</td></tr>
                ) : pending.map((v) => {
                  const isApproving = rowAction[v._id] === "approve";
                  const isRejecting = rowAction[v._id] === "reject";
                  const disabled = isApproving || isRejecting;
                  return (
                    <tr key={v._id} className="border-b last:border-b-0 hover:bg-slate-50 transition">
                      <td className="p-4 font-semibold">{v.name}</td>
                      <td className="p-4">{v.email}</td>
                      <td className="p-4">
                        {v.storeLink ? (
                          <a href={v.storeLink} target="_blank" rel="noopener noreferrer"
                            className="text-purple-600 underline text-xs break-all hover:text-purple-800">
                            {v.storeLink}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Not submitted</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow hover:scale-[1.03] transition disabled:opacity-60"
                            onClick={() => handleApprove(v)} disabled={disabled}
                          >
                            {isApproving ? "Approving…" : "Approve"}
                          </button>
                          <button
                            className="px-3 py-1.5 text-xs font-semibold rounded-md border hover:bg-red-50 text-red-600 border-red-200 transition disabled:opacity-60"
                            onClick={() => handleReject(v)} disabled={disabled}
                          >
                            {isRejecting ? "Rejecting…" : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
