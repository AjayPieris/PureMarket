import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { uploadFiles } from "../utils/uploadthing";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const CATEGORIES = ["Electronics", "Fashion", "Sports", "Home", "Beauty", "Food", "Other"];

const EMPTY_ADD = { name: "", price: "", stock: "", rating: "5.0", category: "Electronics", description: "" };

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
      const { data } = await axios.get(`${API_BASE}/api/products/my/products`, { headers: authHeaders });
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
    axios.get(`${API_BASE}/api/auth/me`, { headers })
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
    if (!storeLinkInput.trim()) { toast.error("Please enter a store link."); return; }
    setStoreLinkLoading(true);
    try {
      await axios.put(`${API_BASE}/api/auth/vendor/store-link`,
        { storeLink: storeLinkInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
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
        const res = await uploadFiles("imageUploader", { files: filesToUpload });
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

      await axios.post(`${API_BASE}/api/products`, payload, { headers: authHeaders });
      toast.success("Product added successfully!");
      setAddForm(EMPTY_ADD);
      setAddImages([null, null, null, null]);
      addFileInputRefs.current.forEach((el) => { if (el) el.value = ""; });
      fetchProducts();
      setTimeout(() => { setShowAddForm(false); }, 900);
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
      : product.image ? [product.image] : [];
    const slots = [null, null, null, null].map((_, i) =>
      existingUrls[i] ? { file: null, preview: existingUrls[i] } : null
    );
    setEditImages(slots);
    editFileInputRefs.current.forEach((el) => { if (el) el.value = ""; });
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
    if (editFileInputRefs.current[idx]) editFileInputRefs.current[idx].value = "";
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
        const res = await uploadFiles("imageUploader", { files: newFiles.map((s) => s.file) });
        uploadedUrls = res.map((r) => r?.url || r?.ufsUrl || "").filter(Boolean);
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

      await axios.put(`${API_BASE}/api/products/${editingProduct._id}`, payload, { headers: authHeaders });
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
    editFileInputRefs.current.forEach((el) => { if (el) el.value = ""; });
  }

  // ── Delete ──
  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/api/products/${id}`, { headers: authHeaders });
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
  function handleTiltLeave(e) { e.currentTarget.style.transform = ""; }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold">Vendor Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link to="/products" className="hidden sm:inline-block text-sm font-semibold px-4 py-2 border rounded-md hover:bg-slate-50">
              View Store
            </Link>
            {isApproved && (
              <button
                onClick={() => setShowAddForm((s) => !s)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold shadow-lg hover:scale-[1.03] transition"
              >
                {showAddForm ? "Close Form" : "+ Add Product"}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: loadingProducts ? "…" : products.length },
            { label: "Total Stock", value: loadingProducts ? "…" : products.reduce((s, p) => s + (p.stock || 0), 0) },
            { label: "Categories", value: loadingProducts ? "…" : new Set(products.map((p) => p.category)).size },
            { label: "Total Earning", value: totalEarning === null ? "…" : `$${Number(totalEarning).toFixed(2)}` },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-white border p-5 shadow-sm hover:shadow-md transition">
              <p className="text-sm text-slate-500">{s.label}</p>
              <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
                {s.value}
              </div>
            </div>
          ))}
        </section>

        {/* ── Approval Pending Banner ── */}
        {!isApproved && (
          <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-bold text-amber-800">Account Pending Approval</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Your vendor account is awaiting admin approval. You cannot add products until approved.
                  Submit your store or business link below so the admin can review it.
                </p>
              </div>
            </div>
            <form onSubmit={handleStoreLinkSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="https://your-store.com or social media link"
                value={storeLinkInput}
                onChange={(e) => setStoreLinkInput(e.target.value)}
                className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <button
                type="submit"
                disabled={storeLinkLoading}
                className="px-5 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {storeLinkLoading ? "Submitting…" : storeLink ? "Update Link" : "Submit for Review"}
              </button>
            </form>
            {storeLink && (
              <p className="mt-2 text-xs text-amber-600">
                ✓ Link submitted: <a href={storeLink} target="_blank" rel="noopener noreferrer" className="underline break-all">{storeLink}</a>
              </p>
            )}
          </section>
        )}

        {/* Add Product Form */}
        {showAddForm && (

          <section className="mb-10 rounded-xl bg-white border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input name="name" value={addForm.name} onChange={handleAddInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input name="price" type="number" step="0.01" min="0" value={addForm.price} onChange={handleAddInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input name="stock" type="number" min="0" value={addForm.stock} onChange={handleAddInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select name="category" value={addForm.category} onChange={handleAddInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initial Rating</label>
                  <input name="rating" type="number" step="0.1" min="1" max="5" value={addForm.rating} onChange={handleAddInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" rows={3} value={addForm.description} onChange={handleAddInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Images <span className="text-slate-400 font-normal">(up to 4)</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-purple-300 shadow-sm">
                          <img src={addImages[idx].preview} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => clearAddImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >✕</button>
                        </div>
                      ) : (
                        <div
                          onClick={() => addFileInputRefs.current[idx]?.click()}
                          className="w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-400 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-purple-500"
                        >
                          <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                          <span className="text-xs">Photo {idx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {addUploading && <p className="text-xs text-purple-500 mt-2">Uploading images…</p>}
              </div>



              <div className="flex items-center gap-3">
                <button type="submit" disabled={addLoading || addUploading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold shadow hover:scale-[1.02] transition disabled:opacity-60">
                  {addLoading ? (addUploading ? "Uploading…" : "Saving…") : "Add Product"}
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setAddForm(EMPTY_ADD); setAddImages([null,null,null,null]); addFileInputRefs.current.forEach(el => { if(el) el.value=''; }); }}
                  className="px-4 py-2 rounded-md border font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Products Table */}
        <section className="mb-14">
          <h2 className="text-xl font-bold mb-4">Your Products</h2>


          {loadingProducts ? (
            <div className="text-center py-12 text-slate-400">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border rounded-lg">
              No products yet. Click <strong>+ Add Product</strong> to get started.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                        {p.images?.length ? (
                            <img src={p.images[0]} alt={p.name} className="w-16 h-12 object-cover rounded-md" />
                          ) : (
                            <div className="w-16 h-12 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-400">No img</div>
                          )}
                          <div>
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-sm text-slate-500">{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3 font-semibold">${Number(p.price).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.stock < 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(p)}
                            className="px-3 py-1 rounded-md border text-sm hover:bg-slate-100 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                            className="px-3 py-1 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 transition disabled:opacity-50">
                            {deletingId === p._id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Edit Modal */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-xl bg-white border shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={cancelEdit}
              className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100"
              aria-label="Close edit modal">✕</button>
            <h2 className="text-lg font-bold mb-4">Edit Product</h2>

            <form onSubmit={saveEdit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input autoFocus name="name" value={editForm.name} onChange={handleEditInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input name="price" type="number" step="0.01" min="0" value={editForm.price} onChange={handleEditInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input name="stock" type="number" min="0" value={editForm.stock} onChange={handleEditInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select name="category" value={editForm.category} onChange={handleEditInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input name="rating" type="number" step="0.1" min="1" max="5" value={editForm.rating} onChange={handleEditInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" rows={3} value={editForm.description} onChange={handleEditInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Images <span className="text-slate-400 font-normal">(up to 4)</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-purple-300 shadow-sm">
                          <img src={editImages[idx].preview} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => clearEditImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >✕</button>
                          <button
                            type="button"
                            onClick={() => editFileInputRefs.current[idx]?.click()}
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                          >Change</button>
                        </div>
                      ) : (
                        <div
                          onClick={() => editFileInputRefs.current[idx]?.click()}
                          className="w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-400 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-purple-500"
                        >
                          <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                          <span className="text-xs">Photo {idx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {editUploading && <p className="text-xs text-purple-500 mt-2">Uploading images…</p>}
              </div>


              <div className="flex items-center gap-3">
                <button type="submit" disabled={editLoading || editUploading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold shadow hover:scale-[1.02] transition disabled:opacity-60">
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-md border font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}