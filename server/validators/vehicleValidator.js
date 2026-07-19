import { z } from "zod";

const vehicleStatus = z.enum([
  "AVAILABLE",
  "ON_TRIP",
  "IN_SHOP",
  "RETIRED",
]);

export const createVehicleSchema = z.object({
  regNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required"),

  name: z
    .string()
    .trim()
    .min(1, "Vehicle name is required"),

  model: z
    .string()
    .trim()
    .min(1, "Vehicle model is required"),

  type: z
    .string()
    .trim()
    .min(1, "Vehicle type is required"),

  maxLoadCapacity: z.coerce
    .number()
    .positive("Maximum load capacity must be greater than 0"),

  acquisitionCost: z.coerce
    .number()
    .positive("Acquisition cost must be greater than 0"),

  region: z
    .string()
    .trim()
    .optional(),

  status: vehicleStatus.optional(),
});

export const updateVehicleSchema = createVehicleSchema
  .partial()
  .refine(
    (data) =>
      !data.status ||
      !["ON_TRIP", "IN_SHOP", "RETIRED"].includes(data.status),
    {
      message:
        "Vehicle status can only be changed through Trip or Maintenance.",
      path: ["status"],
    }
  );

export const vehicleQuerySchema = z.object({
  status: z.string().optional(),

  type: z.string().optional(),

  region: z.string().optional(),

  search: z.string().optional(),
});