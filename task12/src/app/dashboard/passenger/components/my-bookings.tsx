"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, Leaf, User, X } from "lucide-react";
import { format } from "date-fns";
import { cancelBooking } from "@/serverActions/passenger/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Booking {
  bookingId: number;
  rideId: number;
  startLocation: string;
  endLocation: string;
  departureTime: Date;
  seatsBooked: number;
  distance: number | null;
  carbonSavedPerSeat: number | null;
  rideStatus: "active" | "completed" | "cancelled";
  driverName: string;
  driverEmail: string;
  bookingStatus?: "pending" | "confirmed" | "cancelled";
}

interface MyBookingsProps {
  bookings: Booking[];
}

export function MyBookings({ bookings }: MyBookingsProps) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleCancel = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to cancel booking");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No bookings yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (bookingStatus: string | undefined, rideStatus: string) => {
    // If booking is cancelled, show cancelled
    if (bookingStatus === "cancelled") {
      return "bg-red-100 text-red-800";
    }
    
    // If ride is completed and booking is confirmed, show completed
    if (rideStatus === "completed" && bookingStatus === "confirmed") {
      return "bg-blue-100 text-blue-800";
    }
    
    // Otherwise use booking status
    switch (bookingStatus) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (bookingStatus: string | undefined, rideStatus: string) => {
    // If booking is cancelled, show cancelled
    if (bookingStatus === "cancelled") {
      return "CANCELLED";
    }
    
    // If ride is completed and booking is confirmed, show completed
    if (rideStatus === "completed" && bookingStatus === "confirmed") {
      return "COMPLETED";
    }
    
    // Otherwise use booking status
    return bookingStatus ? bookingStatus.toUpperCase() : rideStatus.toUpperCase();
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const totalCarbonSaved = booking.carbonSavedPerSeat
          ? (booking.carbonSavedPerSeat * booking.seatsBooked).toFixed(2)
          : "0";

        return (
          <Card
            key={booking.bookingId}
            className="border-red-200 hover:border-red-400 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">Ride #{booking.rideId}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.bookingStatus,
                        booking.rideStatus
                      )}`}
                    >
                      {getStatusText(booking.bookingStatus, booking.rideStatus)}
                    </span>
                  </div>
                  <CardDescription>
                    <div className="flex items-start gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.startLocation}</p>
                        <p className="text-sm text-gray-500">to</p>
                        <p className="font-medium text-gray-900">{booking.endLocation}</p>
                      </div>
                    </div>
                  </CardDescription>
                </div>
                {(booking.bookingStatus === "pending" ||
                  booking.bookingStatus === "confirmed") &&
                  booking.rideStatus === "active" && (
                    <Button
                      onClick={() => handleCancel(booking.bookingId)}
                      disabled={cancellingId === booking.bookingId}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      {cancellingId === booking.bookingId ? (
                        "Cancelling..."
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </>
                      )}
                    </Button>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 flex-wrap text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">
                    {format(new Date(booking.departureTime), "MMM dd, yyyy 'at' hh:mm a")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{booking.driverName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">
                    {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
                  </span>
                </div>

                {booking.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-gray-700">
                      {booking.distance.toFixed(2)} km
                    </span>
                  </div>
                )}

                {booking.carbonSavedPerSeat && booking.bookingStatus === "confirmed" && (
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 font-semibold">
                      {totalCarbonSaved} kg CO₂ saved
                      {booking.rideStatus === "completed" && " ✓"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
