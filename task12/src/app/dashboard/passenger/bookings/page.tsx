import { requirePassenger } from "@/lib/rbac";
import { SignOutButton } from "../sign-out-button";
import { getAllBookings } from "@/serverActions/passenger/actions";
import { MyBookings } from "../components/my-bookings";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MyBookingsPage() {
  const { user } = await requirePassenger();

  const allBookingsResult = await getAllBookings();
  const allBookings = allBookingsResult.success ? allBookingsResult.data : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
              <Link href="/dashboard/passenger">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-gray-600 mt-2">All your ride bookings</p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* My Bookings */}
        <MyBookings bookings={allBookings} />
      </div>
    </div>
  );
}
