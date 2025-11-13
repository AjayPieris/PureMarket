// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// after other middleware in server.js
app.use("/uploads", express.static("uploads"));
// Database connection
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Multi Vendor API running...");
});

// Routes
 import authRoutes from "./routes/authRoutes.js";
 import productRoutes from "./routes/productRoutes.js";
 import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
 import adminRoutes from "./routes/adminRoutes.js";

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
 app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
 app.use("/api/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
