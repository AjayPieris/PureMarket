import Product from "../models/Product.js";

// 🔹 Add new product (Vendor only)
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const product = new Product({
      vendor: req.user._id,
      name,
      description,
      price,
      stock,
      category,
      image: req.file ? req.file.filename : null,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get all products (Public)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate("vendor", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get single product by ID (Public)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("vendor", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Update product (Vendor only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const { name, description, price, stock, category } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = category || product.category;

    if (req.file) product.image = req.file.filename;

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Delete product (Vendor only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
