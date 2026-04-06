import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../page_style/admin.css";
import logo from "../assets/logo.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/* ─── Sidebar Nav Items ─── */
const NAV_ITEMS = [
  { id: "overview",   icon: "📊", label: "Overview" },
  { id: "approvals",  icon: "⏳", label: "Approvals",  badge: true },
  { id: "vendors",    icon: "🏪", label: "Shops / Vendors" },
  { id: "users",      icon: "👥", label: "Users" },
];

/* ─── Mini Spinner ─── */
function Spin() { return <span className="adm-spinner" />; }

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-icon">{icon}</div>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab]     = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ─── Stats ─── */
  const [stats, setStats]           = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  /* ─── Pending vendors ─── */
  const [pending, setPending]           = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [rowAction, setRowAction]       = useState({});

  /* ─── All users ─── */
  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [blockingId, setBlockingId]     = useState(null);

  /* ─── All vendors ─── */
  const [allVendors, setAllVendors]                 = useState([]);
  const [allVendorsLoading, setAllVendorsLoading]   = useState(false);
  const [allVendorsFetched, setAllVendorsFetched]   = useState(false);
  const [blockingVendorId, setBlockingVendorId]     = useState(null);

  /* ─── Boot fetch ─── */
  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE}/api/admin/stats`, { headers })
      .then(({ data }) => setStats(data)).catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
    axios.get(`${API_BASE}/api/admin/vendors`, { headers })
      .then(({ data }) => setPending(data.filter(v => !v.isApproved))).catch(() => setPending([]))
      .finally(() => setVendorsLoading(false));
  }, [token]);

  /* ─── Lazy-load when tab opens ─── */
  useEffect(() => {
    if (activeTab === "users" && !usersFetched) {
      setUsersLoading(true);
      axios.get(`${API_BASE}/api/admin/users`, { headers })
        .then(({ data }) => { setUsers(data); setUsersFetched(true); })
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
    if (activeTab === "vendors" && !allVendorsFetched) {
      setAllVendorsLoading(true);
      axios.get(`${API_BASE}/api/admin/vendors`, { headers })
        .then(({ data }) => { setAllVendors(data); setAllVendorsFetched(true); })
        .catch(() => setAllVendors([]))
        .finally(() => setAllVendorsLoading(false));
    }
  }, [activeTab]);

  /* ─── Block toggle user ─── */
  async function handleToggleBlock(u) {
    setBlockingId(u._id);
    try {
      const { data } = await axios.put(`${API_BASE}/api/admin/users/${u._id}/toggle-block`, {}, { headers });
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isBlocked: data.isBlocked } : x));
    } finally { setBlockingId(null); }
  }

  /* ─── Block toggle vendor ─── */
  async function handleToggleVendorBlock(v) {
    setBlockingVendorId(v._id);
    try {
      const { data } = await axios.put(`${API_BASE}/api/admin/users/${v._id}/toggle-block`, {}, { headers });
      setAllVendors(prev => prev.map(x => x._id === v._id ? { ...x, isBlocked: data.isBlocked } : x));
    } finally { setBlockingVendorId(null); }
  }

  /* ─── Approve / Reject ─── */
  const handleApprove = useCallback(async (vendor) => {
    setRowAction(s => ({ ...s, [vendor._id]: "approve" }));
    try {
      await axios.put(`${API_BASE}/api/admin/vendors/${vendor._id}/approve`, {}, { headers });
      setPending(prev => prev.filter(v => v._id !== vendor._id));
    } finally { setRowAction(s => { const c = {...s}; delete c[vendor._id]; return c; }); }
  }, [token]);

  const handleReject = useCallback(async (vendor) => {
    setRowAction(s => ({ ...s, [vendor._id]: "reject" }));
    try {
      await axios.delete(`${API_BASE}/api/admin/vendors/${vendor._id}`, { headers });
      setPending(prev => prev.filter(v => v._id !== vendor._id));
    } finally { setRowAction(s => { const c = {...s}; delete c[vendor._id]; return c; }); }
  }, [token]);

  const initials = (user?.name || "A").charAt(0).toUpperCase();

  /* ─── PAGE TITLES ─── */
  const PAGE_TITLE = { overview: "Overview", approvals: "Vendor Approvals", vendors: "Shops & Vendors", users: "All Users" };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="adm-shell">

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Brand */}
        <div className="adm-sidebar-brand">
          <img src={logo} alt="PureMarket" />
          <span className="adm-sidebar-brand-text">PureMarket</span>
          <span className="adm-sidebar-badge">Admin</span>
        </div>

        {/* Nav */}
        <nav className="adm-nav">
          <div className="adm-nav-section-label">Main Menu</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`adm-nav-item${activeTab === item.id ? " active" : ""}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="adm-nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && pending.length > 0 && (
                <span className="adm-nav-badge">{pending.length}</span>
              )}
            </button>
          ))}

          <div className="adm-nav-section-label" style={{ marginTop: 12 }}>Quick Links</div>
          <button className="adm-nav-item" onClick={() => navigate("/")}>
            <span className="adm-nav-icon">🏠</span> Back to Site
          </button>
        </nav>

        {/* Footer: logout */}
        <div className="adm-sidebar-footer">
          <button className="adm-nav-item" onClick={() => { logout(); navigate("/signin"); }}>
            <span className="adm-nav-icon">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="adm-main">

        {/* Topbar */}
        <div className="adm-topbar">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="adm-hamburger"
            aria-label="Toggle sidebar"
          >☰</button>

          <span className="adm-topbar-title">{PAGE_TITLE[activeTab]}</span>
          <div className="adm-topbar-right">
            {/* Admin info */}
            <div style={{ textAlign: "right", marginRight: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1348", lineHeight: 1.2 }}>{user?.name || "Admin"}</span>
              <span style={{ fontSize: 11, color: "#8a93b0" }}>{user?.email || ""}</span>
            </div>
            {/* Avatar */}
            <div className="adm-avatar" title={user?.name || "Admin"} style={{ flexShrink: 0 }}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="adm-content" key={activeTab}>

          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && (
            <>
              {/* ── Admin Profile Card ── */}
              <div style={{
                background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)",
                borderRadius: 20,
                padding: "24px 28px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 20,
                boxShadow: "0 8px 32px rgba(109,40,217,0.3)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Background glow */}
                <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }} />
                <div style={{ position:"absolute", bottom:-30, left:120, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />

                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  border: "3px solid rgba(255,255,255,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  ) : (
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
                      {(user?.name || "A").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                    Administrator
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name || "Admin"}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>✉</span>
                    <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email || "—"}</span>
                  </div>
                </div>

                {/* Badge */}
                <div style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 999, padding: "6px 16px",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                  letterSpacing: "0.05em", flexShrink: 0,
                }}>
                  🛡 Admin
                </div>
              </div>

              {/* ── Stats ── */}
              <div className="adm-stats-grid">
                <StatCard icon="👥" label="Total Users"    value={statsLoading ? "…" : (stats?.totalUsers ?? 0).toLocaleString()}    sub="Registered customers" />
                <StatCard icon="🏪" label="Total Vendors"  value={statsLoading ? "…" : (stats?.totalVendors ?? 0).toLocaleString()}  sub="Active shops" />
                <StatCard icon="📦" label="Total Products" value={statsLoading ? "…" : (stats?.totalProducts ?? 0).toLocaleString()} sub="Listed items" />
                <StatCard icon="💰" label="Platform Revenue" value={statsLoading ? "…" : `$${Number(stats?.platformRevenue ?? 0).toFixed(2)}`} sub="All-time earnings" />
              </div>

              {/* Quick access */}
              <h2 className="adm-section-title">Quick Access</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                {[
                  { id: "approvals", icon: "⏳", label: "Pending Approvals", count: pending.length, color: "#fef3c7", accent: "#d97706" },
                  { id: "vendors",   icon: "🏪", label: "Manage Shops",      count: statsLoading ? "…" : (stats?.totalVendors ?? 0), color: "#ede9fe", accent: "#6d28d9" },
                  { id: "users",     icon: "👥", label: "Manage Users",      count: statsLoading ? "…" : (stats?.totalUsers ?? 0),   color: "#dbeafe", accent: "#2563eb" },
                ].map(q => (
                  <button key={q.id} onClick={() => setActiveTab(q.id)}
                    style={{ background: q.color, border: "none", borderRadius: 14, padding: "18px 20px", cursor: "pointer", textAlign: "left", transition: "transform 0.15s, box-shadow 0.15s", fontFamily: "Outfit,sans-serif" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 22px ${q.color}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{q.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: q.accent }}>{q.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: q.accent, lineHeight: 1.2 }}>{q.count}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ══ APPROVALS ══ */}
          {activeTab === "approvals" && (
            <>
              <h2 className="adm-section-title">
                Pending Vendor Approvals
                {pending.length > 0 && <span>{pending.length} pending</span>}
              </h2>
              <div className="adm-table-card">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Vendor</th><th>Email</th><th>Store Link</th><th>Registered</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorsLoading ? (
                      <tr><td colSpan={5} className="adm-empty"><Spin /> Loading…</td></tr>
                    ) : pending.length === 0 ? (
                      <tr><td colSpan={5} className="adm-empty">🎉 No pending approvals</td></tr>
                    ) : pending.map(v => {
                      const isApproving = rowAction[v._id] === "approve";
                      const isRejecting = rowAction[v._id] === "reject";
                      const busy = isApproving || isRejecting;
                      return (
                        <tr key={v._id}>
                          <td style={{ fontWeight: 600 }}>{v.name}</td>
                          <td style={{ color: "#6b7280" }}>{v.email}</td>
                          <td>
                            {v.storeLink ? (
                              <a href={v.storeLink} target="_blank" rel="noopener noreferrer"
                                style={{ color: "#6d28d9", textDecoration: "underline", fontSize: 12, wordBreak: "break-all" }}>
                                {v.storeLink}
                              </a>
                            ) : <span style={{ color: "#c0c4d0", fontStyle: "italic", fontSize: 12 }}>Not submitted</span>}
                          </td>
                          <td style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(v.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="adm-btn adm-btn-primary" onClick={() => handleApprove(v)} disabled={busy}>
                                {isApproving ? <Spin /> : "✓ Approve"}
                              </button>
                              <button className="adm-btn adm-btn-danger" onClick={() => handleReject(v)} disabled={busy}>
                                {isRejecting ? <Spin /> : "✕ Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══ VENDORS ══ */}
          {activeTab === "vendors" && (
            <>
              <h2 className="adm-section-title">
                All Shops & Vendors
                {!allVendorsLoading && <span>{allVendors.length} total</span>}
              </h2>
              <div className="adm-table-card">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Store Link</th><th>Products</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allVendorsLoading ? (
                      <tr><td colSpan={6} className="adm-empty"><Spin /> Loading vendors…</td></tr>
                    ) : allVendors.length === 0 ? (
                      <tr><td colSpan={6} className="adm-empty">No vendors found.</td></tr>
                    ) : allVendors.map(v => (
                      <tr key={v._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: "linear-gradient(135deg,#ede9fe,#c4b5fd)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, overflow: "hidden", fontSize: 14, fontWeight: 700, color: "#6d28d9",
                              border: "2px solid #ede9fe",
                            }}>
                              {v.profileImage
                                ? <img src={v.profileImage} alt={v.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                : (v.name || "V").charAt(0).toUpperCase()
                              }
                            </div>
                            <span style={{ fontWeight: 600 }}>{v.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "#6b7280" }}>{v.email}</td>
                        <td>
                          {v.storeLink
                            ? <a href={v.storeLink} target="_blank" rel="noopener noreferrer"
                                style={{ color: "#6d28d9", textDecoration: "underline", fontSize: 12, wordBreak: "break-all" }}>{v.storeLink}</a>
                            : <span style={{ color: "#c0c4d0", fontStyle: "italic", fontSize: 12 }}>Not submitted</span>}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700, color: "#6d28d9" }}>{v.totalProducts ?? 0}</td>
                        <td>
                          <span className={`adm-badge ${!v.isApproved ? "adm-badge-amber" : v.isBlocked ? "adm-badge-red" : "adm-badge-green"}`}>
                            {!v.isApproved ? "Pending" : v.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`adm-btn ${v.isBlocked ? "adm-btn-success" : "adm-btn-danger"}`}
                            onClick={() => handleToggleVendorBlock(v)}
                            disabled={blockingVendorId === v._id}
                          >
                            {blockingVendorId === v._id ? <Spin /> : v.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══ USERS ══ */}
          {activeTab === "users" && (
            <>
              <h2 className="adm-section-title">
                All Customers
                {!usersLoading && <span>{users.length} total</span>}
              </h2>
              <div className="adm-table-card">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Orders</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan={5} className="adm-empty"><Spin /> Loading users…</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={5} className="adm-empty">No users found.</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: "linear-gradient(135deg,#dbeafe,#93c5fd)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, overflow: "hidden", fontSize: 14, fontWeight: 700, color: "#2563eb",
                              border: "2px solid #dbeafe",
                            }}>
                              {u.profileImage
                                ? <img src={u.profileImage} alt={u.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                : (u.name || "U").charAt(0).toUpperCase()
                              }
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "#6b7280" }}>{u.email}</td>
                        <td style={{ textAlign: "center", fontWeight: 700, color: "#6d28d9" }}>{u.totalOrders ?? 0}</td>
                        <td>
                          <span className={`adm-badge ${u.isBlocked ? "adm-badge-red" : "adm-badge-green"}`}>
                            {u.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`adm-btn ${u.isBlocked ? "adm-btn-success" : "adm-btn-danger"}`}
                            onClick={() => handleToggleBlock(u)}
                            disabled={blockingId === u._id}
                          >
                            {blockingId === u._id ? <Spin /> : u.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:49 }} />
      )}
    </div>
  );
}
