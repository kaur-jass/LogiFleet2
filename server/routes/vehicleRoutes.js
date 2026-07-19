import express from "express";

import {
  createVehicle,
  getVehicles,
  getVehicleById,
  getAvailableVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  validateBody,
  validateQuery,
} from "../middleware/validationMiddleware.js";

import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
} from "../validators/vehicleValidator.js";

const router = express.Router();


// GET /api/vehicles
router.get(
  "/",
  protect,
  validateQuery(vehicleQuerySchema),
  getVehicles
);

// GET /api/vehicles/available
router.get(
  "/available",
  protect,
  getAvailableVehicles
);

// GET /api/vehicles/:id
router.get(
  "/:id",
  protect,
  getVehicleById
);



// POST /api/vehicles
router.post(
  "/",
  protect,
  authorize("FLEET_MANAGER"),
  validateBody(createVehicleSchema),
  createVehicle
);



// PATCH /api/vehicles/:id
router.patch(
  "/:id",
  protect,
  authorize("FLEET_MANAGER"),
  validateBody(updateVehicleSchema),
  updateVehicle
);



// DELETE /api/vehicles/:id
router.delete(
  "/:id",
  protect,
  authorize("FLEET_MANAGER"),
  deleteVehicle
);

export default router;