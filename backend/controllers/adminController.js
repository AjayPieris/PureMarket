import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// 🔹 Get admin dashboard stats (real data)
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalProducts, orders] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "vendor" }),
      Product.countDocuments(),
      Order.find({ status: { $ne: "Cancelled" } }),
    ]);

    let platformRevenue = 0;
    for (const order of orders) {
      for (const item of order.orderItems) {
        platformRevenue += item.price * item.qty;
      }
    }

    res.json({ totalUsers, totalVendors, totalProducts, platformRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Approve vendor
export const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.isApproved = true;
    await vendor.save();

    res.json({ message: "Vendor approved successfully", vendor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Reject (or delete) vendor
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await vendor.deleteOne();
    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
