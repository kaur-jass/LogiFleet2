import express from "express";

import {
  createMaintenance,
  getMaintenanceLogs,
  closeMaintenance,
} from "../controllers/maintenanceController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  validateBody,
  validateQuery,
} from "../middleware/validationMiddleware.js";

import {
  createMaintenanceSchema,
  maintenanceQuerySchema,
} from "../validators/maintenanceValidator.js";

const router = express.Router();

// ===================================
// GET /api/maintenance
// ===================================
router.get(
  "/",
  protect,
  validateQuery(maintenanceQuerySchema),
  getMaintenanceLogs
);

// ===================================
// POST /api/maintenance
// Fleet Manager Only
// ===================================
router.post(
  "/",
  protect,
  authorize("FLEET_MANAGER"),
  validateBody(createMaintenanceSchema),
  createMaintenance
);

// ===================================
// PATCH /api/maintenance/:id/close
// Fleet Manager Only
// ===================================
router.patch(
  "/:id/close",
  protect,
  authorize("FLEET_MANAGER"),
  closeMaintenance
);

export default router;