import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z
    .string()
    .uuid("Invalid vehicle id"),

  type: z
    .string()
    .trim()
    .min(1, "Maintenance type is required"),

  description: z
    .string()
    .trim()
    .optional(),

  cost: z.coerce
    .number()
    .positive("Cost must be greater than 0"),
});

export const maintenanceQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),

  status: z.enum([
    "ACTIVE",
    "CLOSED",
  ]).optional(),
});