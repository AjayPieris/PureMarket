import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../page_style/admin.css";
import logo from "../assets/logo.png";
import {
  LayoutDashboard,
  Clock,
  Store,
  Users,
  Home,
  LogOut,
  Menu,
  Users2,
  Package,
  DollarSign,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  UserX,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const NAV_ITEMS = [
  { id: "overview",  icon: LayoutDashboard, label: "Overview" },
  { id: "approvals", icon: Clock,           label: "Approvals",      badge: true },
  { id: "vendors",   icon: Store,           label: "Shops / Vendors" },
  { id: "users",     icon: Users,           label: "Users" },
];

function Spin() {
  return <Loader2 className="adm-spinner-icon" size={14} />;
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-icon-wrap" style={{ "--card-accent": color }}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
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

  const [stats, setStats]               = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [pending, setPending]               = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [rowAction, setRowAction]           = useState({});

  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [blockingId, setBlockingId]     = useState(null);

  const [allVendors, setAllVendors]                 = useState([]);
  const [allVendorsLoading, setAllVendorsLoading]   = useState(false);
  const [allVendorsFetched, setAllVendorsFetched]   = useState(false);
  const [blockingVendorId, setBlockingVendorId]     = useState(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE}/api/admin/stats`, { headers })
      .then(({ data }) => setStats(data)).catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
    axios.get(`${API_BASE}/api/admin/vendors`, { headers })
      .then(({ data }) => setPending(data.filter(v => !v.isApproved))).catch(() => setPending([]))
      .finally(() => setVendorsLoading(false));
  }, [token]);

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

  async function handleToggleBlock(u) {
    setBlockingId(u._id);
    try {
      const { data } = await axios.put(`${API_BASE}/api/admin/users/${u._id}/toggle-block`, {}, { headers });
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isBlocked: data.isBlocked } : x));
    } finally { setBlockingId(null); }
  }

  async function handleToggleVendorBlock(v) {
    setBlockingVendorId(v._id);
    try {
      const { data } = await axios.put(`${API_BASE}/api/admin/users/${v._id}/toggle-block`, {}, { headers });
      setAllVendors(prev => prev.map(x => x._id === v._id ? { ...x, isBlocked: data.isBlocked } : x));
    } finally { setBlockingVendorId(null); }
  }

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
  const PAGE_TITLE = { overview: "Overview", approvals: "Vendor Approvals", vendors: "Shops & Vendors", users: "All Users" };

  return (
    <div className="adm-shell">

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="adm-sidebar-brand">
          <img src={logo} alt="PureMarket" />
          <span className="adm-sidebar-brand-text">PureMarket</span>
          <span className="adm-sidebar-badge">Admin</span>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-section-label">Main Menu</div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`adm-nav-item${activeTab === item.id ? " active" : ""}`}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              >
                <span className="adm-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                {item.label}
                {item.badge && pending.length > 0 && (
                  <span className="adm-nav-badge">{pending.length}</span>
                )}
              </button>
            );
          })}

          <div className="adm-nav-section-label" style={{ marginTop: 12 }}>Quick Links</div>
          <button className="adm-nav-item" onClick={() => navigate("/")}>
            <span className="adm-nav-icon"><Home size={18} strokeWidth={1.8} /></span>
            Back to Site
          </button>
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-nav-item" onClick={() => { logout(); navigate("/signin"); }}>
            <span className="adm-nav-icon"><LogOut size={18} strokeWidth={1.8} /></span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="adm-main">

        {/* Topbar */}
        <div className="adm-topbar">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="adm-hamburger"
            aria-label="Toggle sidebar"
          >
            <Menu size={22} />
          </button>

          <span className="adm-topbar-title">{PAGE_TITLE[activeTab]}</span>
          <div className="adm-topbar-right">
            <div style={{ textAlign: "right", marginRight: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1348", lineHeight: 1.2 }}>{user?.name || "Admin"}</span>
              <span style={{ fontSize: 11, color: "#8a93b0" }}>{user?.email || ""}</span>
            </div>
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
              {/* Admin Profile Card */}
              <div className="adm-profile-card">
                <div className="adm-profile-glow adm-profile-glow-1" />
                <div className="adm-profile-glow adm-profile-glow-2" />
                <div className="adm-profile-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <span>{(user?.name || "A").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="adm-profile-role">Administrator</div>
                  <div className="adm-profile-name">{user?.name || "Admin"}</div>
                  <div className="adm-profile-email">
                    <ShieldCheck size={13} />
                    <span>{user?.email || "—"}</span>
                  </div>
                </div>
                <div className="adm-profile-badge">
                  <ShieldAlert size={14} />
                  Admin
                </div>
              </div>

              {/* Stats */}
              <div className="adm-stats-grid">
                <StatCard icon={Users2}    label="Total Users"       value={statsLoading ? "…" : (stats?.totalUsers ?? 0).toLocaleString()}    sub="Registered customers" color="#6d28d9" />
                <StatCard icon={Store}     label="Total Vendors"     value={statsLoading ? "…" : (stats?.totalVendors ?? 0).toLocaleString()}  sub="Active shops"         color="#0891b2" />
                <StatCard icon={Package}   label="Total Products"    value={statsLoading ? "…" : (stats?.totalProducts ?? 0).toLocaleString()} sub="Listed items"         color="#059669" />
                <StatCard icon={DollarSign} label="Platform Revenue" value={statsLoading ? "…" : `LKR ${Number(stats?.platformRevenue ?? 0).toFixed(2)}`} sub="All-time earnings" color="#d97706" />
              </div>

              {/* Quick access */}
              <h2 className="adm-section-title">Quick Access</h2>
              <div className="adm-quick-grid">
                {[
                  { id: "approvals", icon: Clock,   label: "Pending Approvals", count: pending.length,                                       color: "#d97706", bg: "#fffbeb" },
                  { id: "vendors",   icon: Store,   label: "Manage Shops",      count: statsLoading ? "…" : (stats?.totalVendors ?? 0),       color: "#6d28d9", bg: "#f5f3ff" },
                  { id: "users",     icon: Users,   label: "Manage Users",      count: statsLoading ? "…" : (stats?.totalUsers ?? 0),          color: "#2563eb", bg: "#eff6ff" },
                ].map(q => {
                  const Icon = q.icon;
                  return (
                    <button key={q.id} onClick={() => setActiveTab(q.id)} className="adm-quick-card" style={{ "--qc-color": q.color, "--qc-bg": q.bg }}>
                      <div className="adm-quick-icon"><Icon size={20} strokeWidth={1.8} /></div>
                      <div className="adm-quick-label">{q.label}</div>
                      <div className="adm-quick-count">{q.count}</div>
                    </button>
                  );
                })}
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
                      <tr><td colSpan={5} className="adm-empty"><Loader2 size={16} className="adm-spinner-icon" /> Loading…</td></tr>
                    ) : pending.length === 0 ? (
                      <tr><td colSpan={5} className="adm-empty"><AlertCircle size={16} style={{ display:"inline", marginRight:6, verticalAlign:"middle" }} />No pending approvals</td></tr>
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
                                {isApproving ? <Spin /> : <><CheckCircle2 size={13} /> Approve</>}
                              </button>
                              <button className="adm-btn adm-btn-danger" onClick={() => handleReject(v)} disabled={busy}>
                                {isRejecting ? <Spin /> : <><XCircle size={13} /> Reject</>}
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
                      <tr><td colSpan={6} className="adm-empty"><Loader2 size={16} className="adm-spinner-icon" /> Loading vendors…</td></tr>
                    ) : allVendors.length === 0 ? (
                      <tr><td colSpan={6} className="adm-empty">No vendors found.</td></tr>
                    ) : allVendors.map(v => (
                      <tr key={v._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="adm-table-avatar" style={{ background: "linear-gradient(135deg,#ede9fe,#c4b5fd)", color: "#6d28d9" }}>
                              {v.profileImage
                                ? <img src={v.profileImage} alt={v.name} />
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
                            {!v.isApproved
                              ? <><Clock size={10} /> Pending</>
                              : v.isBlocked
                              ? <><ShieldOff size={10} /> Blocked</>
                              : <><ShieldCheck size={10} /> Active</>
                            }
                          </span>
                        </td>
                        <td>
                          <button
                            className={`adm-btn ${v.isBlocked ? "adm-btn-success" : "adm-btn-danger"}`}
                            onClick={() => handleToggleVendorBlock(v)}
                            disabled={blockingVendorId === v._id}
                          >
                            {blockingVendorId === v._id
                              ? <Spin />
                              : v.isBlocked
                              ? <><UserCheck size={13} /> Unblock</>
                              : <><UserX size={13} /> Block</>
                            }
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
                      <tr><td colSpan={5} className="adm-empty"><Loader2 size={16} className="adm-spinner-icon" /> Loading users…</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={5} className="adm-empty">No users found.</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="adm-table-avatar" style={{ background: "linear-gradient(135deg,#dbeafe,#93c5fd)", color: "#2563eb" }}>
                              {u.profileImage
                                ? <img src={u.profileImage} alt={u.name} />
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
                            {u.isBlocked
                              ? <><ShieldOff size={10} /> Blocked</>
                              : <><ShieldCheck size={10} /> Active</>
                            }
                          </span>
                        </td>
                        <td>
                          <button
                            className={`adm-btn ${u.isBlocked ? "adm-btn-success" : "adm-btn-danger"}`}
                            onClick={() => handleToggleBlock(u)}
                            disabled={blockingId === u._id}
                          >
                            {blockingId === u._id
                              ? <Spin />
                              : u.isBlocked
                              ? <><UserCheck size={13} /> Unblock</>
                              : <><UserX size={13} /> Block</>
                            }
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
