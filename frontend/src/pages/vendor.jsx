import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { uploadFiles } from "../utils/uploadthing";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Sports",
  "Home",
  "Beauty",
  "Food",
  "Other",
];

const EMPTY_ADD = {
  name: "",
  price: "",
  stock: "",
  rating: "5.0",
  category: "Electronics",
  description: "",
};

export default function VendorDashboard() {
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}` };

  /* ─── Approval state ─── */
  const [isApproved, setIsApproved] = useState(false); // default false — confirmed by /api/auth/me
  const [storeLink, setStoreLink] = useState("");
  const [storeLinkInput, setStoreLinkInput] = useState("");
  const [storeLinkLoading, setStoreLinkLoading] = useState(false);

  /* ─── Products state ─── */
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [totalEarning, setTotalEarning] = useState(null);

  /* ─── Add Product ─── */
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  // up to 4 images: each slot is { file: File|null, preview: string }
  const [addImages, setAddImages] = useState([null, null, null, null]);
  const [addUploading, setAddUploading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  // single ref whose .current is an array of 4 file-input DOM nodes
  const addFileInputRefs = useRef([]);

  /* ─── Edit Modal ─── */
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  // up to 4 images: each slot is { file: File|null, preview: string } or null
  const [editImages, setEditImages] = useState([null, null, null, null]);
  const [editUploading, setEditUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  // single ref whose .current is an array of 4 file-input DOM nodes
  const editFileInputRefs = useRef([]);

  /* ─── Delete ─── */
  const [deletingId, setDeletingId] = useState(null);

  // ── Load vendor's products on mount ──
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/products/my/products`, {
        headers: authHeaders,
      });
      setProducts(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch vendor profile for approval status + store link
    axios
      .get(`${API_BASE}/api/auth/me`, { headers })
      .then(({ data }) => {
        setIsApproved(data.isApproved ?? true);
        setStoreLink(data.storeLink || "");
        setStoreLinkInput(data.storeLink || "");
      })
      .catch(() => {});

    fetchProducts();
    axios
      .get(`${API_BASE}/api/orders/vendor/earnings`, { headers })
      .then(({ data }) => setTotalEarning(data.totalEarning ?? 0))
      .catch(() => setTotalEarning(0));
  }, [fetchProducts, token]);

  async function handleStoreLinkSubmit(e) {
    e.preventDefault();
    if (!storeLinkInput.trim()) {
      toast.error("Please enter a store link.");
      return;
    }
    setStoreLinkLoading(true);
    try {
      await axios.put(
        `${API_BASE}/api/auth/vendor/store-link`,
        { storeLink: storeLinkInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStoreLink(storeLinkInput.trim());
      toast.success("Store link submitted! Admin will review it shortly.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit link.");
    } finally {
      setStoreLinkLoading(false);
    }
  }

  // ── Helpers ──
  function handleAddInput(e) {
    const { name, value } = e.target;
    setAddForm((f) => ({ ...f, [name]: value }));
  }
  function handleAddImageChange(e, idx) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddImages((prev) => {
      const next = [...prev];
      next[idx] = { file, preview: URL.createObjectURL(file) };
      return next;
    });
  }
  function clearAddImage(idx) {
    setAddImages((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    if (addFileInputRefs.current[idx]) addFileInputRefs.current[idx].value = "";
  }

  // ── Add Product Submit ──
  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!addForm.name || !addForm.price || !addForm.stock) {
      toast.error("Fill in name, price & stock.");
      return;
    }
    setAddLoading(true);
    try {
      let imageUrls = [];
      const filesToUpload = addImages.filter(Boolean).map((s) => s.file);
      if (filesToUpload.length > 0) {
        setAddUploading(true);
        const res = await uploadFiles("imageUploader", {
          files: filesToUpload,
        });
        imageUrls = res.map((r) => r?.url || r?.ufsUrl || "").filter(Boolean);
        setAddUploading(false);
      }

      const payload = {
        name: addForm.name,
        description: addForm.description,
        price: parseFloat(addForm.price),
        stock: parseInt(addForm.stock, 10),
        rating: parseFloat(addForm.rating),
        category: addForm.category,
        images: imageUrls,
      };

      await axios.post(`${API_BASE}/api/products`, payload, {
        headers: authHeaders,
      });
      toast.success("Product added successfully!");
      setAddForm(EMPTY_ADD);
      setAddImages([null, null, null, null]);
      addFileInputRefs.current.forEach((el) => {
        if (el) el.value = "";
      });
      fetchProducts();
      setTimeout(() => {
        setShowAddForm(false);
      }, 900);
    } catch (err) {
      setAddUploading(false);
      toast.error(err.response?.data?.message || "Failed to add product.");
    } finally {
      setAddLoading(false);
    }
  }

  // ── Edit ──
  function startEdit(product) {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      rating: product.rating || 5.0,
      category: product.category,
      description: product.description || "",
    });
    // Pre-populate edit slots from existing images array (or legacy image field)
    const existingUrls = product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : [];
    const slots = [null, null, null, null].map((_, i) =>
      existingUrls[i] ? { file: null, preview: existingUrls[i] } : null,
    );
    setEditImages(slots);
    editFileInputRefs.current.forEach((el) => {
      if (el) el.value = "";
    });
  }
  function handleEditInput(e) {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  }
  function handleEditImageChange(e, idx) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImages((prev) => {
      const next = [...prev];
      next[idx] = { file, preview: URL.createObjectURL(file) };
      return next;
    });
  }
  function clearEditImage(idx) {
    setEditImages((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    if (editFileInputRefs.current[idx])
      editFileInputRefs.current[idx].value = "";
  }

  async function saveEdit(e) {
    e.preventDefault();
    setEditLoading(true);
    try {
      // For each slot: if there's a new file upload it, if just a preview URL keep it, if null drop it
      const newFiles = editImages.filter((s) => s?.file);
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        setEditUploading(true);
        const res = await uploadFiles("imageUploader", {
          files: newFiles.map((s) => s.file),
        });
        uploadedUrls = res
          .map((r) => r?.url || r?.ufsUrl || "")
          .filter(Boolean);
        setEditUploading(false);
      }

      // Merge: slot order preserved, new uploads replace file slots
      let uploadIdx = 0;
      const imageUrls = editImages
        .map((s) => {
          if (!s) return null;
          if (s.file) return uploadedUrls[uploadIdx++] || null;
          return s.preview; // existing URL
        })
        .filter(Boolean);

      const payload = {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        rating: parseFloat(editForm.rating),
        category: editForm.category,
        images: imageUrls,
      };

      await axios.put(
        `${API_BASE}/api/products/${editingProduct._id}`,
        payload,
        { headers: authHeaders },
      );
      toast.success("Product updated successfully!");
      cancelEdit();
      fetchProducts();
    } catch (err) {
      setEditUploading(false);
      toast.error(err.response?.data?.message || "Update failed.");
    } finally {
      setEditLoading(false);
    }
  }

  function cancelEdit() {
    setEditingProduct(null);
    setEditForm(null);
    setEditImages([null, null, null, null]);
    editFileInputRefs.current.forEach((el) => {
      if (el) el.value = "";
    });
  }

  // ── Delete ──
  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/api/products/${id}`, {
        headers: authHeaders,
      });
      setProducts((p) => p.filter((x) => x._id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  /* ─── 3D Tilt ─── */
  function handleTiltMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 12}deg) rotateY(${(px - 0.5) * 14}deg) scale(1.03)`;
  }
  function handleTiltLeave(e) {
    e.currentTarget.style.transform = "";
  }

  return (
    <div className="min-h-screen bg-skeuo-bg text-slate-800 antialiased font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 bg-skeuo-bg p-6 sm:p-8 rounded-[2.5rem] shadow-skeuo border border-white/30 gap-6">
          <h1 className="text-3xl font-black text-slate-700 tracking-tight">
            Vendor Dashboard
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/vendor/orders"
              className="text-sm font-extrabold uppercase tracking-widest px-8 py-3 bg-skeuo-bg shadow-skeuo rounded-full text-slate-500 hover:text-purple-600 hover:scale-95 active:shadow-skeuo-inner transition-all duration-300"
            >
              📦 View Orders
            </Link>
            {isApproved && (
              <button
                onClick={() => setShowAddForm((s) => !s)}
                className={`text-sm font-extrabold uppercase tracking-widest px-8 py-3 rounded-full transition-all duration-300 ${
                  showAddForm
                    ? "bg-skeuo-bg shadow-skeuo-inner text-purple-600 scale-95"
                    : "bg-skeuo-bg shadow-skeuo text-purple-600 hover:scale-105 active:shadow-skeuo-inner active:scale-95"
                }`}
              >
                {showAddForm ? "✕ Close Form" : "+ Add Product"}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Total Products",
              value: loadingProducts ? "…" : products.length,
              icon: "📦",
            },
            {
              label: "Total Stock",
              value: loadingProducts
                ? "…"
                : products.reduce((s, p) => s + (p.stock || 0), 0),
              icon: "🏢",
            },
            {
              label: "Categories",
              value: loadingProducts
                ? "…"
                : new Set(products.map((p) => p.category)).size,
              icon: "🏷️",
            },
            {
              label: "Total Earning",
              value:
                totalEarning === null
                  ? "…"
                  : `LKR ${Number(totalEarning).toFixed(2)}`,
              icon: "💰",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-[2rem] bg-skeuo-bg p-6 shadow-skeuo flex flex-col justify-center items-center hover:shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full shadow-skeuo-inner flex items-center justify-center text-2xl mb-4">
                {s.icon}
              </div>
              <div className="text-3xl font-black text-slate-700">
                {s.value}
              </div>
              <p className="text-xs font-bold tracking-widest text-slate-400 mt-2 uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        {/* ── Approval Pending Banner ── */}
        {!isApproved && (
          <section className="mb-12 rounded-[2rem] bg-skeuo-bg p-8 shadow-skeuo border border-white/20">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 rounded-full shadow-skeuo-inner flex items-center justify-center text-2xl shrink-0">
                ⏳
              </div>
              <div>
                <p className="font-black text-xl text-amber-600 mb-1">
                  Account Pending Approval
                </p>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Your vendor account is awaiting admin approval. You cannot add
                  products until approved. Submit your store or business link
                  below so the admin can review it.
                </p>
              </div>
            </div>
            <form
              onSubmit={handleStoreLinkSubmit}
              className="flex flex-col sm:flex-row gap-4 bg-skeuo-bg p-4 rounded-[1.5rem] shadow-skeuo-inner"
            >
              <input
                type="url"
                placeholder="https://your-store.com or Google Drive link"
                value={storeLinkInput}
                onChange={(e) => setStoreLinkInput(e.target.value)}
                className="flex-1 rounded-[1rem] bg-skeuo-bg shadow-skeuo-inner px-5 py-3 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:shadow-skeuo transition-all"
                required
              />
              <button
                type="submit"
                disabled={storeLinkLoading}
                className="px-8 py-3 rounded-[1rem] bg-skeuo-bg shadow-skeuo text-amber-500 text-xs font-black uppercase tracking-widest hover:scale-95 active:shadow-skeuo-inner transition-all disabled:opacity-50"
              >
                {storeLinkLoading
                  ? "Submitting…"
                  : storeLink
                    ? "Update Link"
                    : "Submit Review"}
              </button>
            </form>
            {storeLink && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="text-green-500 font-bold">
                  ✓ Link submitted:
                </span>
                <a
                  href={storeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-600 hover:text-amber-500 hover:underline break-all"
                >
                  {storeLink}
                </a>
              </div>
            )}
          </section>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <section className="mb-12 rounded-[2.5rem] bg-skeuo-bg border border-white/20 p-8 sm:p-10 shadow-skeuo">
            <h2 className="text-2xl font-black text-slate-700 mb-8 border-b border-slate-200/50 pb-4">
              Add New Product
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                  Product Name
                </label>
                <input
                  name="name"
                  value={addForm.name}
                  onChange={handleAddInput}
                  className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#a855f7] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Price (LKR)
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={addForm.price}
                    onChange={handleAddInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#a855f7] transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={addForm.stock}
                    onChange={handleAddInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#a855f7] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={addForm.category}
                    onChange={handleAddInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#a855f7] transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Initial Rating
                  </label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={addForm.rating}
                    onChange={handleAddInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#a855f7] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={addForm.description}
                  onChange={handleAddInput}
                  className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#a855f7] transition-all resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                  Product Images{" "}
                  <span className="text-slate-400 font-bold ml-1">
                    (UP TO 4)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="relative group">
                      <input
                        ref={(el) => (addFileInputRefs.current[idx] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAddImageChange(e, idx)}
                      />
                      {addImages[idx] ? (
                        <div className="relative w-full aspect-square rounded-[1.5rem] shadow-skeuo-inner border-[3px] border-white/30 overflow-hidden bg-white">
                          <img
                            src={addImages[idx].preview}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => clearAddImage(idx)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white text-xs font-bold flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => addFileInputRefs.current[idx]?.click()}
                          className="w-full aspect-square rounded-[1.5rem] bg-skeuo-bg shadow-skeuo hover:shadow-skeuo-inner flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-purple-500 transition-all duration-300"
                        >
                          <svg
                            className="w-8 h-8 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Photo {idx + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {addUploading && (
                  <p className="text-xs font-bold text-purple-500 mt-3 tracking-widest uppercase pl-2 animate-pulse">
                    Uploading images…
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <button
                  type="submit"
                  disabled={addLoading || addUploading}
                  className="px-10 py-4 rounded-full bg-skeuo-bg shadow-skeuo text-purple-600 text-sm font-black uppercase tracking-widest hover:scale-95 active:shadow-skeuo-inner transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
                >
                  {addLoading
                    ? addUploading
                      ? "Uploading…"
                      : "Saving…"
                    : "+ Add Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddForm(EMPTY_ADD);
                    setAddImages([null, null, null, null]);
                    addFileInputRefs.current.forEach((el) => {
                      if (el) el.value = "";
                    });
                  }}
                  className="px-8 py-4 rounded-full bg-skeuo-bg shadow-skeuo text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 hover:scale-95 active:shadow-skeuo-inner transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Products Table - Skeuomorphic Cards Instead of Table for better UI/UX */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-700 mb-8 pl-4">
            Your Products
          </h2>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-bold tracking-widest uppercase">
              <div className="w-16 h-16 rounded-full shadow-skeuo flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-purple-600"></div>
              </div>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 px-6 rounded-[3rem] shadow-skeuo-inner bg-skeuo-bg border border-white/20">
              <div className="w-24 h-24 rounded-full shadow-skeuo flex flex-col items-center justify-center mx-auto mb-8 text-4xl text-slate-400">
                🏷️
              </div>
              <h3 className="text-2xl font-black text-slate-700 mb-3">
                No products yet
              </h3>
              <p className="text-slate-500 mb-10 font-bold">
                Click + Add Product to start building your store.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-skeuo-bg rounded-[2rem] p-6 shadow-skeuo hover:shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] transition-all duration-300 flex flex-col"
                >
                  <div className="w-full h-48 rounded-[1.5rem] shadow-skeuo-inner overflow-hidden mb-5 border-2 border-white/30 bg-white">
                    {p.images?.length ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400 uppercase tracking-widest">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 px-2">
                    <h3 className="font-extrabold text-xl text-slate-800 mb-1 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      {p.category}
                    </p>
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-200/50">
                      <div>
                        <p className="text-sm font-bold text-slate-400 mb-1">
                          Price
                        </p>
                        <p className="text-xl font-black text-purple-600">
                          LKR {Number(p.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 mb-1">
                          Stock
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full shadow-skeuo-inner text-xs font-black ${p.stock < 5 ? "text-red-500" : "text-green-500"}`}
                        >
                          {p.stock} units
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-slate-200/50 flex items-center justify-center gap-6">
                    <button
                      onClick={() => startEdit(p)}
                      className="w-12 h-12 rounded-full shadow-skeuo flex items-center justify-center text-blue-500 hover:scale-95 active:shadow-skeuo-inner transition-all hover:text-blue-600"
                      title="Edit"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      disabled={deletingId === p._id}
                      className="w-12 h-12 rounded-full shadow-skeuo flex items-center justify-center text-red-500 hover:scale-95 active:shadow-skeuo-inner transition-all hover:text-red-600 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === p._id ? (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-red-500 animate-spin"></div>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Edit Modal (Skeuomorphic) */}
      {editingProduct && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-[3rem] bg-skeuo-bg shadow-[20px_20px_60px_#1a1a1a,-20px_-20px_60px_#ffffff] p-8 sm:p-10 relative max-h-[90vh] overflow-y-auto border border-white/20">
            <button
              onClick={cancelEdit}
              className="absolute right-6 top-6 w-10 h-10 flex items-center justify-center rounded-full shadow-skeuo text-slate-500 font-bold hover:scale-95 hover:text-red-500 active:shadow-skeuo-inner transition-all"
              aria-label="Close edit modal"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-slate-700 mb-8 border-b border-slate-200/50 pb-4">
              Edit Product
            </h2>

            <form onSubmit={saveEdit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                  Name
                </label>
                <input
                  autoFocus
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInput}
                  className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#3b82f6] transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Price (LKR)
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={handleEditInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#3b82f6] transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={handleEditInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#3b82f6] transition-all"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#3b82f6] transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                    Rating
                  </label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editForm.rating}
                    onChange={handleEditInput}
                    className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#3b82f6] transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={editForm.description}
                  onChange={handleEditInput}
                  className="w-full rounded-2xl bg-skeuo-bg shadow-skeuo-inner px-5 py-4 text-sm font-semibold text-slate-700 focus:outline-none focus:shadow-[inset_6px_6px_12px_#c5c5c5,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#3b82f6] transition-all resize-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 pl-2">
                  Images{" "}
                  <span className="text-slate-400 font-bold ml-1">
                    (UP TO 4)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="relative group">
                      <input
                        ref={(el) => (editFileInputRefs.current[idx] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleEditImageChange(e, idx)}
                      />
                      {editImages[idx] ? (
                        <div className="relative w-full aspect-square rounded-2xl shadow-skeuo-inner overflow-hidden border-2 border-white/50 bg-white">
                          <img
                            src={editImages[idx].preview}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => clearEditImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                          >
                            ✕
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              editFileInputRefs.current[idx]?.click()
                            }
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            editFileInputRefs.current[idx]?.click()
                          }
                          className="w-full aspect-square rounded-2xl bg-skeuo-bg shadow-skeuo hover:shadow-skeuo-inner flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-slate-400 hover:text-blue-500"
                        >
                          <svg
                            className="w-6 h-6 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            Photo {idx + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {editUploading && (
                  <p className="text-xs font-bold text-blue-500 mt-2 tracking-widest uppercase pl-2 animate-pulse">
                    Uploading images…
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-6">
                <button
                  type="submit"
                  disabled={editLoading || editUploading}
                  className="px-8 py-3.5 rounded-full bg-skeuo-bg shadow-skeuo text-blue-600 text-sm font-black uppercase tracking-widest hover:scale-95 active:shadow-skeuo-inner transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3.5 rounded-full bg-skeuo-bg shadow-skeuo text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 hover:scale-95 active:shadow-skeuo-inner transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
