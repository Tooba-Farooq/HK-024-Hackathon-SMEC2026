"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { completeRide } from "@/serverActions/driver/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CompleteRideButtonProps {
  rideId: number;
}

export function CompleteRideButton({ rideId }: CompleteRideButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (
      !confirm(
        "Are you sure you want to complete this ride? All bookings will be cancelled."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await completeRide(rideId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to complete ride");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        "Completing..."
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Complete Ride
        </>
      )}
    </Button>
  );
}
