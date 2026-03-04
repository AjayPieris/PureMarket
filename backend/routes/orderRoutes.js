import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// Create order
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/vendor/earnings — total earned by the logged-in vendor
router.get("/vendor/earnings", protect, async (req, res) => {
  try {
    const vendorId = req.user._id;
    const orders = await Order.find({
      "orderItems.vendor": vendorId,
      status: { $ne: "Cancelled" },
    });

    let total = 0;
    for (const order of orders) {
      for (const item of order.orderItems) {
        if (item.vendor.toString() === vendorId.toString()) {
          total += item.price * item.qty;
        }
      }
    }

    res.json({ totalEarning: total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get vendor orders by ID
router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const orders = await Order.find({
      "orderItems.vendor": req.params.vendorId,
    }).populate("customer", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
