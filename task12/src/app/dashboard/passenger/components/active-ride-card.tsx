"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Leaf, User } from "lucide-react";
import { format } from "date-fns";
import { cancelBooking } from "@/serverActions/passenger/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ActiveRide {
  bookingId: number;
  rideId: number;
  startLocation: string;
  endLocation: string;
  departureTime: Date;
  seatsBooked: number;
  distance: number | null;
  carbonSavedPerSeat: number | null;
  driverName: string;
  driverEmail: string;
}

interface ActiveRideCardProps {
  ride: ActiveRide | null;
}

export function ActiveRideCard({ ride }: ActiveRideCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!ride) {
    return null;
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await cancelBooking(ride.bookingId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to cancel booking");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalCarbonSaved = ride.carbonSavedPerSeat
    ? (ride.carbonSavedPerSeat * ride.seatsBooked).toFixed(2)
    : "0";

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50/50 shadow-xl mb-10 ring-2 ring-green-100">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 to-transparent rounded-full -mr-32 -mt-32"></div>
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <CardTitle className="text-2xl font-bold text-gray-900">Active Booking</CardTitle>
            </div>
            <CardDescription className="text-gray-600 font-medium">Your upcoming ride</CardDescription>
          </div>
          <Button
            onClick={handleCancel}
            disabled={loading}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-green-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-bold text-lg text-gray-900">{ride.startLocation}</p>
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-green-300"></div>
                <p className="text-sm font-medium text-gray-500">to</p>
                <div className="h-px flex-1 bg-green-300"></div>
              </div>
              <p className="font-bold text-lg text-gray-900">{ride.endLocation}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap p-4 bg-white/40 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                {format(new Date(ride.departureTime), "MMM dd, yyyy 'at' hh:mm a")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                Driver: {ride.driverName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                {ride.seatsBooked} seat{ride.seatsBooked > 1 ? "s" : ""} booked
              </span>
            </div>

            {ride.distance && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-700">
                  {ride.distance.toFixed(2)} km
                </span>
              </div>
            )}

            {ride.carbonSavedPerSeat && (
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {totalCarbonSaved} kg CO₂ saved
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
