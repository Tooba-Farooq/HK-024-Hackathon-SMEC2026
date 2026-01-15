"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function PostRideButton() {
  return (
    <Button
      asChild
      size="lg"
      className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg font-semibold px-10 py-7 mb-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
    >
      <Link href="/dashboard/driver/rides/new" className="flex items-center gap-2">
        <Plus className="h-6 w-6" />
        Post New Ride
      </Link>
    </Button>
  );
}
