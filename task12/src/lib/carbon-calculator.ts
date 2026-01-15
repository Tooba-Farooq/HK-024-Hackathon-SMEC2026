/**
 * Carbon Emission Calculator for Ride-Sharing
 * 
 * Calculation Method:
 * 
 * 1. Base Calculation:
 *    CO₂ Saved = (Individual Car Emissions - Shared Car Emissions) per passenger
 * 
 * 2. Individual Car Emissions:
 *    = Distance (km) × Emission Factor (kg CO₂/km) × 1 passenger
 * 
 * 3. Shared Car Emissions (per passenger):
 *    = (Distance (km) × Emission Factor (kg CO₂/km)) / Number of Passengers
 * 
 * 4. Carbon Saved Per Passenger:
 *    = Individual Emissions - Shared Emissions Per Passenger
 *    = (Distance × EF × 1) - (Distance × EF / Passengers)
 *    = Distance × EF × (1 - 1/Passengers)
 * 
 * Standard Emission Factors (kg CO₂ per km):
 * - Small car (petrol): 0.120 kg CO₂/km
 * - Medium car (petrol): 0.171 kg CO₂/km
 * - Large car (petrol): 0.209 kg CO₂/km
 * - Small car (diesel): 0.120 kg CO₂/km
 * - Medium car (diesel): 0.171 kg CO₂/km
 * - Electric car: 0.050 kg CO₂/km (varies by grid)
 * - Hybrid: 0.080 kg CO₂/km
 * 
 * Average for university students (mixed vehicles): ~0.150 kg CO₂/km
 */

export type VehicleType = 
  | "small-petrol"
  | "medium-petrol"
  | "large-petrol"
  | "small-diesel"
  | "medium-diesel"
  | "electric"
  | "hybrid"
  | "average";

export const EMISSION_FACTORS: Record<VehicleType, number> = {
  "small-petrol": 0.120,    // kg CO₂ per km
  "medium-petrol": 0.171,
  "large-petrol": 0.209,
  "small-diesel": 0.120,
  "medium-diesel": 0.171,
  "electric": 0.050,
  "hybrid": 0.080,
  "average": 0.150,         // Average for mixed fleet
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}


/**
 * Calculate carbon saved per passenger for a ride
 * 
 * @param distance - Distance in kilometers
 * @param vehicleType - Type of vehicle
 * @param numberOfPassengers - Total number of passengers (including driver)
 * @returns Carbon saved per passenger in kg CO₂
 */
export function calculateCarbonSavedPerPassenger(
  distance: number,
  vehicleType: VehicleType = "average",
  numberOfPassengers: number
): number {
  if (numberOfPassengers < 1) {
    return 0;
  }

  const emissionFactor = EMISSION_FACTORS[vehicleType];
  
  // Individual car emissions (1 passenger)
  const individualEmissions = distance * emissionFactor * 1;
  
  // Shared car emissions per passenger
  const sharedEmissionsPerPassenger = (distance * emissionFactor) / numberOfPassengers;
  
  // Carbon saved per passenger
  const carbonSaved = individualEmissions - sharedEmissionsPerPassenger;
  
  // Formula: Distance × EF × (1 - 1/Passengers)
  // This ensures we only count savings when there are multiple passengers
  const calculatedSaved = distance * emissionFactor * (1 - 1 / numberOfPassengers);
  
  return Math.max(0, Math.round(calculatedSaved * 100) / 100); // Round to 2 decimal places, ensure non-negative
}

/**
 * Calculate total carbon saved for a ride
 * 
 * @param distance - Distance in kilometers
 * @param vehicleType - Type of vehicle
 * @param totalSeats - Total seats in the vehicle
 * @param bookedSeats - Number of seats booked by passengers
 * @returns Total carbon saved in kg CO₂
 */
export function calculateTotalCarbonSaved(
  distance: number,
  vehicleType: VehicleType = "average",
  totalSeats: number,
  bookedSeats: number
): number {
  if (bookedSeats === 0) {
    return 0;
  }

  // Total passengers = driver (1) + booked passengers
  const totalPassengers = 1 + bookedSeats;
  
  // Carbon saved per passenger
  const carbonPerPassenger = calculateCarbonSavedPerPassenger(
    distance,
    vehicleType,
    totalPassengers
  );
  
  // Total carbon saved = saved per passenger × number of passengers
  return Math.round(carbonPerPassenger * bookedSeats * 100) / 100;
}

/**
 * Example calculation:
 * 
 * Distance: 10 km
 * Vehicle: Average (0.150 kg CO₂/km)
 * Passengers: 4 (1 driver + 3 passengers)
 * 
 * Individual emissions per person: 10 × 0.150 × 1 = 1.5 kg CO₂
 * Shared emissions per person: (10 × 0.150) / 4 = 0.375 kg CO₂
 * Carbon saved per passenger: 1.5 - 0.375 = 1.125 kg CO₂
 * 
 * Total carbon saved (3 passengers): 1.125 × 3 = 3.375 kg CO₂
 */
