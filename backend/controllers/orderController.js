import Order from "../models/order.js";
import Product from "../models/Product.js";

// Create a new order (Customer)
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    if (!customerId) return res.status(401).json({ message: "Unauthorized" });

    const { orderItems, shippingAddress, paymentMethod = "COD" } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }
    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.country) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }

    const productIds = orderItems.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    if (products.length !== orderItems.length) {
      return res.status(400).json({ message: "One or more products are invalid or inactive" });
    }

    const normalizedItems = [];
    for (const item of orderItems) {
      const productDoc = products.find((p) => p._id.toString() === item.product.toString());
      if (!productDoc) return res.status(400).json({ message: "Invalid product in cart" });

      if (item.qty <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });
      if (productDoc.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${productDoc.name}` });
      }

      normalizedItems.push({
        product: productDoc._id,
        vendor: productDoc.vendor,
        name: productDoc.name,
        qty: item.qty,
        price: productDoc.price,
      });
    }

    const totalPrice = normalizedItems.reduce((acc, it) => acc + it.price * it.qty, 0);

    const order = new Order({
      customer: customerId,
      orderItems: normalizedItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: "Pending",
    });

    await order.save();

    // Decrement stock
    await Promise.all(
      normalizedItems.map((it) =>
        Product.updateOne({ _id: it.product }, { $inc: { stock: -it.qty } })
      )
    );

    const populated = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("orderItems.product", "name price")
      .populate("orderItems.vendor", "name email");

    res.status(201).json({ message: "Order created", order: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current customer's orders
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    if (!customerId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ customer: customerId })
      .sort("-createdAt")
      .populate("orderItems.product", "name price")
      .populate("orderItems.vendor", "name email");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order by ID (owner, admin, or involved vendor)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("orderItems.product", "name price")
      .populate("orderItems.vendor", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = (req.user?._id || req.user?.id)?.toString();
    const role = req.user?.role;

    const isOwner = order.customer?.toString?.() === userId;
    const isAdmin = role === "admin";
    const isVendorInOrder = order.orderItems.some(
      (it) => it.vendor?.toString?.() === userId
    );

    if (!isOwner && !isAdmin && !isVendorInOrder) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort("-createdAt")
      .populate("customer", "name email")
      .populate("orderItems.vendor", "name email");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vendor: get orders that include this vendor's products
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user?._id || req.user?.id;

    const orders = await Order.find({ "orderItems.vendor": vendorId })
      .sort("-createdAt")
      .populate("customer", "name email")
      .populate("orderItems.product", "name price");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: update an order's status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // If cancelling, restore stock
    if (status === "Cancelled" && order.status !== "Cancelled") {
      await Promise.all(
        (order.orderItems || []).map((it) =>
          Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty } })
        )
      );
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
};