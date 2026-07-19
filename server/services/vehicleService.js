import prisma from "../lib/prisma.js";

// ==============================
// CREATE VEHICLE
// ==============================
export const createVehicle = async (data) => {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      regNumber: data.regNumber,
    },
  });

  if (existingVehicle) {
    const error = new Error("Registration number already exists");
    error.code = "CONFLICT";
    throw error;
  }

  return await prisma.vehicle.create({
    data,
  });
};

// ==============================
// GET ALL VEHICLES
// ==============================
export const getVehicles = async (query) => {
  const { status, type, region, search } = query;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (region) {
    where.region = region;
  }

  if (search) {
    where.OR = [
      {
        regNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        model: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        type: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return await prisma.vehicle.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==============================
// GET AVAILABLE VEHICLES
// ==============================
export const getAvailableVehicles = async () => {
  return await prisma.vehicle.findMany({
    where: {
      status: "AVAILABLE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==============================
// GET VEHICLE BY ID
// ==============================
export const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  return vehicle;
};

// ==============================
// UPDATE VEHICLE
// ==============================
export const updateVehicle = async (id, data) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  // Duplicate Registration Number Check
  if (
    data.regNumber &&
    data.regNumber !== vehicle.regNumber
  ) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        regNumber: data.regNumber,
      },
    });

    if (existingVehicle) {
      const error = new Error("Registration number already exists");
      error.code = "CONFLICT";
      throw error;
    }
  }

  return await prisma.vehicle.update({
    where: {
      id,
    },
    data,
  });
};

// ==============================
// SOFT DELETE VEHICLE
// ==============================
export const deleteVehicle = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  return await prisma.vehicle.update({
    where: {
      id,
    },
    data: {
      status: "RETIRED",
    },
  });
};