import express from "express";

import {
  createDriver,
  getDrivers,
  getDriverById,
  getAvailableDrivers,
  updateDriver,
} from "../controllers/driverController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  validateBody,
  validateQuery,
} from "../middleware/validationMiddleware.js";

import {
  createDriverSchema,
  updateDriverSchema,
  driverQuerySchema,
} from "../validators/driverValidator.js";

const router = express.Router();

// ===================================
// GET ROUTES
// ===================================

// GET /api/drivers
router.get(
  "/",
  protect,
  validateQuery(driverQuerySchema),
  getDrivers
);

// GET /api/drivers/available
router.get(
  "/available",
  protect,
  getAvailableDrivers
);

// GET /api/drivers/:id
router.get(
  "/:id",
  protect,
  getDriverById
);

// ===================================
// POST ROUTES
// ===================================

// Fleet Manager & Safety Officer
router.post(
  "/",
  protect,
  authorize("FLEET_MANAGER", "SAFETY_OFFICER"),
  validateBody(createDriverSchema),
  createDriver
);

// ===================================
// PATCH ROUTES
// ===================================

// Fleet Manager & Safety Officer
router.patch(
  "/:id",
  protect,
  authorize("FLEET_MANAGER", "SAFETY_OFFICER"),
  validateBody(updateDriverSchema),
  updateDriver
);

export default router;