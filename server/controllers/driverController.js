import * as driverService from "../services/driverService.js";
import {
  successResponse,
  errorResponse,
} from "../utils/response.js";
import { createNotification } from "../services/notificationService.js";

// ==============================
// CREATE DRIVER
// ==============================
export const createDriver = async (req, res) => {
  try {
    const driver = await driverService.createDriver(req.body);


    await createNotification({
      title: "Driver Added",
      message: `${driver.name} has been added to the fleet.`,
      type: "DRIVER",
      priority: "MEDIUM",
      actionUrl: `/drivers?driverId=${driver.id}`,
      entityId: driver.id,
    });

    return successResponse(
      res,
      {
        driver,
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
// GET ALL DRIVERS
// ==============================
export const getDrivers = async (req, res) => {
  console.log("✅ Driver Controller Hit");
  console.log(req.user);

  try {
    const drivers = await driverService.getDrivers(req.query);

    console.log("Drivers from service:", drivers);

    return successResponse(res, { drivers });
  } catch (error) {
    console.error("Controller Error:", error);

    return errorResponse(
      res,
      "INTERNAL_SERVER_ERROR",
      error.message,
      500
    );
  }
};

// ==============================
// GET AVAILABLE DRIVERS
// ==============================
export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await driverService.getAvailableDrivers();

    return successResponse(res, {
      drivers,
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
// GET DRIVER BY ID
// ==============================
export const getDriverById = async (req, res) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);

    return successResponse(res, {
      driver,
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
// UPDATE DRIVER
// ==============================
export const updateDriver = async (req, res) => {
  try {
    const driver = await driverService.updateDriver(
      req.params.id,
      req.body, 
      req.user.role
    );

    let title = "Driver Updated";
    let priority = "LOW";

    if (driver.status === "SUSPENDED") {
      title = "Driver Suspended";
      priority = "HIGH";
    }

    await createNotification({
      title,
      message: `${driver.name} has been ${driver.status === "SUSPENDED" ? "suspended" : "updated"}.`,
      type: "DRIVER",
      priority,
      actionUrl: `/drivers?driverId=${driver.id}`,
      entityId: driver.id,
    });

    return successResponse(res, {
      driver,
    });
  } catch (error) {
    const statusMap = {
      NOT_FOUND: 404,
      CONFLICT: 409,
      VALIDATION_ERROR: 400,
      FORBIDDEN: 403,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};