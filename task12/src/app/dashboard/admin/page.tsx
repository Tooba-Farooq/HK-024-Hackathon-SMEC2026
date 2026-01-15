import { requireAdmin } from "@/lib/rbac";
import { SignOutButton } from "./sign-out-button";
import { getAdminStats } from "@/serverActions/admin/actions";
import { AdminStatsCards } from "./components/admin-stats-cards";
import { AdminCharts } from "./components/admin-charts";

export default async function AdminDashboard() {
  const { user, role } = await requireAdmin();

  const statsResult = await getAdminStats();
  const stats = statsResult.success
    ? statsResult.data
    : {
        totalRides: 0,
        activeRides: 0,
        completedRides: 0,
        totalBookings: 0,
        totalCarbonSaved: 0,
        totalPassengers: 0,
        totalDrivers: 0,
        ridesByStatus: [],
        carbonOverTime: [],
        ridesOverTime: [],
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back, <span className="font-semibold text-gray-800">{user.name || user.email}</span>
              </p>
            </div>
            <SignOutButton />
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <AdminStatsCards
          totalRides={stats.totalRides}
          activeRides={stats.activeRides}
          completedRides={stats.completedRides}
          totalBookings={stats.totalBookings}
          totalCarbonSaved={stats.totalCarbonSaved}
          totalPassengers={stats.totalPassengers}
          totalDrivers={stats.totalDrivers}
        />

        {/* Charts */}
        <AdminCharts
          ridesByStatus={stats.ridesByStatus}
          carbonOverTime={stats.carbonOverTime}
          ridesOverTime={stats.ridesOverTime}
        />
      </div>
    </div>
  );
}
