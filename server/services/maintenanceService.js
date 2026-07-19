import prisma from "../lib/prisma.js";

// ===================================
// CREATE MAINTENANCE
// ===================================
export const createMaintenance = async (data) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: data.vehicleId,
    },
  });

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  if (vehicle.status === "RETIRED") {
    const error = new Error(
      "Cannot create maintenance for a retired vehicle"
    );
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        description: data.description,
        cost: data.cost,
      },
    });

    await tx.vehicle.update({
      where: {
        id: data.vehicleId,
      },
      data: {
        status: "IN_SHOP",
      },
    });

    return log;
  });

  return result;
};

// ===================================
// GET ALL MAINTENANCE LOGS
// ===================================
export const getMaintenanceLogs = async (query) => {
  const { vehicleId, status } = query;

  const where = {};

  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  if (status) {
    where.status = status;
  }

  return await prisma.maintenanceLog.findMany({
    where,
    include: {
      vehicle: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ===================================
// CLOSE MAINTENANCE
// ===================================
export const closeMaintenance = async (id) => {
  const maintenance = await prisma.maintenanceLog.findUnique({
    where: {
      id,
    },
    include: {
      vehicle: true,
    },
  });

  if (!maintenance) {
    const error = new Error("Maintenance log not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  if (maintenance.status === "CLOSED") {
    const error = new Error("Maintenance already closed");
    error.code = "CONFLICT";
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedLog = await tx.maintenanceLog.update({
      where: {
        id,
      },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    if (maintenance.vehicle.status !== "RETIRED") {
      await tx.vehicle.update({
        where: {
          id: maintenance.vehicleId,
        },
        data: {
          status: "AVAILABLE",
        },
      });
    }

    return updatedLog;
  });

  return result;
};