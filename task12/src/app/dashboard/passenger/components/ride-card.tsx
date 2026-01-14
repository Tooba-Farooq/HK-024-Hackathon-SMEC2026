"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Leaf, User, Hourglass } from "lucide-react";
import { format } from "date-fns";
import { bookRide } from "@/serverActions/passenger/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getActiveBooking } from "@/serverActions/passenger/actions";

interface Ride {
  id: number;
  startLocation: string;
  endLocation: string;
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  distance: number | null;
  carbonSavedPerSeat: number | null;
  driverName: string;
  driverEmail: string;
}

interface RideCardProps {
  ride: Ride;
}

export function RideCard({ ride }: RideCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);

  useEffect(() => {
    const checkActiveBooking = async () => {
      const result = await getActiveBooking();
      if (result.success && result.data) {
        setHasActiveBooking(true);
      }
    };
    checkActiveBooking();
  }, []);

  const handleBook = async () => {
    if (!confirm(`Book ${ride.availableSeats > 1 ? "a seat" : "this ride"}?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await bookRide(ride.id, 1);
      if (result.success) {
        alert("Booking request sent! Waiting for driver approval.");
        setHasActiveBooking(true);
        router.refresh();
      } else {
        alert(result.error || "Failed to book ride");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">Ride #{ride.id}</CardTitle>
            <CardDescription>
              <div className="flex items-start gap-3 mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="p-1.5 bg-red-100 rounded">
                  <MapPin className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{ride.startLocation}</p>
                  <p className="text-xs text-gray-400 my-1">to</p>
                  <p className="font-semibold text-gray-900">{ride.endLocation}</p>
                </div>
              </div>
            </CardDescription>
          </div>
          {hasActiveBooking ? (
            <Button
              disabled
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg font-semibold px-6 cursor-not-allowed"
            >
              <Hourglass className="mr-2 h-4 w-4" />
              Wait
            </Button>
          ) : (
            <Button
              onClick={handleBook}
              disabled={loading || ride.availableSeats === 0}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6"
            >
              {loading ? "Booking..." : "Book Seat"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-6 flex-wrap text-sm p-3 bg-gray-50/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">
                {format(new Date(ride.departureTime), "MMM dd, yyyy 'at' hh:mm a")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">{ride.driverName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">
                {ride.availableSeats} / {ride.totalSeats} seats available
              </span>
            </div>

            {ride.distance && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="text-gray-700">
                  {ride.distance.toFixed(2)} km
                </span>
              </div>
            )}

            {ride.carbonSavedPerSeat && (
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-green-700">
                  {ride.carbonSavedPerSeat} kg CO₂/seat
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
