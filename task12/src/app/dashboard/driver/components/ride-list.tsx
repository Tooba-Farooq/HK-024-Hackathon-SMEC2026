"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Leaf } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CancelRideButton } from "./cancel-ride-button";

import { CompleteRideButton } from "./complete-ride-button";
import { Bell } from "lucide-react";

interface Ride {
  id: number;
  startLocation: string;
  endLocation: string;
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  status: "active" | "completed" | "cancelled";
  distance: number | null;
  carbonSavedPerSeat: number | null;
  createdAt: Date;
  requestCount?: number;
}

interface RideListProps {
  rides: Ride[];
}

export function RideList({ rides }: RideListProps) {
  if (rides.length === 0) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No rides posted yet. Create your first ride!</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">My Rides</h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-red-200 to-transparent rounded-full"></div>
      </div>
      {rides.map((ride) => (
        <Card
          key={ride.id}
          className="group relative overflow-hidden border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <CardTitle className="text-xl font-bold text-gray-900">Ride #{ride.id}</CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                      ride.status
                    )}`}
                  >
                    {ride.status.toUpperCase()}
                  </span>
                </div>
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
              {ride.status === "active" && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    asChild
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white shadow-sm hover:shadow-md transition-all"
                  >
                    <Link href={`/dashboard/driver/rides/${ride.id}/bookings`} className="flex items-center gap-2">
                      View Bookings
                      {ride.requestCount !== undefined && ride.requestCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">
                          {ride.requestCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                  <CompleteRideButton rideId={ride.id} />
                  <CancelRideButton rideId={ride.id} />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 flex-wrap text-sm p-3 bg-gray-50/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">
                  {format(new Date(ride.departureTime), "MMM dd, yyyy 'at' hh:mm a")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">
                  {ride.availableSeats} / {ride.totalSeats} seats
                </span>
              </div>

              {ride.status === "active" && ride.requestCount !== undefined && ride.requestCount > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700 font-semibold">
                    {ride.requestCount} request{ride.requestCount > 1 ? "s" : ""}
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
              {ride.distance && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-gray-700">
                    {ride.distance.toFixed(2)} km
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
