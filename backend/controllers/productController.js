import Product from "../models/Product.js";
import Order from "../models/Order.js";

// 🔹 Add new product (Vendor only)
export const addProduct = async (req, res) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ message: "Your account is pending admin approval. You cannot add products yet." });
    }

    const { name, description, price, stock, category, images } = req.body;

    const product = new Product({
      vendor: req.user._id,
      name,
      description,
      price,
      stock,
      category,
      images: Array.isArray(images) ? images.slice(0, 4) : [],   // up to 4 CDN URLs from UploadThing
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get vendor's own products
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
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

    const { name, description, price, stock, category, images } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    if (Array.isArray(images)) product.images = images.slice(0, 4); // up to 4 CDN URLs from UploadThing

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

// 🔹 Buy product instantly
export const buyProduct = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const qty = Number(quantity);
    
    if (qty < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Prevent vendor from buying their own product
    if (product.vendor.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot buy your own product" });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    product.stock -= qty;
    await product.save();

    // Create an Order document to record the purchase
    const order = new Order({
      customer: req.user._id,
      orderItems: [
        {
          product: product._id,
          vendor: product.vendor,
          name: product.name,
          qty: qty,
          price: product.price,
        }
      ],
      shippingAddress: {
        address: "Default Address", // In a real app, collect this from frontend
        city: "Default City",
        postalCode: "000000",
        country: "Default Country"
      },
      paymentMethod: "COD",
      totalPrice: product.price * qty,
      status: "Processing"
    });

    await order.save();

    res.json({ message: "Order successful! Your product will arrive within 2 days.", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
