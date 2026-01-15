"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRide } from "@/serverActions/driver/actions";
import { calculateCarbonSavedPerPassenger, calculateDistance, type VehicleType } from "@/lib/carbon-calculator";
import { LocationPicker } from "@/components/maps/location-picker";

export function PostRideForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    startLocation: "",
    endLocation: "",
    startLat: undefined as number | undefined,
    startLng: undefined as number | undefined,
    endLat: undefined as number | undefined,
    endLng: undefined as number | undefined,
    departureTime: "",
    totalSeats: "",
    distance: "",
    vehicleType: "average" as VehicleType,
    carbonSavedPerSeat: "",
  });

  // Auto-calculate distance from coordinates if available
  useEffect(() => {
    if (
      formData.startLat &&
      formData.startLng &&
      formData.endLat &&
      formData.endLng
    ) {
      const distance = calculateDistance(
        formData.startLat,
        formData.startLng,
        formData.endLat,
        formData.endLng
      );
      setFormData((prev) => ({
        ...prev,
        distance: distance.toFixed(2),
      }));
    }
  }, [formData.startLat, formData.startLng, formData.endLat, formData.endLng]);

  // Auto-calculate carbon saved when distance, seats, or vehicle type changes
  useEffect(() => {
    const distance = parseFloat(formData.distance);
    const totalSeats = parseInt(formData.totalSeats);

    if (distance > 0 && totalSeats > 0) {
      // Total passengers = driver (1) + available seats
      const totalPassengers = 1 + totalSeats;
      const calculated = calculateCarbonSavedPerPassenger(
        distance,
        formData.vehicleType,
        totalPassengers
      );
      setFormData((prev) => ({
        ...prev,
        carbonSavedPerSeat: calculated.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        carbonSavedPerSeat: "",
      }));
    }
  }, [formData.distance, formData.totalSeats, formData.vehicleType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const distance = parseFloat(formData.distance);
      const totalSeats = parseInt(formData.totalSeats);
      
      // Calculate carbon saved if distance is provided
      let carbonSaved = 0;
      if (distance > 0 && totalSeats > 0) {
        const totalPassengers = 1 + totalSeats;
        carbonSaved = calculateCarbonSavedPerPassenger(
          distance,
          formData.vehicleType,
          totalPassengers
        );
      } else if (formData.carbonSavedPerSeat) {
        // Fallback to manual entry if distance not provided
        carbonSaved = parseFloat(formData.carbonSavedPerSeat);
      }

      const result = await createRide({
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        startLat: formData.startLat || null,
        startLng: formData.startLng || null,
        endLat: formData.endLat || null,
        endLng: formData.endLng || null,
        departureTime: new Date(formData.departureTime),
        totalSeats: totalSeats,
        availableSeats: totalSeats,
        distance: distance > 0 ? distance : null,
        carbonSavedPerSeat: carbonSaved,
      });

      if (result.success) {
        router.push("/dashboard/driver");
        router.refresh();
      } else {
        setError(result.error || "Failed to create ride");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LocationPicker
        label="Start Location"
        value={formData.startLocation}
        onChange={(location, lat, lng) => {
          setFormData({
            ...formData,
            startLocation: location,
            startLat: lat,
            startLng: lng,
          });
        }}
        placeholder="e.g., University Main Gate"
        required
      />

      <LocationPicker
        label="End Location"
        value={formData.endLocation}
        onChange={(location, lat, lng) => {
          setFormData({
            ...formData,
            endLocation: location,
            endLat: lat,
            endLng: lng,
          });
        }}
        placeholder="e.g., Downtown Station"
        required
      />

      <div className="space-y-2">
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={(e) =>
            setFormData({ ...formData, departureTime: e.target.value })
          }
          required
          className="border-red-200 focus:border-red-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalSeats">Total Seats Available</Label>
        <Input
          id="totalSeats"
          type="number"
          min="1"
          value={formData.totalSeats}
          onChange={(e) =>
            setFormData({ ...formData, totalSeats: e.target.value })
          }
          placeholder="e.g., 4"
          required
          className="border-red-200 focus:border-red-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="distance">Distance (km)</Label>
        <Input
          id="distance"
          type="number"
          step="0.01"
          min="0"
          value={formData.distance}
          onChange={(e) =>
            setFormData({ ...formData, distance: e.target.value })
          }
          placeholder="Auto-calculated from locations"
          disabled={!!(formData.startLat && formData.endLat)}
          className="border-red-200 focus:border-red-600"
        />
        <p className="text-xs text-gray-500">
          {formData.startLat && formData.endLat
            ? "Auto-calculated from selected locations"
            : "Will be auto-calculated if locations are selected from map, or enter manually"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleType">Vehicle Type</Label>
        <Select
          value={formData.vehicleType}
          onValueChange={(value) =>
            setFormData({ ...formData, vehicleType: value as VehicleType })
          }
        >
          <SelectTrigger className="w-full border-red-200 focus:border-red-600">
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small-petrol">Small Car (Petrol)</SelectItem>
            <SelectItem value="medium-petrol">Medium Car (Petrol)</SelectItem>
            <SelectItem value="large-petrol">Large Car (Petrol)</SelectItem>
            <SelectItem value="small-diesel">Small Car (Diesel)</SelectItem>
            <SelectItem value="medium-diesel">Medium Car (Diesel)</SelectItem>
            <SelectItem value="electric">Electric Car</SelectItem>
            <SelectItem value="hybrid">Hybrid Car</SelectItem>
            <SelectItem value="average">Average (Mixed Fleet)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Select your vehicle type for accurate carbon calculation.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="carbonSavedPerSeat">
          Carbon Saved Per Seat (kg) - Auto-calculated
        </Label>
        <Input
          id="carbonSavedPerSeat"
          type="number"
          step="0.01"
          min="0"
          value={formData.carbonSavedPerSeat}
          onChange={(e) =>
            setFormData({ ...formData, carbonSavedPerSeat: e.target.value })
          }
          placeholder="Auto-calculated"
          disabled={!!formData.distance && !!formData.totalSeats}
          className="border-red-200 focus:border-red-600"
        />
        <p className="text-xs text-gray-500">
          {formData.distance && formData.totalSeats
            ? "This value is automatically calculated based on distance, vehicle type, and seats."
            : "Enter manually if distance is not available, or fill distance above for auto-calculation."}
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {loading ? "Creating Ride..." : "Post Ride"}
      </Button>
    </form>
  );
}
