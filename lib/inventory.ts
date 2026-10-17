import { prisma } from "./prisma";

/**
 * Reserve a unique unit for checkout. Prevents double-selling.
 * Default is 30 minutes for manual mode, 10 minutes for gateway mode.
 */
export async function reserveUnit(unitId: string, minutes = 30): Promise<boolean> {
  const now = new Date();
  const until = new Date(Date.now() + minutes * 60_000);

  // In SQLite/Prisma, find the unit first to verify atomic state
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
  });

  if (!unit) return false;

  // Unit can be reserved if it's AVAILABLE or if prior RESERVED has expired
  const isAvailable =
    unit.status === "AVAILABLE" ||
    (unit.status === "RESERVED" && unit.reservedUntil && unit.reservedUntil < now);

  if (!isAvailable) {
    return false;
  }

  const updated = await prisma.unit.update({
    where: { id: unitId },
    data: {
      status: "RESERVED",
      reservedUntil: until,
    },
  });

  return !!updated;
}

/**
 * Release reservations that have expired and have no submitted payment.
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date();

  // Find reserved units whose timer has expired
  const expiredUnits = await prisma.unit.findMany({
    where: {
      status: "RESERVED",
      reservedUntil: { lt: now },
      order: {
        OR: [
          { status: "AWAITING_PAYMENT" },
          { status: "PENDING" },
          { status: "FAILED" },
        ],
      },
    },
  });

  if (expiredUnits.length === 0) return 0;

  let released = 0;
  for (const unit of expiredUnits) {
    await prisma.unit.update({
      where: { id: unit.id },
      data: {
        status: "AVAILABLE",
        reservedUntil: null,
      },
    });
    released++;
  }

  return released;
}

/**
 * Mark a unit as permanently SOLD upon verified payment.
 */
export async function markUnitSold(unitId: string) {
  return await prisma.unit.update({
    where: { id: unitId },
    data: {
      status: "SOLD",
      reservedUntil: null,
    },
  });
}

/**
 * Release a unit back to AVAILABLE (e.g. cancelled order or rejected UTR).
 */
export async function releaseUnit(unitId: string) {
  return await prisma.unit.update({
    where: { id: unitId },
    data: {
      status: "AVAILABLE",
      reservedUntil: null,
    },
  });
}
