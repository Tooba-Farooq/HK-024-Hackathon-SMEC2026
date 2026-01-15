"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cancelRide } from "@/serverActions/driver/actions";

interface CancelRideButtonProps {
  rideId: number;
  variant?: "default" | "outline" | "destructive";
}

export function CancelRideButton({ rideId, variant = "outline" }: CancelRideButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this ride? All pending bookings will be cancelled.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await cancelRide(rideId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to cancel ride");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCancel}
      disabled={loading}
      variant={variant}
      className={
        variant === "outline"
          ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          : "bg-red-600 hover:bg-red-700 text-white"
      }
    >
      {loading ? (
        "Cancelling..."
      ) : (
        <>
          <X className="mr-2 h-4 w-4" />
          Cancel Ride
        </>
      )}
    </Button>
  );
}
