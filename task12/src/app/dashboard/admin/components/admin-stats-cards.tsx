import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, Leaf, Calendar, CheckCircle, Clock } from "lucide-react";

interface AdminStatsCardsProps {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  totalBookings: number;
  totalCarbonSaved: number;
  totalPassengers: number;
  totalDrivers: number;
}

export function AdminStatsCards({
  totalRides,
  activeRides,
  completedRides,
  totalBookings,
  totalCarbonSaved,
  totalPassengers,
  totalDrivers,
}: AdminStatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Rides</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Car className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-blue-600 mb-1">{totalRides}</div>
          <p className="text-xs text-gray-500 font-medium">All time rides</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Rides</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <Clock className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-green-600 mb-1">{activeRides}</div>
          <p className="text-xs text-gray-500 font-medium">Currently active</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Completed Rides</CardTitle>
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <CheckCircle className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-purple-600 mb-1">{completedRides}</div>
          <p className="text-xs text-gray-500 font-medium">Successfully completed</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Bookings</CardTitle>
          <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-red-600 mb-1">{totalBookings}</div>
          <p className="text-xs text-gray-500 font-medium">Confirmed bookings</p>
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
          <div className="text-4xl font-extrabold text-green-600 mb-1">{totalCarbonSaved} kg</div>
          <p className="text-xs text-gray-500 font-medium">Total CO₂ saved</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Passengers</CardTitle>
          <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-orange-600 mb-1">{totalPassengers}</div>
          <p className="text-xs text-gray-500 font-medium">Active passengers</p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Drivers</CardTitle>
          <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
            <Car className="h-5 w-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-extrabold text-indigo-600 mb-1">{totalDrivers}</div>
          <p className="text-xs text-gray-500 font-medium">Registered drivers</p>
        </CardContent>
      </Card>
    </div>
  );
}
