import * as maintenanceService from "../services/maintenanceService.js";
import {
  successResponse,
  errorResponse,
} from "../utils/response.js";
import { createNotification } from "../services/notificationService.js";

// ===================================
// CREATE MAINTENANCE
// ===================================
export const createMaintenance = async (req, res) => {
  try {
    const log = await maintenanceService.createMaintenance(req.body);

    await createNotification({
      title: "Maintenance Scheduled",
      message: `${log.type} maintenance scheduled for ${log.vehicle.regNumber}.`,
      type: "MAINTENANCE",
      priority: "MEDIUM",
      actionUrl: `/maintenance?maintenanceId=${log.id}`,
      entityId: log.id,
    });

    return successResponse(
      res,
      {
        log,
      },
      201
    );
  } catch (error) {
    const statusMap = {
      VALIDATION_ERROR: 400,
      NOT_FOUND: 404,
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

// ===================================
// GET MAINTENANCE LOGS
// ===================================
export const getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await maintenanceService.getMaintenanceLogs(req.query);

    return successResponse(res, {
      logs,
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

// ===================================
// CLOSE MAINTENANCE
// ===================================
export const closeMaintenance = async (req, res) => {
  try {
    const log = await maintenanceService.closeMaintenance(req.params.id);

    await createNotification({
      title: "Maintenance Completed",
      message: `${log.type} maintenance completed for ${log.vehicle.regNumber}.`,
      type: "MAINTENANCE",
      priority: "LOW",
      actionUrl: `/maintenance?maintenanceId=${log.id}`,
      entityId: log.id,
    });

    return successResponse(res, {
      log,
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