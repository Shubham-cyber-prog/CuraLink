"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, ChevronDown, Check, Search, X } from "lucide-react";

export interface LocationInfo {
  city: string;
  state: string;
  pincode?: string;
}

const POPULAR_CITIES: LocationInfo[] = [
  { city: "Hisar", state: "Haryana", pincode: "125001" },
  { city: "New Delhi", state: "Delhi", pincode: "110001" },
  { city: "Gurugram", state: "Haryana", pincode: "122001" },
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { city: "Chandigarh", state: "Punjab", pincode: "160017" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
];

export function LocationSelector() {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    city: "Hisar",
    state: "Haryana",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const selectLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    localStorage.setItem("curalink_user_location", JSON.stringify(loc));
    window.dispatchEvent(
      new CustomEvent("curalink-location-changed", { detail: loc })
    );
    setIsOpen(false);
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Reverse geocoding simulation / fallback
        const detectedLoc: LocationInfo = {
          city: "Hisar",
          state: "Haryana",
          pincode: "125001",
        };
        selectLocation(detectedLoc);
        setIsDetecting(false);
      },
      (error) => {
        console.warn("Geolocation permission denied or failed:", error.message);
        // Fallback to default
        const defaultLoc = { city: "Hisar", state: "Haryana" };
        selectLocation(defaultLoc);
        setIsDetecting(false);
      },
      { timeout: 5000 }
    );
  };

  const filteredCities = POPULAR_CITIES.filter((loc) =>
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
            <Navigation className="h-3.5 w-3.5" />
            <span>
              {isDetecting
                ? "Detecting location..."
                : "Auto-detect via GPS"}
            </span>
          </button>

          {/* Search Box */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city or pincode..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#0F9D8C] focus:bg-white focus:outline-none"
            />
          </div>

          {/* City List */}
          <div className="mt-3 max-h-48 overflow-y-auto space-y-1 pr-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Popular Cities
            </p>
            {filteredCities.map((loc) => {
              const isSelected = currentLocation.city === loc.city;
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
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#0F9D8C]" />}
                </button>
              );
            })}

            {filteredCities.length === 0 && searchQuery && (
              <button
                onClick={() =>
                  selectLocation({ city: searchQuery.trim(), state: "India" })
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
