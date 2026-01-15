"use server";

import { db } from "@/db";
import { rides, bookings, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserRole } from "@/lib/rbac";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";

export async function getAdminStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return { error: "Unauthorized - Admin access only" };
    }

    // Total rides
    const [totalRidesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rides);

    const totalRides = Number(totalRidesResult?.count || 0);

    // Active rides
    const [activeRidesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rides)
      .where(eq(rides.status, "active"));

    const activeRides = Number(activeRidesResult?.count || 0);

    // Completed rides
    const [completedRidesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rides)
      .where(eq(rides.status, "completed"));

    const completedRides = Number(completedRidesResult?.count || 0);

    // Total bookings
    const [totalBookingsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"));

    const totalBookings = Number(totalBookingsResult?.count || 0);

    // Total carbon saved (from confirmed bookings on completed/active rides)
    const [carbonSavedResult] = await db
      .select({
        totalCarbon: sql<number>`coalesce(sum(${bookings.seatsBooked} * ${rides.carbonSavedPerSeat}), 0)`,
      })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .where(
        and(
          eq(bookings.status, "confirmed"),
          sql`${rides.status} IN ('active', 'completed')`
        )
      );

    const totalCarbonSaved = Number(carbonSavedResult?.totalCarbon || 0);

    // Total passengers
    const [totalPassengersResult] = await db
      .select({ count: sql<number>`count(distinct ${bookings.passengerId})` })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"));

    const totalPassengers = Number(totalPassengersResult?.count || 0);

    // Total drivers
    const [totalDriversResult] = await db
      .select({ count: sql<number>`count(distinct ${rides.driverId})` })
      .from(rides);

    const totalDrivers = Number(totalDriversResult?.count || 0);

    // Rides by status
    const ridesByStatus = await db
      .select({
        status: rides.status,
        count: sql<number>`count(*)`,
      })
      .from(rides)
      .groupBy(rides.status);

    // Carbon saved over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const carbonOverTime = await db
      .select({
        date: sql<string>`to_char(${rides.createdAt}, 'YYYY-MM-DD')`,
        carbon: sql<number>`coalesce(sum(${bookings.seatsBooked} * ${rides.carbonSavedPerSeat}), 0)`,
      })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .where(
        and(
          eq(bookings.status, "confirmed"),
          sql`${rides.status} IN ('active', 'completed')`,
          gte(rides.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`to_char(${rides.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${rides.createdAt}, 'YYYY-MM-DD')`);

    // Rides over time (last 30 days)
    const ridesOverTime = await db
      .select({
        date: sql<string>`to_char(${rides.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(rides)
      .where(gte(rides.createdAt, thirtyDaysAgo))
      .groupBy(sql`to_char(${rides.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${rides.createdAt}, 'YYYY-MM-DD')`);

    return {
      success: true,
      data: {
        totalRides,
        activeRides,
        completedRides,
        totalBookings,
        totalCarbonSaved: Math.round(totalCarbonSaved * 100) / 100,
        totalPassengers,
        totalDrivers,
        ridesByStatus: ridesByStatus.map((r) => ({
          status: r.status,
          count: Number(r.count),
        })),
        carbonOverTime: carbonOverTime.map((c) => ({
          date: c.date,
          carbon: Number(c.carbon),
        })),
        ridesOverTime: ridesOverTime.map((r) => ({
          date: r.date,
          count: Number(r.count),
        })),
      },
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return { error: "Failed to fetch admin statistics" };
  }
}
