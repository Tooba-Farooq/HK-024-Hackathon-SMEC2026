import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, Leaf } from "lucide-react";

interface StatsCardsProps {
  activeRides: number;
  availableSeats: number;
  carbonSaved: number;
}

export function StatsCards({ activeRides, availableSeats, carbonSaved }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3 mb-10">
      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Rides</CardTitle>
          <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
            <Car className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-red-600 mb-1">{activeRides}</div>
          <p className="text-xs text-gray-500 font-medium">Currently active rides</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Available Seats</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-blue-600 mb-1">{availableSeats}</div>
          <p className="text-xs text-gray-500 font-medium">Total available seats</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Carbon Saved</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-green-600 mb-1">{carbonSaved} kg</div>
          <p className="text-xs text-gray-500 font-medium">CO₂ saved so far</p>
        </CardContent>
      </Card>
    </div>
  );
}
