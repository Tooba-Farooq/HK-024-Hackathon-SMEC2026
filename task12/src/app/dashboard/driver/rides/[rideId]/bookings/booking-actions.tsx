"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { updateBookingStatus } from "@/serverActions/driver/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingActionsProps {
  bookingId: number;
  rideId: number;
}

export function BookingActions({ bookingId, rideId }: BookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const router = useRouter();

  const handleAction = async (status: "confirmed" | "cancelled") => {
    setLoading(true);
    setAction(status === "confirmed" ? "accept" : "reject");

    try {
      const result = await updateBookingStatus(bookingId, status);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to update booking");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={() => handleAction("confirmed")}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white flex-1"
      >
        {loading && action === "accept" ? (
          "Processing..."
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Accept
          </>
        )}
      </Button>
      <Button
        onClick={() => handleAction("cancelled")}
        disabled={loading}
        variant="outline"
        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1"
      >
        {loading && action === "reject" ? (
          "Processing..."
        ) : (
          <>
            <X className="mr-2 h-4 w-4" />
            Reject
          </>
        )}
      </Button>
    </div>
  );
}
