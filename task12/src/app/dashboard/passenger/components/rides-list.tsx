"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RideCard } from "./ride-card";

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

interface RidesListProps {
  rides: Ride[];
  title?: string;
}

export function RidesList({ rides, title = "Available Rides" }: RidesListProps) {
  if (rides.length === 0) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No rides found. Try adjusting your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {rides.map((ride) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>
    </div>
  );
}
