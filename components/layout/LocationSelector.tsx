"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, ChevronDown, Check, Search, X, Loader2, AlertCircle } from "lucide-react";

export interface LocationInfo {
  city: string;
  state: string;
  pincode?: string;
  lat?: number;
  lon?: number;
}

const POPULAR_CITIES: LocationInfo[] = [
  { city: "Hisar", state: "Haryana", pincode: "125001" },
  { city: "New Delhi", state: "Delhi", pincode: "110001" },
  { city: "Gurugram", state: "Haryana", pincode: "122001" },
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { city: "Chandigarh", state: "Punjab", pincode: "160017" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
];

export function LocationSelector() {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    city: "Hisar",
    state: "Haryana",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load persisted location
  useEffect(() => {
    try {
      const saved = localStorage.getItem("curalink_user_location");
      if (saved) {
        setCurrentLocation(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading saved location:", e);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLocation = useCallback((loc: LocationInfo) => {
    setCurrentLocation(loc);
    setErrorMsg(null);
    try {
      localStorage.setItem("curalink_user_location", JSON.stringify(loc));
      window.dispatchEvent(
        new CustomEvent("curalink-location-changed", { detail: loc })
      );
    } catch (e) {
      console.error("Failed to persist location:", e);
    }
    setIsOpen(false);
  }, []);

  // Real Geolocation Auto-detection via browser GPS + Nominatim Reverse Geocoding API
  const handleAutoDetect = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Call OpenStreetMap Nominatim Reverse Geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error("Failed to reverse geocode location");
          }

          const data = await response.json();
          const addr = data.address || {};

          // Extract real city, state, and pincode
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            addr.state_district ||
            addr.suburb ||
            "Your Area";

          const state = addr.state || addr.country || "India";
          const pincode = addr.postcode || undefined;

          const detectedLocation: LocationInfo = {
            city,
            state,
            pincode,
            lat: latitude,
            lon: longitude,
          };

          selectLocation(detectedLocation);
        } catch (err) {
          console.warn("Reverse geocoding network notice:", err);
          // Fallback to location coordinates label if network geocode is blocked
          selectLocation({
            city: `Lat ${latitude.toFixed(2)}`,
            state: `Lon ${longitude.toFixed(2)}`,
            lat: latitude,
            lon: longitude,
          });
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error.code, error.message);
        let msg = "Location permission denied or unavailable.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please select city manually.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Please try again.";
        }
        setErrorMsg(msg);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Live city / pincode search using Nominatim Search API
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    setIsSearching(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            q
          )}&limit=6&addressdetails=1`
        );

        if (response.ok) {
          const data = await response.json();
          const parsed: LocationInfo[] = data.map((item: any) => {
            const addr = item.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.county ||
              addr.state_district ||
              item.name;
            const state = addr.state || addr.country || "India";
            const pincode = addr.postcode || undefined;

            return {
              city,
              state,
              pincode,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            };
          });

          // Filter duplicates
          const unique = parsed.filter(
            (v, idx, self) =>
              idx ===
              self.findIndex(
                (t) => t.city === v.city && t.state === v.state
              )
          );

          setSearchResults(unique);
        }
      } catch (err) {
        console.error("Live location search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const localFilteredCities = POPULAR_CITIES.filter((loc) =>
    `${loc.city} ${loc.state} ${loc.pincode || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="navbar-location-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-slate-100 hover:border-slate-300 focus:outline-none"
        aria-label="Select location"
      >
        <MapPin className="h-3.5 w-3.5 text-[#0F9D8C] shrink-0" />
        <span className="truncate max-w-[110px] sm:max-w-[140px]">
          {currentLocation.city}, {currentLocation.state}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
      </button>

      {/* Location Dropdown Modal */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-xl ring-1 ring-slate-900/5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0F9D8C]" />
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Select Your Location
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Auto Detect Button */}
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-[#0F9D8C] hover:bg-teal-100/80 transition-colors disabled:opacity-50"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Detecting location via GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5" />
                <span>Auto-detect via GPS</span>
              </>
            )}
          </button>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search Box */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, town, or pincode..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-8 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#0F9D8C] focus:bg-white focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>

          {/* City List */}
          <div className="mt-3 max-h-52 overflow-y-auto space-y-1 pr-1">
            {/* Live Search Results */}
            {searchQuery.trim().length > 0 && searchResults.length > 0 && (
              <div className="mb-2 space-y-1">
                <p className="text-[10px] font-bold text-[#0F9D8C] uppercase tracking-wider px-2 py-0.5">
                  Live Search Matches
                </p>
                {searchResults.map((loc, idx) => (
                  <button
                    key={`live-${loc.city}-${idx}`}
                    onClick={() => selectLocation(loc)}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-teal-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[#0F9D8C]">📍</span>
                      <span className="truncate">
                        {loc.city}, {loc.state}
                      </span>
                    </div>
                    {loc.pincode && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 shrink-0">
                        {loc.pincode}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Popular Cities Header & List */}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">
              {searchQuery ? "Popular Cities Matches" : "Popular Cities"}
            </p>
            {localFilteredCities.map((loc) => {
              const isSelected =
                currentLocation.city.toLowerCase() === loc.city.toLowerCase();
              return (
                <button
                  key={loc.city}
                  onClick={() => selectLocation(loc)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-teal-50 text-[#0F9D8C] font-semibold"
                      : "text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📍</span>
                    <span>
                      {loc.city}, {loc.state}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-[#0F9D8C]" />
                  )}
                </button>
              );
            })}

            {/* Custom Fallback option */}
            {searchQuery.trim().length > 0 &&
              localFilteredCities.length === 0 &&
              searchResults.length === 0 &&
              !isSearching && (
                <button
                  onClick={() =>
                    selectLocation({
                      city: searchQuery.trim(),
                      state: "India",
                    })
                  }
                  className="w-full rounded-xl p-2.5 text-left text-xs font-medium text-[#0F9D8C] hover:bg-teal-50"
                >
                  Set location to &quot;{searchQuery.trim()}&quot;
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
