import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function VendorDashboard() {
  /* ---------- Add Product State ---------- */
  const [showAddForm, setShowAddForm] = useState(false);
  const [addImageData, setAddImageData] = useState(null); // data URL for new product image
  const addFileInputRef = useRef(null);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Smart Watch Pro",
      category: "Electronics",
      price: 399.99,
      stock: 8,
      sales: 32,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Premium Camera",
      category: "Electronics",
      price: 599.99,
      stock: 5,
      sales: 28,
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    },
  ]);

  const [addForm, setAddForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "Electronics",
    description: "",
  });

  function handleAddInput(e) {
    const { name, value } = e.target;
    setAddForm((f) => ({ ...f, [name]: value }));
  }

  function handleAddImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setAddImageData(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAddImageData(ev.target.result); // data URL
    reader.readAsDataURL(file);
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    if (!addForm.name || !addForm.price || !addForm.stock) {
      alert("Fill name, price & stock.");
      return;
    }

    const image = addImageData || "https://via.placeholder.com/800x600?text=No+Image";

    const newProduct = {
      id: Date.now(),
      name: addForm.name,
      category: addForm.category,
      price: parseFloat(addForm.price),
      stock: parseInt(addForm.stock, 10),
      sales: 0,
      image, // data URL persists
    };
    setProducts((p) => [newProduct, ...p]);

    // Reset form
    setAddForm({
      name: "",
      price: "",
      stock: "",
      category: "Electronics",
      description: "",
    });
    setAddImageData(null);
    if (addFileInputRef.current) addFileInputRef.current.value = "";
    setShowAddForm(false);
  }

  /* ---------- Edit Modal State ---------- */
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editImageData, setEditImageData] = useState(null);
  const editFileInputRef = useRef(null);

  function startEdit(product) {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description || "",
      image: product.image,
    });
    setEditImageData(null); // fresh start
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  }

  function handleEditInput(e) {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  }

  function handleEditImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setEditImageData(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setEditImageData(ev.target.result);
    reader.readAsDataURL(file);
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editForm.name || !editForm.price || !editForm.stock) {
      alert("Fill name, price & stock.");
      return;
    }
    setProducts((ps) =>
      ps.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: editForm.name,
              category: editForm.category,
              price: parseFloat(editForm.price),
              stock: parseInt(editForm.stock, 10),
              description: editForm.description,
              image: editImageData || editForm.image, // if changed
            }
          : p
      )
    );
    cancelEdit();
  }

  function cancelEdit() {
    setEditingProduct(null);
    setEditForm(null);
    setEditImageData(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  }

  /* ---------- 3D Tilt Handlers ---------- */
  function handleTiltMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 14;
    const rx = (0.5 - py) * 12;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
  }
  function handleTiltLeave(e) {
    e.currentTarget.style.transform = "";
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold">Vendor Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="hidden sm:inline-block text-sm font-semibold px-4 py-2 border rounded-md hover:bg-slate-50"
            >
              View Store
            </Link>
            <button
              onClick={() => setShowAddForm((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold shadow-lg hover:scale-[1.03] transition"
            >
              {showAddForm ? "Close Form" : "+ Add Product"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products.length },
            { label: "Total Sales", value: "$12,450" },
            { label: "Orders", value: "156" },
            { label: "Avg Rating", value: "4.8" },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl bg-white border p-5 shadow-sm hover:shadow-md transition"
            >
              <p className="text-sm text-slate-500">{s.label}</p>
              <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
                {s.value}
              </div>
            </div>
          ))}
        </section>

        {/* Add Product Form */}
        {showAddForm && (
          <section className="mb-10 rounded-xl bg-white border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  name="name"
                  value={addForm.name}
                  onChange={handleAddInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={addForm.price}
                    onChange={handleAddInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    value={addForm.stock}
                    onChange={handleAddInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={addForm.category}
                  onChange={handleAddInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Sports</option>
                  <option>Home</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={addForm.description}
                  onChange={handleAddInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Image</label>
                <div
                  className="group flex flex-col items-center justify-center border border-dashed rounded-lg p-5 cursor-pointer hover:border-purple-400 transition"
                  onClick={() => addFileInputRef.current?.click()}
                >
                  <input
                    ref={addFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAddImageChange}
                    className="hidden"
                  />
                  {addImageData ? (
                    <img
                      src={addImageData}
                      alt="Preview"
                      className="w-40 h-28 object-cover rounded-md shadow-sm"
                    />
                  ) : (
                    <div className="text-center text-sm text-slate-500">
                      <span className="font-medium text-purple-600">Click</span> to select image
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-lg group-hover:bg-purple-50/30 pointer-events-none"></div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold shadow hover:scale-[1.02] transition"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddImageData(null);
                    setAddForm({
                      name: "",
                      price: "",
                      stock: "",
                      category: "Electronics",
                      description: "",
                    });
                    if (addFileInputRef.current) addFileInputRef.current.value = "";
                  }}
                  className="px-4 py-2 rounded-md border font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}


        {/* Products Table */}
        <section className="mb-14">
          <h2 className="text-xl font-bold mb-4">Products Table</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sales</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-12 object-cover rounded-md"
                        />
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-sm text-slate-500">by You</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">{p.sales}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEdit(p)}
                        className="px-3 py-1 rounded-md border text-sm hover:bg-slate-100"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />

      {/* Edit Modal */}
      {editingProduct && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl bg-white border shadow-xl p-6 relative">
            <button
              onClick={cancelEdit}
              className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100"
              aria-label="Close edit modal"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Edit Product</h2>
            <form onSubmit={saveEdit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  autoFocus
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={handleEditInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    value={editForm.stock}
                    onChange={handleEditInput}
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Sports</option>
                  <option>Home</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={editForm.description}
                  onChange={handleEditInput}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <div className="flex items-center gap-4">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="text-sm"
                  />
                  <div className="w-32 h-20 rounded-md overflow-hidden border">
                    <img
                      src={editImageData || editForm.image}
                      alt="Edit preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold shadow hover:scale-[1.02] transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-md border font-medium"
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