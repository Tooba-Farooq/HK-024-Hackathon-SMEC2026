'use client'
import React, { useState } from 'react';
import { Search, MapPin, Wind, Droplets, AlertCircle, CheckCircle, AlertTriangle, XCircle, LucideIcon } from 'lucide-react';

interface PollutionData {
  location: string;
  aqi: number;
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
}

interface Category {
  name: string;
  color: string;
  icon: LucideIcon;
  textColor: string;
}

// Mock data for testing
const MOCK_DATA = {
  "London, UK": {
    location: "London, UK",
    aqi: 3,
    components: {
      co: 5200,
      no: 15,
      no2: 65,
      o3: 85,
      so2: 50,
      pm2_5: 30,
      pm10: 45,
      nh3: 2
    }
  },
  "New York, US": {
    location: "New York, US",
    aqi: 2,
    components: {
      co: 3000,
      no: 8,
      no2: 35,
      o3: 55,
      so2: 25,
      pm2_5: 12,
      pm10: 28,
      nh3: 1
    }
  },
  "Delhi, India": {
    location: "Delhi, India",
    aqi: 5,
    components: {
      co: 16000,
      no: 45,
      no2: 180,
      o3: 120,
      so2: 300,
      pm2_5: 85,
      pm10: 180,
      nh3: 8
    }
  },
  "Tokyo, Japan": {
    location: "Tokyo, Japan",
    aqi: 1,
    components: {
      co: 1500,
      no: 5,
      no2: 25,
      o3: 40,
      so2: 10,
      pm2_5: 8,
      pm10: 15,
      nh3: 0.5
    }
  },
  "Beijing, China": {
    location: "Beijing, China",
    aqi: 4,
    components: {
      co: 11000,
      no: 30,
      no2: 130,
      o3: 95,
      so2: 200,
      pm2_5: 65,
      pm10: 120,
      nh3: 5
    }
  }
};

const API_KEY = '9d0710dac60ab42df88c3537a73daf3d';

export default function AirPollutionApp() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [pollutionData, setPollutionData] = useState<PollutionData | null>(null);
  const [error, setError] = useState('');
  const [usingMockData, setUsingMockData] = useState(false);

  const getAQICategory = (aqi: number): Category => {
    const categories: Record<number, Category> = {
      1: { name: 'Good', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-600' },
      2: { name: 'Fair', color: 'bg-yellow-500', icon: AlertCircle, textColor: 'text-yellow-600' },
      3: { name: 'Moderate', color: 'bg-orange-500', icon: AlertTriangle, textColor: 'text-orange-600' },
      4: { name: 'Poor', color: 'bg-red-500', icon: XCircle, textColor: 'text-red-600' },
      5: { name: 'Very Poor', color: 'bg-purple-500', icon: XCircle, textColor: 'text-purple-600' }
    };
    return categories[aqi] || categories[1];
  };

  const getPollutantCategory = (value: number, pollutant: string): number => {
    const ranges: Record<string, number[]> = {
      so2: [20, 80, 250, 350],
      no2: [40, 70, 150, 200],
      pm10: [20, 50, 100, 200],
      pm2_5: [10, 25, 50, 75],
      o3: [60, 100, 140, 180],
      co: [4400, 9400, 12400, 15400]
    };

    const range = ranges[pollutant];
    if (!range) return 1;

    if (value < range[0]) return 1;
    if (value < range[1]) return 2;
    if (value < range[2]) return 3;
    if (value < range[3]) return 4;
    return 5;
  };

  const getMockDataForLocation = (searchLocation: string): PollutionData | null => {
    const normalizedSearch = searchLocation.toLowerCase().trim();
    
    for (const [key, data] of Object.entries(MOCK_DATA)) {
      if (key.toLowerCase().includes(normalizedSearch) || 
          normalizedSearch.includes(key.toLowerCase().split(',')[0])) {
        return data;
      }
    }
    
    for (const [key, data] of Object.entries(MOCK_DATA)) {
      const cityName = key.toLowerCase().split(',')[0];
      if (normalizedSearch.includes(cityName) || cityName.includes(normalizedSearch)) {
        return data;
      }
    }
    
    return MOCK_DATA["London, UK"];
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setPollutionData(null);
    setUsingMockData(false);

    try {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`
      );
      
      if (!geoResponse.ok) {
        throw new Error(`Geocoding API failed: ${geoResponse.status}`);
      }
      
      const geoData = await geoResponse.json();

      if (!geoData.length) {
        throw new Error('Location not found in API');
      }

      const { lat, lon, name, country } = geoData[0];

      const pollutionResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      
      if (!pollutionResponse.ok) {
        throw new Error(`Pollution API failed: ${pollutionResponse.status}`);
      }
      
      const pollution = await pollutionResponse.json();

      if (!pollution.list || !pollution.list.length) {
        throw new Error('No pollution data available');
      }
      
      setPollutionData({
        location: `${name}, ${country}`,
        aqi: pollution.list[0].main.aqi,
        components: pollution.list[0].components
      });
      
    } catch (apiError) {
      const mockData = getMockDataForLocation(location);
      
      if (mockData) {
        setPollutionData(mockData);
        setUsingMockData(true);
        
        setTimeout(() => {
          setError(`Note: Showing mock data for "${location}". API may be unavailable.`);
        }, 100);
      } else {
        setError('Location not found. Please try: London, New York, Delhi, Tokyo, or Beijing.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const category = pollutionData ? getAQICategory(pollutionData.aqi) : null;
  const CategoryIcon = category ? category.icon : AlertCircle;

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 text-sm text-black">"
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Air Pollution Checker
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Check real-time air quality in any city
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* LEFT COLUMN */}
        <div className="lg:w-1/3 space-y-4">

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-600" />
              Search Location
            </h2>

            <div className="space-y-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter city name"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm transition-colors disabled:bg-gray-400"
              >
                <Search className="w-4 h-4" />
                {loading ? "Searching..." : "Check Air Quality"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 p-2 rounded-md border text-xs bg-red-50 border-red-200 text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Cities */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Try these cities:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(MOCK_DATA).map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocation(city.split(",")[0]);
                      handleSearch();
                    }}
                    className="px-2 py-1 text-xs rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100"
                  >
                    {city.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/*Legend*/}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              Scale
            </h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(aqi => {
                const cat = getAQICategory(aqi);
                return (
                  <div key={aqi} className="flex items-center gap-2">
                    <div className={`${cat.color} w-6 h-6 rounded flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{aqi}</span>
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:w-2/3">

          {pollutionData ? (
            <div className="space-y-4">

              {/* AQI Card */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {pollutionData.location}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Air Quality Index
                    </p>
                  </div>
                  <div className={`${category!.color} text-white p-3 rounded-full`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${category!.textColor}`}>
                    {pollutionData.aqi}
                  </span>
                  <span className={`text-lg font-semibold ${category!.textColor}`}>
                    {category!.name}
                  </span>
                </div>
              </div>

              {/* Pollutants Table */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Pollutant Levels (μg/m³)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Pollutant</th>
                        <th className="text-left py-2 px-3">Value</th>
                        <th className="text-left py-2 px-3">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: "so2", name: "SO₂", value: pollutionData.components.so2 },
                        { key: "no2", name: "NO₂", value: pollutionData.components.no2 },
                        { key: "pm10", name: "PM10", value: pollutionData.components.pm10 },
                        { key: "pm2_5", name: "PM2.5", value: pollutionData.components.pm2_5 },
                        { key: "o3", name: "O₃", value: pollutionData.components.o3 },
                        { key: "co", name: "CO", value: pollutionData.components.co },
                      ].map(({ key, name, value }) => {
                        const cat = getAQICategory(getPollutantCategory(value, key));
                        const Icon = cat.icon;
                        return (
                          <tr key={key} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 font-medium">{name}</td>
                            <td className="py-2 px-3">{value.toFixed(2)}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${cat.textColor}`} />
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${cat.color}`}>
                                  {cat.name}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : !loading && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Droplets className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Welcome
              </h3>
              <p className="text-sm text-gray-600">
                Enter a city name to view air quality data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

}