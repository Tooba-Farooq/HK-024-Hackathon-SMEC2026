"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface RouteMapProps {
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
  startLocation?: string;
  endLocation?: string;
  height?: string;
}

export function RouteMap({
  startLat,
  startLng,
  endLat,
  endLng,
  startLocation,
  endLocation,
  height = "400px",
}: RouteMapProps) {
  // All hooks must be called at the top, before any conditional returns
  const [isClient, setIsClient] = useState(false);
  const [icons, setIcons] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dynamically import L for icon creation
  useEffect(() => {
    const createIcons = async () => {
      const L = await import("leaflet");
      
      // Fix for default marker icons in Leaflet with Next.js
      if (typeof window !== "undefined" && L.Icon.Default.prototype) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
      }

      const startIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const endIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      return { startIcon, endIcon };
    };

    if (isClient && startLat && startLng && endLat && endLng) {
      createIcons().then(setIcons);
    }
  }, [isClient, startLat, startLng, endLat, endLng]);

  // Only render map if we have coordinates
  if (!startLat || !startLng || !endLat || !endLng) {
    return (
      <div
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center border border-red-200"
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">Map unavailable - location coordinates missing</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center border border-red-200"
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    );
  }

  const startPos: [number, number] = [startLat, startLng];
  const endPos: [number, number] = [endLat, endLng];

  // Calculate center point
  const centerLat = (startLat + endLat) / 2;
  const centerLng = (startLng + endLng) / 2;

  // Calculate zoom level based on distance
  const calculateZoom = () => {
    const latDiff = Math.abs(startLat - endLat);
    const lngDiff = Math.abs(startLng - endLng);
    const maxDiff = Math.max(latDiff, lngDiff);

    if (maxDiff > 1) return 6;
    if (maxDiff > 0.5) return 7;
    if (maxDiff > 0.1) return 9;
    if (maxDiff > 0.05) return 11;
    return 13;
  };

  if (!icons) {
    return (
      <div
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center border border-red-200"
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-red-200" style={{ height }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={calculateZoom()}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={startPos} icon={icons.startIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-green-600">Start</p>
              {startLocation && <p className="text-gray-700">{startLocation}</p>}
            </div>
          </Popup>
        </Marker>
        <Marker position={endPos} icon={icons.endIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-red-600">End</p>
              {endLocation && <p className="text-gray-700">{endLocation}</p>}
            </div>
          </Popup>
        </Marker>
        <Polyline
          positions={[startPos, endPos]}
          color="#ef4444"
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />
      </MapContainer>
    </div>
  );
}
