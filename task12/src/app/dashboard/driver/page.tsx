import { requireDriver } from "@/lib/rbac";
import { SignOutButton } from "./sign-out-button";
import { StatsCards } from "./components/stats-cards";
import { CurrentRideCard } from "./components/current-ride-card";
import { PostRideButton } from "./components/post-ride-button";
import { RideList } from "./components/ride-list";
import {
  getDriverStats,
  getDriverRides,
  getCurrentActiveRide,
} from "@/serverActions/driver/actions";

export default async function DriverDashboard() {
  const { user, role } = await requireDriver();

  // Fetch all data in parallel
  const [statsResult, ridesResult, activeRideResult] = await Promise.all([
    getDriverStats(),
    getDriverRides(),
    getCurrentActiveRide(),
  ]);

  const stats = statsResult.success ? statsResult.data : { activeRides: 0, availableSeats: 0, carbonSaved: 0 };
  const rides = ridesResult.success ? ridesResult.data : [];
  const activeRide = activeRideResult.success ? activeRideResult.data : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent tracking-tight">
                Driver Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold text-gray-800">{user.name || user.email}</span></p>
            </div>
            <SignOutButton />
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          activeRides={stats.activeRides}
          availableSeats={stats.availableSeats}
          carbonSaved={stats.carbonSaved}
        />

        {/* Post New Ride Button */}
        <div className="flex justify-center md:justify-start">
          <PostRideButton />
        </div>

        {/* Current Active Ride */}
        {activeRide && <CurrentRideCard ride={activeRide} />}

        {/* Ride List */}
        <RideList rides={rides} />
      </div>
    </div>
  );
}
