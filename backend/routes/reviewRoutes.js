import express from "express";
import {
  addReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: Get all reviews for a product
router.get("/product/:productId", getReviewsByProduct);

// Customer only: Add review for a product (expects productId in URL)
router.post(
  "/product/:productId",
  protect,
  authorizeRoles("customer"),
  addReview
);

// Customer or Admin: Update review
router.put("/:id", protect, authorizeRoles("customer", "admin"), updateReview);

// Customer or Admin: Delete review
router.delete("/:id", protect, authorizeRoles("customer", "admin"), deleteReview);

export default router;