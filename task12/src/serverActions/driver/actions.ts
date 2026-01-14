"use server";

import { db } from "@/db";
import { rides, bookings, users } from "@/db/schema";
import { user as authUser } from "@/db/auth-schema";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserRole } from "@/lib/rbac";
import { eq, and, sql, desc } from "drizzle-orm";

export async function getDriverStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    // Get user record to get the internal ID
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    // Get active rides count
    const [activeRidesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rides)
      .where(and(eq(rides.driverId, driverId), eq(rides.status, "active")));

    const activeRides = Number(activeRidesResult?.count || 0);

    // Get sum of available seats in active rides
    const [availableSeatsResult] = await db
      .select({ total: sql<number>`coalesce(sum(${rides.availableSeats}), 0)` })
      .from(rides)
      .where(and(eq(rides.driverId, driverId), eq(rides.status, "active")));

    const availableSeats = Number(availableSeatsResult?.total || 0);

    // Get carbon saved (sum of booked seats * carbon_saved_per_seat for active/completed rides)
    const carbonSavedResult = await db
      .select({
        carbonSaved: sql<number>`coalesce(sum(${bookings.seatsBooked} * ${rides.carbonSavedPerSeat}), 0)`,
      })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .where(
        and(
          eq(rides.driverId, driverId),
          sql`${rides.status} IN ('active', 'completed')`,
          eq(bookings.status, "confirmed")
        )
      );

    const carbonSaved = Number(carbonSavedResult[0]?.carbonSaved || 0);

    return {
      success: true,
      data: {
        activeRides,
        availableSeats,
        carbonSaved: Math.round(carbonSaved * 100) / 100, // Round to 2 decimal places
      },
    };
  } catch (error) {
    console.error("Error getting driver stats:", error);
    return { error: "Failed to fetch driver statistics" };
  }
}

export async function getDriverRides() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    const driverRides = await db
      .select({
        id: rides.id,
        startLocation: rides.startLocation,
        endLocation: rides.endLocation,
        startLat: rides.startLat,
        startLng: rides.startLng,
        endLat: rides.endLat,
        endLng: rides.endLng,
        departureTime: rides.departureTime,
        totalSeats: rides.totalSeats,
        availableSeats: rides.availableSeats,
        status: rides.status,
        distance: rides.distance,
        carbonSavedPerSeat: rides.carbonSavedPerSeat,
        createdAt: rides.createdAt,
      })
      .from(rides)
      .where(eq(rides.driverId, driverId))
      .orderBy(desc(rides.createdAt));

    // Get request counts for each ride
    const ridesWithRequestCount = await Promise.all(
      driverRides.map(async (ride) => {
        const [requestCountResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(bookings)
          .where(
            and(
              eq(bookings.rideId, ride.id),
              eq(bookings.status, "pending")
            )
          );

        return {
          ...ride,
          requestCount: Number(requestCountResult?.count || 0),
        };
      })
    );

    return {
      success: true,
      data: ridesWithRequestCount,
    };
  } catch (error) {
    console.error("Error getting driver rides:", error);
    return { error: "Failed to fetch rides" };
  }
}

export async function getCurrentActiveRide() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    // Get the most recent active ride
    const [activeRide] = await db
      .select({
        id: rides.id,
        startLocation: rides.startLocation,
        endLocation: rides.endLocation,
        startLat: rides.startLat,
        startLng: rides.startLng,
        endLat: rides.endLat,
        endLng: rides.endLng,
        departureTime: rides.departureTime,
        totalSeats: rides.totalSeats,
        availableSeats: rides.availableSeats,
        distance: rides.distance,
        carbonSavedPerSeat: rides.carbonSavedPerSeat,
      })
      .from(rides)
      .where(and(eq(rides.driverId, driverId), eq(rides.status, "active")))
      .orderBy(desc(rides.createdAt))
      .limit(1);

    if (!activeRide) {
      return { success: true, data: null };
    }

    // Get request count for active ride
    const [requestCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.rideId, activeRide.id),
          eq(bookings.status, "pending")
        )
      );

    return {
      success: true,
      data: {
        ...activeRide,
        requestCount: Number(requestCountResult?.count || 0),
      },
    };
  } catch (error) {
    console.error("Error getting current active ride:", error);
    return { error: "Failed to fetch active ride" };
  }
}

export async function getRideBookings(rideId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    // Verify the ride belongs to this driver
    const [ride] = await db
      .select()
      .from(rides)
      .where(and(eq(rides.id, rideId), eq(rides.driverId, driverId)))
      .limit(1);

    if (!ride) {
      return { error: "Ride not found or unauthorized" };
    }

    // Get bookings for this ride with passenger info
    const rideBookings = await db
      .select({
        id: bookings.id,
        passengerId: bookings.passengerId,
        seatsBooked: bookings.seatsBooked,
        status: bookings.status,
        bookingTime: bookings.bookingTime,
        passengerUserId: users.userId,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.passengerId, users.id))
      .where(eq(bookings.rideId, rideId))
      .orderBy(desc(bookings.bookingTime));

    // Get passenger details from auth user table
    const bookingsWithPassengerInfo = await Promise.all(
      rideBookings.map(async (booking) => {
        const [authUserData] = await db
          .select({
            name: authUser.name,
            email: authUser.email,
          })
          .from(authUser)
          .where(eq(authUser.id, booking.passengerUserId))
          .limit(1);

        return {
          id: booking.id,
          passengerId: booking.passengerId,
          seatsBooked: booking.seatsBooked,
          status: booking.status,
          bookingTime: booking.bookingTime,
          passengerName: authUserData?.name || "Unknown",
          passengerEmail: authUserData?.email || "Unknown",
        };
      })
    );

    return {
      success: true,
      data: bookingsWithPassengerInfo,
    };
  } catch (error) {
    console.error("Error getting ride bookings:", error);
    return { error: "Failed to fetch bookings" };
  }
}

export async function updateBookingStatus(
  bookingId: number,
  status: "confirmed" | "cancelled"
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    // Get booking and verify it belongs to driver's ride
    const [booking] = await db
      .select({
        bookingId: bookings.id,
        rideId: bookings.rideId,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return { error: "Booking not found" };
    }

    // Verify ride belongs to driver
    const [ride] = await db
      .select()
      .from(rides)
      .where(and(eq(rides.id, booking.rideId), eq(rides.driverId, driverId)))
      .limit(1);

    if (!ride) {
      return { error: "Unauthorized - Ride does not belong to driver" };
    }

    // Update booking status
    await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    // If confirmed, update available seats
    if (status === "confirmed") {
      const [bookingData] = await db
        .select({ seatsBooked: bookings.seatsBooked })
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (bookingData) {
        await db
          .update(rides)
          .set({
            availableSeats: sql`${rides.availableSeats} - ${bookingData.seatsBooked}`,
            updatedAt: new Date(),
          })
          .where(eq(rides.id, booking.rideId));
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { error: "Failed to update booking status" };
  }
}

export async function createRide(rideData: {
  startLocation: string;
  endLocation: string;
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  distance?: number | null;
  carbonSavedPerSeat?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    // Check if driver already has an active ride
    const [existingActiveRide] = await db
      .select()
      .from(rides)
      .where(and(eq(rides.driverId, driverId), eq(rides.status, "active")))
      .limit(1);

    if (existingActiveRide) {
      return {
        error: "You already have an active ride. Please complete or cancel it before creating a new one.",
      };
    }

    // Validate seats
    if (rideData.totalSeats < 1 || rideData.availableSeats < 1) {
      return { error: "Total seats and available seats must be at least 1" };
    }

    if (rideData.availableSeats > rideData.totalSeats) {
      return { error: "Available seats cannot exceed total seats" };
    }

    // Create the ride
    const [newRide] = await db
      .insert(rides)
      .values({
        driverId,
        startLocation: rideData.startLocation,
        endLocation: rideData.endLocation,
        startLat: rideData.startLat || null,
        startLng: rideData.startLng || null,
        endLat: rideData.endLat || null,
        endLng: rideData.endLng || null,
        departureTime: rideData.departureTime,
        totalSeats: rideData.totalSeats,
        availableSeats: rideData.availableSeats,
        distance: rideData.distance,
        status: "active",
        carbonSavedPerSeat: rideData.carbonSavedPerSeat || 0,
      })
      .returning();

    return {
      success: true,
      data: newRide,
    };
  } catch (error) {
    console.error("Error creating ride:", error);
    return { error: "Failed to create ride" };
  }
}

export async function cancelRide(rideId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    // Verify ride belongs to driver and is active
    const [ride] = await db
      .select()
      .from(rides)
      .where(
        and(
          eq(rides.id, rideId),
          eq(rides.driverId, driverId),
          eq(rides.status, "active")
        )
      )
      .limit(1);

    if (!ride) {
      return {
        error: "Ride not found, not authorized, or already cancelled/completed",
      };
    }

    // Update ride status to cancelled
    await db
      .update(rides)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(rides.id, rideId));

    // Only cancel pending bookings - keep confirmed bookings for carbon saved calculation
    await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookings.rideId, rideId),
          eq(bookings.status, "pending")
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return { error: "Failed to cancel ride" };
  }
}

export async function completeRide(rideId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "driver") {
      return { error: "Unauthorized - Driver access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const driverId = userRecord.id;

    // Verify ride belongs to driver and is active
    const [ride] = await db
      .select()
      .from(rides)
      .where(
        and(
          eq(rides.id, rideId),
          eq(rides.driverId, driverId),
          eq(rides.status, "active")
        )
      )
      .limit(1);

    if (!ride) {
      return {
        error: "Ride not found, not authorized, or already completed/cancelled",
      };
    }

    // Update ride status to completed
    await db
      .update(rides)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(rides.id, rideId));

    // Only cancel pending bookings - keep confirmed bookings for carbon saved calculation
    await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookings.rideId, rideId),
          eq(bookings.status, "pending")
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error completing ride:", error);
    return { error: "Failed to complete ride" };
  }
}
