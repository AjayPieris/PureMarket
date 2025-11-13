import express from "express";
import {
  getAllVendors,
  approveVendor,
  deleteVendor,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Only Admin can access these
router.get("/vendors", protect, authorizeRoles("admin"), getAllVendors);
router.put("/vendors/:id/approve", protect, authorizeRoles("admin"), approveVendor);
router.delete("/vendors/:id", protect, authorizeRoles("admin"), deleteVendor);

export default router;
