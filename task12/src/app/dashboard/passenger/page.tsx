import { requirePassenger } from "@/lib/rbac";
import { SignOutButton } from "./sign-out-button";
import { PassengerStatsCards } from "./components/passenger-stats-cards";
import { ActiveRideCard } from "./components/active-ride-card";
import { RideHistory } from "./components/ride-history";
import {
  getPassengerStats,
  getActiveBooking,
  searchRides,
  getRideHistory,
  getAllBookings,
} from "@/serverActions/passenger/actions";
import { PassengerDashboardContent } from "./components/passenger-dashboard-content";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PassengerDashboard() {
  const { user, role } = await requirePassenger();

  // Fetch initial data (don't fetch all rides by default)
  const [statsResult, activeBookingResult, historyResult, allBookingsResult] = await Promise.all([
    getPassengerStats(),
    getActiveBooking(),
    getRideHistory(),
    getAllBookings(),
  ]);

  const stats = statsResult.success
    ? statsResult.data
    : { activeBookings: 0, seatsBooked: 0, carbonSaved: 0 };
  const activeBooking = activeBookingResult.success ? activeBookingResult.data : null;
  const history = historyResult.success ? historyResult.data : [];
  const allBookings = allBookingsResult.success ? allBookingsResult.data : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent tracking-tight">
                Passenger Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold text-gray-800">{user.name || user.email}</span></p>
            </div>
            <SignOutButton />
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <PassengerStatsCards
          activeBookings={stats.activeBookings}
          seatsBooked={stats.seatsBooked}
          carbonSaved={stats.carbonSaved}
        />

        {/* Active Booking */}
        {activeBooking && <ActiveRideCard ride={activeBooking} />}

        {/* My Bookings Link */}
        <div className="mb-10">
          <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-6">
            <Link href="/dashboard/passenger/bookings" className="font-semibold">
              View All My Bookings
            </Link>
          </Button>
        </div>

        {/* Search and Rides */}
        <PassengerDashboardContent initialRides={[]} />

        {/* Ride History */}
        {history.length > 0 && (
          <div className="mt-8">
            <RideHistory history={history} />
          </div>
        )}
      </div>
    </div>
  );
}
