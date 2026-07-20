import prisma from "../lib/prisma.js";

export const globalSearch = async (query) => {
  const [drivers, vehicles, trips, fuelLogs, expenses] =
    await Promise.all([
      prisma.driver.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              licenseNumber: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        take: 5,
      }),

      prisma.vehicle.findMany({
        where: {
          OR: [
            {
              regNumber: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              model: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        take: 5,
      }),

      prisma.trip.findMany({
        where: {
          OR: [
            {
              source: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              destination: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          driver: true,
          vehicle: true,
        },
        take: 5,
      }),

      prisma.fuelLog.findMany({
        where: {
          vehicle: {
            OR: [
              {
                regNumber: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
        include: {
          vehicle: true,
        },
        take: 5,
      }),

      prisma.expense.findMany({
        where: {
          OR: [
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              type: {
                equals: query.toUpperCase(),
              },
            },
          ],
        },
        include: {
          vehicle: true,
        },
        take: 5,
      }),
    ]);

  return {
    drivers,
    vehicles,
    trips,
    fuelLogs,
    expenses,
  };
};