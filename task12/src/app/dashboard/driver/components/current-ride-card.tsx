"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Leaf } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CancelRideButton } from "./cancel-ride-button";
import { CompleteRideButton } from "./complete-ride-button";
import { Bell } from "lucide-react";
import { RouteMap } from "@/components/maps/route-map";

interface CurrentRide {
  id: number;
  startLocation: string;
  endLocation: string;
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  distance: number | null;
  carbonSavedPerSeat: number | null;
  requestCount?: number;
}

interface CurrentRideCardProps {
  ride: CurrentRide | null;
}

export function CurrentRideCard({ ride }: CurrentRideCardProps) {
  if (!ride) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-red-50/50 shadow-xl mb-10 ring-2 ring-red-100">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/20 to-transparent rounded-full -mr-32 -mt-32"></div>
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <CardTitle className="text-2xl font-bold text-gray-900">Current Active Ride</CardTitle>
            </div>
            <CardDescription className="text-gray-600 font-medium">Your currently open ride</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href={`/dashboard/driver/rides/${ride.id}/bookings`} className="flex items-center gap-2">
                View Bookings
                {ride.requestCount !== undefined && ride.requestCount > 0 && (
                  <span className="px-2.5 py-1 bg-white text-red-600 rounded-full text-xs font-bold shadow-md">
                    {ride.requestCount}
                  </span>
                )}
              </Link>
            </Button>
            <CompleteRideButton rideId={ride.id} />
            <CancelRideButton rideId={ride.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-red-100">
            <div className="p-2 bg-red-100 rounded-lg">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-bold text-lg text-gray-900">{ride.startLocation}</p>
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-red-300"></div>
                <p className="text-sm font-medium text-gray-500">to</p>
                <div className="h-px flex-1 bg-red-300"></div>
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
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                {ride.availableSeats} / {ride.totalSeats} seats available
              </span>
            </div>

            {ride.requestCount !== undefined && ride.requestCount > 0 && (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700 font-semibold">
                  {ride.requestCount} request{ride.requestCount > 1 ? "s" : ""} pending
                </span>
              </div>
            )}

            {ride.carbonSavedPerSeat && (
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {ride.carbonSavedPerSeat} kg CO₂ per seat
                </span>
              </div>
            )}
            {ride.distance && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-700">
                  {ride.distance.toFixed(2)} km
                </span>
              </div>
            )}
          </div>

          {(ride.startLat && ride.startLng && ride.endLat && ride.endLng) && (
            <div className="mt-4">
              <RouteMap
                startLat={ride.startLat}
                startLng={ride.startLng}
                endLat={ride.endLat}
                endLng={ride.endLng}
                startLocation={ride.startLocation}
                endLocation={ride.endLocation}
                height="300px"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
