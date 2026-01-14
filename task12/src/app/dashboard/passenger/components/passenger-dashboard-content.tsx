"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchRidesForm } from "./search-rides-form";
import { RidesList } from "./rides-list";
import { searchRides } from "@/serverActions/passenger/actions";

interface PassengerDashboardContentProps {
  initialRides: any[];
}

export function PassengerDashboardContent({
  initialRides,
}: PassengerDashboardContentProps) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allRides, setAllRides] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // Load all rides when component mounts or when "All Available Rides" tab is accessed
  const loadAllRides = async () => {
    if (allRides.length === 0 && !isLoadingAll) {
      setIsLoadingAll(true);
      try {
        const result = await searchRides({});
        if (result.success) {
          setAllRides(result.data || []);
        }
      } catch (error) {
        console.error("Error loading all rides:", error);
      } finally {
        setIsLoadingAll(false);
      }
    }
  };

  return (
    <Tabs defaultValue="search" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search Rides</TabsTrigger>
        <TabsTrigger value="all" onClick={loadAllRides}>All Available Rides</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-6">
        <SearchRidesForm
          onSearchResults={(results) => setSearchResults(results)}
          onSearching={setIsSearching}
        />
        {isSearching ? (
          <div className="text-center py-8 text-gray-600">Searching...</div>
        ) : searchResults.length > 0 ? (
          <RidesList rides={searchResults} title="Search Results" />
        ) : (
          <div className="text-center py-8 text-gray-600">
            No search results. Use the form above to search for rides.
          </div>
        )}
      </TabsContent>

      <TabsContent value="all" className="space-y-6">
        {isLoadingAll ? (
          <div className="text-center py-8 text-gray-600">Loading rides...</div>
        ) : allRides.length > 0 ? (
          <RidesList rides={allRides} title="All Available Rides" />
        ) : (
          <div className="text-center py-8 text-gray-600">
            No available rides at the moment.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
