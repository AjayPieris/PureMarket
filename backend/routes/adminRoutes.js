import express from "express";
import {
  getAdminStats,
  getAllVendors,
  approveVendor,
  deleteVendor,
  getAllUsers,
  toggleBlockUser,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Only Admin can access these
router.get("/stats", protect, authorizeRoles("admin"), getAdminStats);
router.get("/vendors", protect, authorizeRoles("admin"), getAllVendors);
router.put("/vendors/:id/approve", protect, authorizeRoles("admin"), approveVendor);
router.delete("/vendors/:id", protect, authorizeRoles("admin"), deleteVendor);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id/toggle-block", protect, authorizeRoles("admin"), toggleBlockUser);

export default router;
