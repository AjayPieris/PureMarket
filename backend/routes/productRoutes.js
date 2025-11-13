// Importing necessary packages and files
import express from "express"; // Express framework for building routes
import multer from "multer"; // Multer for handling image uploads

// Importing controller functions (logic for each route)
import {
  addProduct,        // Function to add a new product
  getAllProducts,    // Function to get all products
  getProductById,    // Function to get a single product by ID
  updateProduct,     // Function to update a product
  deleteProduct,     // Function to delete a product
} from "../controllers/productController.js";

// Importing middleware (for authentication & role checking)
import { protect } from "../middleware/authMiddleware.js";          // Checks if user is logged in
import { authorizeRoles } from "../middleware/roleMiddleware.js";   // Checks if user has the right role (like vendor)

// Create an Express router
const router = express.Router();

// 🖼️ Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // Folder where images will be saved
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname), // Rename file to include timestamp
});

const upload = multer({ storage }); // Create upload instance using the above storage setup

// ========================
// 📂 PUBLIC ROUTES (No login required)
// ========================

// GET /api/products → Get all products
router.get("/", getAllProducts);

// GET /api/products/:id → Get product by ID
router.get("/:id", getProductById);

// ========================
// 🔒 PROTECTED ROUTES (Only vendors can use)
// ========================

// POST /api/products → Add a new product
router.post(
  "/", 
  protect,                       // Must be logged in
  authorizeRoles("vendor"),       // Must have vendor role
  upload.single("image"),         // Upload one image file with key "image"
  addProduct                      // Controller function to add product
);

// PUT /api/products/:id → Update product by ID
router.put(
  "/:id", 
  protect,                        // Must be logged in
  authorizeRoles("vendor"),        // Must have vendor role
  upload.single("image"),          // Upload one image (optional)
  updateProduct                    // Controller function to update product
);

// DELETE /api/products/:id → Delete product by ID
router.delete(
  "/:id", 
  protect,                         // Must be logged in
  authorizeRoles("vendor"),         // Must have vendor role
  deleteProduct                     // Controller function to delete product
);

// Export router to be used in main app.js or server.js
export default router;
