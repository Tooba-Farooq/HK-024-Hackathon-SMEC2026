"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { searchRides } from "@/serverActions/passenger/actions";

interface SearchRidesFormProps {
  onSearchResults: (rides: any[]) => void;
  onSearching: (isSearching: boolean) => void;
}

export function SearchRidesForm({
  onSearchResults,
  onSearching,
}: SearchRidesFormProps) {
  const [formData, setFormData] = useState({
    startLocation: "",
    endLocation: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    onSearching(true);

    try {
      // If all fields are empty, search for all rides
      const hasFilters = formData.startLocation || formData.endLocation || formData.date;
      
      const result = await searchRides({
        startLocation: formData.startLocation || undefined,
        endLocation: formData.endLocation || undefined,
        date: formData.date || undefined,
      });

      if (result.success) {
        onSearchResults(result.data || []);
        if (!hasFilters && result.data && result.data.length === 0) {
          setError("No rides available at the moment.");
        }
      } else {
        setError(result.error || "Failed to search rides");
        onSearchResults([]);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      onSearchResults([]);
    } finally {
      setLoading(false);
      onSearching(false);
    }
  };

  return (
    <Card className="border-0 bg-white shadow-lg mb-8">
      <CardHeader className="pb-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-900">Search Rides</CardTitle>
          <p className="text-sm text-gray-600 font-medium">Find available rides matching your route</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startLocation">From</Label>
              <Input
                id="startLocation"
                value={formData.startLocation}
                onChange={(e) =>
                  setFormData({ ...formData, startLocation: e.target.value })
                }
                placeholder="Start location"
                className="border-red-200 focus:border-red-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endLocation">To</Label>
              <Input
                id="endLocation"
                value={formData.endLocation}
                onChange={(e) =>
                  setFormData({ ...formData, endLocation: e.target.value })
                }
                placeholder="End location"
                className="border-red-200 focus:border-red-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="border-red-200 focus:border-red-600"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-8"
            >
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Rides
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError("");
                onSearching(true);
                try {
                  const result = await searchRides({});
                  if (result.success) {
                    onSearchResults(result.data || []);
                    if (result.data && result.data.length === 0) {
                      setError("No rides available at the moment.");
                    }
                  } else {
                    setError(result.error || "Failed to load rides");
                    onSearchResults([]);
                  }
                } catch (err) {
                  setError("An error occurred. Please try again.");
                  onSearchResults([]);
                } finally {
                  setLoading(false);
                  onSearching(false);
                }
              }}
              disabled={loading}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-200 font-medium px-6"
            >
              Show All Rides
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
