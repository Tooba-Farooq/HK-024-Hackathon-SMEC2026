"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, Leaf, User } from "lucide-react";
import { format } from "date-fns";

interface RideHistoryItem {
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
}

interface RideHistoryProps {
  history: RideHistoryItem[];
}

export function RideHistory({ history }: RideHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No ride history yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Ride History</h2>
      {history.map((item) => {
        const totalCarbonSaved = item.carbonSavedPerSeat
          ? (item.carbonSavedPerSeat * item.seatsBooked).toFixed(2)
          : "0";

        return (
          <Card
            key={item.bookingId}
            className="border-red-200 hover:border-red-400 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">Ride #{item.rideId}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.rideStatus
                      )}`}
                    >
                      {item.rideStatus.toUpperCase()}
                    </span>
                  </div>
                  <CardDescription>
                    <div className="flex items-start gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{item.startLocation}</p>
                        <p className="text-sm text-gray-500">to</p>
                        <p className="font-medium text-gray-900">{item.endLocation}</p>
                      </div>
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 flex-wrap text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">
                    {format(new Date(item.departureTime), "MMM dd, yyyy 'at' hh:mm a")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{item.driverName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">
                    {item.seatsBooked} seat{item.seatsBooked > 1 ? "s" : ""}
                  </span>
                </div>

                {item.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-gray-700">
                      {item.distance.toFixed(2)} km
                    </span>
                  </div>
                )}

                {item.carbonSavedPerSeat && (
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      {totalCarbonSaved} kg CO₂ saved
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
