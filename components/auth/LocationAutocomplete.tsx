/**
 * Location Autocomplete Component
 * 
 * Autocomplete input for place of birth with geocoding
 * Resolves city names to coordinates and handles ambiguous locations
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  required?: boolean;
  className?: string;
  label?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  required = false,
  className = '',
  label,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions from Google Places API or geocoding API
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Call our geocoding API
      const response = await fetch('/api/location/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          setSuggestions(data.results);
          setShowSuggestions(true);
        } else if (data.error) {
          console.warn('Location search error:', data.error);
          // Still allow manual entry even if autocomplete fails
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Location search failed:', errorData.error || 'Unknown error');
        // Allow manual entry even if API fails
      }
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query !== value) {
        fetchSuggestions(query);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Handle selection
  const handleSelect = (location: LocationResult) => {
    setQuery(location.formattedAddress);
    setSelectedLocation(location);
    setShowSuggestions(false);
    onChange(location.formattedAddress, { lat: location.lat, lng: location.lng });
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedLocation(null);
    onChange(newValue);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <Label className="text-white/80 mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Start typing city name (e.g., New Delhi, India)"
          required={required}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-white/60" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-[#1A2347] border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((location, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(location)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
            >
              <div className="text-white font-medium">{location.formattedAddress}</div>
              {location.city && location.country && (
                <div className="text-white/60 text-sm mt-1">
                  {location.city}, {location.country}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedLocation && (
        <div className="mt-2 text-xs text-white/60">
          Selected: {selectedLocation.formattedAddress} ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})
        </div>
      )}
    </div>
  );
};

