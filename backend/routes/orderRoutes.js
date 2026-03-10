import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import { getMyOrders } from "../controllers/orderController.js";
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

// Get logged-in customer's orders
router.get("/my", protect, getMyOrders);

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
    })
      .sort({ createdAt: -1 })
      .populate("customer", "name email profileImage")
      .populate("orderItems.product", "name price images")
      .populate("orderItems.vendor", "name email profileImage");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vendor: update order status (only to "Delivered")
router.put("/:id/vendor-status", protect, async (req, res) => {
  try {
    const vendorId = (req.user._id || req.user.id).toString();
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Verify this vendor has items in the order
    const isVendorInOrder = order.orderItems.some(
      (item) => item.vendor.toString() === vendorId,
    );
    if (!isVendorInOrder) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    const { status } = req.body;
    if (!["Delivered"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Vendors can only mark orders as Delivered" });
    }

    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("orderItems.product", "name price")
      .populate("orderItems.vendor", "name email");

    res.json({ message: "Order status updated", order: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
