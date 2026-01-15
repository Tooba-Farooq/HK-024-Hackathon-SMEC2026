"use server";

import { db } from "@/db";
import { rides, bookings, users } from "@/db/schema";
import { user as authUser } from "@/db/auth-schema";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserRole } from "@/lib/rbac";
import { eq, and, sql, desc, gte, lte, or, ilike } from "drizzle-orm";

export async function getPassengerStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "passenger" && role !== "admin") {
      return { error: "Unauthorized - Passenger access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const passengerId = userRecord.id;

    // Get active bookings count (confirmed bookings for active/completed rides)
    const [activeBookingsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .where(
        and(
          eq(bookings.passengerId, passengerId),
          eq(bookings.status, "confirmed"),
          sql`${rides.status} IN ('active', 'completed')`
        )
      );

    const activeBookings = Number(activeBookingsResult?.count || 0);

    // Get total seats booked (sum of confirmed bookings)
    const [seatsBookedResult] = await db
      .select({ total: sql<number>`coalesce(sum(${bookings.seatsBooked}), 0)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.passengerId, passengerId),
          eq(bookings.status, "confirmed")
        )
      );

    const seatsBooked = Number(seatsBookedResult?.total || 0);

    // Get total carbon saved (sum of seats booked * carbon_saved_per_seat for confirmed bookings)
    const carbonSavedResult = await db
      .select({
        carbonSaved: sql<number>`coalesce(sum(${bookings.seatsBooked} * ${rides.carbonSavedPerSeat}), 0)`,
      })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .where(
        and(
          eq(bookings.passengerId, passengerId),
          eq(bookings.status, "confirmed")
        )
      );

    const carbonSaved = Number(carbonSavedResult[0]?.carbonSaved || 0);

    return {
      success: true,
      data: {
        activeBookings,
        seatsBooked,
        carbonSaved: Math.round(carbonSaved * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Error getting passenger stats:", error);
    return { error: "Failed to fetch passenger statistics" };
  }
}

export async function getActiveBooking() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "passenger" && role !== "admin") {
      return { error: "Unauthorized - Passenger access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const passengerId = userRecord.id;

    // Get active confirmed booking with ride details
    const [activeBooking] = await db
      .select({
        bookingId: bookings.id,
        seatsBooked: bookings.seatsBooked,
        bookingTime: bookings.bookingTime,
        rideId: rides.id,
        startLocation: rides.startLocation,
        endLocation: rides.endLocation,
        departureTime: rides.departureTime,
        distance: rides.distance,
        carbonSavedPerSeat: rides.carbonSavedPerSeat,
        driverUserId: users.userId,
      })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .innerJoin(users, eq(rides.driverId, users.id))
      .where(
        and(
          eq(bookings.passengerId, passengerId),
          eq(bookings.status, "confirmed"),
          eq(rides.status, "active")
        )
      )
      .orderBy(desc(bookings.bookingTime))
      .limit(1);

    if (!activeBooking) {
      return { success: true, data: null };
    }

    // Get driver name from auth user table
    const [driverAuthUser] = await db
      .select({ name: authUser.name, email: authUser.email })
      .from(authUser)
      .where(eq(authUser.id, activeBooking.driverUserId))
      .limit(1);

    return {
      success: true,
      data: {
        ...activeBooking,
        driverName: driverAuthUser?.name || "Unknown",
        driverEmail: driverAuthUser?.email || "Unknown",
      },
    };
  } catch (error) {
    console.error("Error getting active booking:", error);
    return { error: "Failed to fetch active booking" };
  }
}

export async function searchRides(filters: {
  startLocation?: string;
  endLocation?: string;
  date?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "passenger" && role !== "admin") {
      return { error: "Unauthorized - Passenger access only" };
    }

    // Build conditions array
    const conditions = [
      eq(rides.status, "active"),
      sql`${rides.availableSeats} > 0`,
    ];

    if (filters.startLocation) {
      conditions.push(ilike(rides.startLocation, `%${filters.startLocation}%`));
    }

    if (filters.endLocation) {
      conditions.push(ilike(rides.endLocation, `%${filters.endLocation}%`));
    }

    if (filters.date) {
      const searchDate = new Date(filters.date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(gte(rides.departureTime, startOfDay));
      conditions.push(lte(rides.departureTime, endOfDay));
    }

    const searchResults = await db
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
        driverUserId: users.userId,
        createdAt: rides.createdAt,
      })
      .from(rides)
      .innerJoin(users, eq(rides.driverId, users.id))
      .where(and(...conditions))
      .orderBy(desc(rides.createdAt));

    // Get driver names for each ride
    const ridesWithDrivers = await Promise.all(
      searchResults.map(async (ride) => {
        const [driverAuthUser] = await db
          .select({ name: authUser.name, email: authUser.email })
          .from(authUser)
          .where(eq(authUser.id, ride.driverUserId))
          .limit(1);

        return {
          ...ride,
          driverName: driverAuthUser?.name || "Unknown",
          driverEmail: driverAuthUser?.email || "Unknown",
        };
      })
    );

    return {
      success: true,
      data: ridesWithDrivers,
    };
  } catch (error) {
    console.error("Error searching rides:", error);
    return { error: "Failed to search rides" };
  }
}

export async function bookRide(rideId: number, seatsBooked: number = 1) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "passenger" && role !== "admin") {
      return { error: "Unauthorized - Passenger access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const passengerId = userRecord.id;

    // Check if passenger already has an active confirmed booking (only for active rides)
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .where(
        and(
          eq(bookings.passengerId, passengerId),
          eq(bookings.status, "confirmed"),
          eq(rides.status, "active")
        )
      )
      .limit(1);

    if (existingBooking) {
      return {
        error: "You already have an active booking. Please cancel it before booking a new ride.",
      };
    }

    // Verify ride exists and has available seats
    const [ride] = await db
      .select()
      .from(rides)
      .where(
        and(
          eq(rides.id, rideId),
          eq(rides.status, "active"),
          sql`${rides.availableSeats} >= ${seatsBooked}`
        )
      )
      .limit(1);

    if (!ride) {
      return {
        error: "Ride not found, not active, or insufficient seats available",
      };
    }

    // Check if passenger already has a pending booking for this ride
    const [existingPendingBooking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.rideId, rideId),
          eq(bookings.passengerId, passengerId),
          eq(bookings.status, "pending")
        )
      )
      .limit(1);

    if (existingPendingBooking) {
      return {
        error: "You already have a pending booking request for this ride",
      };
    }

    // Create booking
    await db.insert(bookings).values({
      rideId,
      passengerId,
      seatsBooked,
      status: "pending",
    });

    return { success: true };
  } catch (error) {
    console.error("Error booking ride:", error);
    return { error: "Failed to book ride" };
  }
}

export async function cancelBooking(bookingId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "passenger" && role !== "admin") {
      return { error: "Unauthorized - Passenger access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const passengerId = userRecord.id;

    // Verify booking belongs to passenger
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, bookingId), eq(bookings.passengerId, passengerId))
      )
      .limit(1);

    if (!booking) {
      return { error: "Booking not found or unauthorized" };
    }

    // Only allow canceling pending or confirmed bookings
    if (booking.status === "cancelled") {
      return { error: "Booking is already cancelled" };
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // If booking was confirmed, restore available seats
    if (booking.status === "confirmed") {
      await db
        .update(rides)
        .set({
          availableSeats: sql`${rides.availableSeats} + ${booking.seatsBooked}`,
          updatedAt: new Date(),
        })
        .where(eq(rides.id, booking.rideId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return { error: "Failed to cancel booking" };
  }
}

export async function getRideHistory() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "passenger" && role !== "admin") {
      return { error: "Unauthorized - Passenger access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const passengerId = userRecord.id;

    // Get all confirmed bookings with ride details
    const history = await db
      .select({
        bookingId: bookings.id,
        seatsBooked: bookings.seatsBooked,
        bookingTime: bookings.bookingTime,
        rideId: rides.id,
        startLocation: rides.startLocation,
        endLocation: rides.endLocation,
        departureTime: rides.departureTime,
        distance: rides.distance,
        carbonSavedPerSeat: rides.carbonSavedPerSeat,
        rideStatus: rides.status,
        driverUserId: users.userId,
      })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .innerJoin(users, eq(rides.driverId, users.id))
      .where(
        and(
          eq(bookings.passengerId, passengerId),
          eq(bookings.status, "confirmed")
        )
      )
      .orderBy(desc(bookings.bookingTime));

    // Get driver names
    const historyWithDrivers = await Promise.all(
      history.map(async (item) => {
        const [driverAuthUser] = await db
          .select({ name: authUser.name, email: authUser.email })
          .from(authUser)
          .where(eq(authUser.id, item.driverUserId))
          .limit(1);

        return {
          ...item,
          driverName: driverAuthUser?.name || "Unknown",
          driverEmail: driverAuthUser?.email || "Unknown",
        };
      })
    );

    return {
      success: true,
      data: historyWithDrivers,
    };
  } catch (error) {
    console.error("Error getting ride history:", error);
    return { error: "Failed to fetch ride history" };
  }
}

export async function getAllBookings() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    if (role !== "passenger" && role !== "admin") {
      return { error: "Unauthorized - Passenger access only" };
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return { error: "User record not found" };
    }

    const passengerId = userRecord.id;

    // Get all bookings (pending, confirmed, cancelled) with ride details
    const allBookings = await db
      .select({
        bookingId: bookings.id,
        seatsBooked: bookings.seatsBooked,
        bookingTime: bookings.bookingTime,
        bookingStatus: bookings.status,
        rideId: rides.id,
        startLocation: rides.startLocation,
        endLocation: rides.endLocation,
        departureTime: rides.departureTime,
        distance: rides.distance,
        carbonSavedPerSeat: rides.carbonSavedPerSeat,
        rideStatus: rides.status,
        driverUserId: users.userId,
      })
      .from(bookings)
      .innerJoin(rides, eq(bookings.rideId, rides.id))
      .innerJoin(users, eq(rides.driverId, users.id))
      .where(eq(bookings.passengerId, passengerId))
      .orderBy(desc(bookings.bookingTime));

    // Get driver names
    const bookingsWithDrivers = await Promise.all(
      allBookings.map(async (item) => {
        const [driverAuthUser] = await db
          .select({ name: authUser.name, email: authUser.email })
          .from(authUser)
          .where(eq(authUser.id, item.driverUserId))
          .limit(1);

        return {
          ...item,
          driverName: driverAuthUser?.name || "Unknown",
          driverEmail: driverAuthUser?.email || "Unknown",
        };
      })
    );

    return {
      success: true,
      data: bookingsWithDrivers,
    };
  } catch (error) {
    console.error("Error getting all bookings:", error);
    return { error: "Failed to fetch bookings" };
  }
}
