import { z } from "zod";

const driverStatus = z.enum([
  "AVAILABLE",
  "ON_TRIP",
  "OFF_DUTY",
  "SUSPENDED",
]);

export const createDriverSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Driver name is required"),

  licenseNumber: z
    .string()
    .trim()
    .min(1, "License number is required"),

  licenseCategory: z
    .string()
    .trim()
    .min(1, "License category is required"),

  licenseExpiry: z.coerce.date({
    errorMap: () => ({
      message: "Valid license expiry date is required",
    }),
  }),

  contactNumber: z
    .string()
    .trim()
    .min(10, "Contact number must be at least 10 digits"),

  status: driverStatus.optional(),

  safetyScore: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

export const driverQuerySchema = z.object({
  status: z.string().optional(),

  licenseCategory: z.string().optional(),

  search: z.string().optional(),
});