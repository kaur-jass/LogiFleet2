import * as vehicleService from "../services/vehicleService.js";
import {
  successResponse,
  errorResponse,
} from "../utils/response.js";
import { createNotification } from "../services/notificationService.js";

// ==============================
// CREATE VEHICLE
// ==============================
export const createVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    await createNotification({
      title: "Vehicle Added",
      message: `${vehicle.name} (${vehicle.regNumber}) has been added to the fleet.`,
      type: "VEHICLE",
      priority: "MEDIUM",
      actionUrl: `/vehicles?vehicleId=${vehicle.id}`,
      entityId: vehicle.id,
    });

    return successResponse(
      res,
      {
        vehicle,
      },
      201
    );
  } catch (error) {
    const statusMap = {
      VALIDATION_ERROR: 400,
      CONFLICT: 409,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};

// ==============================
// GET ALL VEHICLES
// ==============================
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getVehicles(req.query);

    return successResponse(res, {
      vehicles,
    });
  } catch (error) {
    return errorResponse(
      res,
      "INTERNAL_SERVER_ERROR",
      error.message,
      500
    );
  }
};

// ==============================
// GET AVAILABLE VEHICLES
// ==============================
export const getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAvailableVehicles();

    return successResponse(res, {
      vehicles,
    });
  } catch (error) {
    return errorResponse(
      res,
      "INTERNAL_SERVER_ERROR",
      error.message,
      500
    );
  }
};

// ==============================
// GET VEHICLE BY ID
// ==============================
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    return successResponse(res, {
      vehicle,
    });
  } catch (error) {
    const statusMap = {
      NOT_FOUND: 404,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};

// ==============================
// UPDATE VEHICLE
// ==============================
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(
      req.params.id,
      req.body
    );

    await createNotification({
      title: "Vehicle Updated",
      message: `${vehicle.name} (${vehicle.regNumber}) has been updated.`,
      type: "VEHICLE",
      priority: "LOW",
      actionUrl: `/vehicles?vehicleId=${vehicle.id}`,
      entityId: vehicle.id,
    });

    return successResponse(res, {
      vehicle,
    });
  } catch (error) {
    const statusMap = {
      NOT_FOUND: 404,
      CONFLICT: 409,
      VALIDATION_ERROR: 400,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};

// ==============================
// DELETE VEHICLE (SOFT DELETE)
// ==============================
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.deleteVehicle(
      req.params.id
    );

    await createNotification({
      title: "Vehicle Retired",
      message: `${vehicle.name} (${vehicle.regNumber}) has been retired from the fleet.`,
      type: "VEHICLE",
      priority: "HIGH",
      actionUrl: `/vehicles?vehicleId=${vehicle.id}`,
      entityId: vehicle.id,
    });

    return successResponse(res, {
      vehicle,
});
  } catch (error) {
    const statusMap = {
      NOT_FOUND: 404,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};