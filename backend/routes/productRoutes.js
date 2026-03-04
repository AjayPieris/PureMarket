import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  getVendorProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ── PUBLIC ROUTES ──
router.get("/", getAllProducts);

// ── VENDOR ROUTES (must be BEFORE /:id to prevent "my" matching as an ID) ──

// GET /api/products/my/products → vendor's own products list
router.get("/my/products", protect, authorizeRoles("vendor"), getVendorProducts);

// ── PUBLIC single product (dynamic — keep last among GETs) ──
router.get("/:id", getProductById);


// POST /api/products → Add product (image URL in body from UploadThing)
router.post("/", protect, authorizeRoles("vendor"), addProduct);

// PUT /api/products/:id → Update product
router.put("/:id", protect, authorizeRoles("vendor"), updateProduct);

// DELETE /api/products/:id → Delete product
router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);

export default router;
