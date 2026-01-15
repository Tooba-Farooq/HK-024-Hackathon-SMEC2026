import { requireDriver } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRideBookings, updateBookingStatus } from "@/serverActions/driver/actions";
import { BookingActions } from "./booking-actions";
import Link from "next/link";
import { ArrowLeft, Users, Clock } from "lucide-react";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ rideId: string }>;
}

export default async function RideBookingsPage({ params }: PageProps) {
  const { user, role } = await requireDriver();
  const { rideId } = await params;
  const rideIdNum = parseInt(rideId);

  if (isNaN(rideIdNum)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-black">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200">
            <CardContent className="py-12 text-center">
              <p className="text-red-600">Invalid ride ID</p>
              <Button asChild className="mt-4 bg-red-600 hover:bg-red-700">
                <Link href="/dashboard/driver">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const bookingsResult = await getRideBookings(rideIdNum);

  if (!bookingsResult.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-black">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200">
            <CardContent className="py-12 text-center">
              <p className="text-red-600">{bookingsResult.error}</p>
              <Button asChild className="mt-4 bg-red-600 hover:bg-red-700">
                <Link href="/dashboard/driver">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const bookings = bookingsResult.data || [];
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-black">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            asChild
            variant="outline"
            className="mb-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          >
            <Link href="/dashboard/driver">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent">
            Ride Bookings
          </h1>
          <p className="text-gray-600 mt-2">Manage booking requests for Ride #{rideId}</p>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Pending Requests ({pendingBookings.length})
            </h2>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="border-2 border-yellow-300 bg-yellow-50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.passengerName}</CardTitle>
                        <CardDescription>{booking.passengerEmail}</CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                        PENDING
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {format(new Date(booking.bookingTime), "MMM dd, yyyy 'at' hh:mm a")}
                        </span>
                      </div>
                    </div>
                    <BookingActions bookingId={booking.id} rideId={rideIdNum} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Bookings */}
        {confirmedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Confirmed Bookings ({confirmedBookings.length})
            </h2>
            <div className="space-y-4">
              {confirmedBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="border-green-200 bg-green-50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.passengerName}</CardTitle>
                        <CardDescription>{booking.passengerEmail}</CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                        CONFIRMED
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {format(new Date(booking.bookingTime), "MMM dd, yyyy 'at' hh:mm a")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Bookings */}
        {cancelledBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cancelled Bookings ({cancelledBookings.length})
            </h2>
            <div className="space-y-4">
              {cancelledBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="border-red-200 bg-red-50 opacity-75"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.passengerName}</CardTitle>
                        <CardDescription>{booking.passengerEmail}</CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">
                        CANCELLED
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {format(new Date(booking.bookingTime), "MMM dd, yyyy 'at' hh:mm a")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Bookings */}
        {bookings.length === 0 && (
          <Card className="border-red-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No bookings yet for this ride.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
