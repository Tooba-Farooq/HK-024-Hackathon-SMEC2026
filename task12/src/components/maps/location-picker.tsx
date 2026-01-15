"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LocationPickerProps {
  label: string;
  value: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  required?: boolean;
}

export function LocationPicker({
  label,
  value,
  onChange,
  placeholder = "Enter location",
  required = false,
}: LocationPickerProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            "User-Agent": "RideSharingApp/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocation(query);
      setShowSuggestions(true);
    }, 500);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const displayName = suggestion.display_name.split(",").slice(0, 2).join(",");
    onChange(displayName, parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setSuggestions([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.value = displayName;
    }
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor={label}>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          id={label}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          required={required}
          className="pl-10 border-red-200 focus:border-red-600"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 border-red-200 shadow-lg">
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.display_name.split(",")[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.display_name.split(",").slice(1).join(",")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
