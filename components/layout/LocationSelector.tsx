"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Navigation,
  ChevronDown,
  Check,
  Search,
  X,
  Loader2,
  AlertCircle,
  Edit3,
  Sparkles,
} from "lucide-react";

export interface LocationInfo {
  city: string;
  state: string;
  pincode?: string;
  lat?: number;
  lon?: number;
  isDetected?: boolean;
  isConfirmed?: boolean;
}

export const POPULAR_CITIES: LocationInfo[] = [
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

export interface LocationSelectorProps {
  value?: LocationInfo;
  onChange?: (loc: LocationInfo) => void;
  className?: string;
  buttonClassName?: string;
  id?: string;
  isOpenControlled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LocationSelector({
  value,
  onChange,
  className = "",
  buttonClassName = "",
  id = "navbar-location-selector-btn",
  isOpenControlled,
  onOpenChange,
}: LocationSelectorProps = {}) {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(
    value || {
      city: "Hisar",
      state: "Haryana",
      isConfirmed: true,
    }
  );
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDropdownOpen = isOpenControlled !== undefined ? isOpenControlled : internalIsOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (isOpenControlled === undefined) {
        setInternalIsOpen(open);
      }
      onOpenChange?.(open);
    },
    [isOpenControlled, onOpenChange]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unconfirmedDetected, setUnconfirmedDetected] = useState<LocationInfo | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with value prop if controlled
  useEffect(() => {
    if (value) {
      setCurrentLocation(value);
    }
  }, [value]);

  // Load persisted location if value not passed
  useEffect(() => {
    if (!value) {
      try {
        const saved = localStorage.getItem("curalink_user_location");
        if (saved) {
          setCurrentLocation(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Error reading saved location:", e);
      }
    }
  }, [value]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setErrorMsg(null);
      setUnconfirmedDetected(null);
    }
  }, [isDropdownOpen]);

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
  }, [setIsOpen]);

  // Persist and dispatch location selection
  const selectLocation = useCallback(
    (loc: LocationInfo, isConfirmed = true) => {
      const updated: LocationInfo = {
        ...loc,
        isConfirmed,
      };
      setCurrentLocation(updated);
      setErrorMsg(null);
      setUnconfirmedDetected(null);
      try {
        localStorage.setItem("curalink_user_location", JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent("curalink-location-changed", { detail: updated })
        );
      } catch (e) {
        console.error("Failed to persist location:", e);
      }
      onChange?.(updated);
      setIsOpen(false);
    },
    [onChange, setIsOpen]
  );

  // Geolocation Auto-detection via browser GPS + Nominatim Reverse Geocoding
  // Does NOT immediately force/apply without confirmation
  const handleAutoDetect = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);
    setUnconfirmedDetected(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          // Call OpenStreetMap Nominatim Reverse Geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error("Failed to reverse geocode coordinates");
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

          const detected: LocationInfo = {
            city,
            state,
            pincode,
            lat: latitude,
            lon: longitude,
            isDetected: true,
            isConfirmed: false,
          };

          // Present detected location for user confirmation
          setUnconfirmedDetected(detected);
        } catch (err) {
          console.warn("Reverse geocoding network error:", err);
          const fallback: LocationInfo = {
            city: `Area near ${latitude.toFixed(2)}N`,
            state: "India",
            lat: latitude,
            lon: longitude,
            isDetected: true,
            isConfirmed: false,
          };
          setUnconfirmedDetected(fallback);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error.code, error.message);
        let msg = "Location permission denied or unavailable.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Permission denied. Please search your city manually above.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Try manual search.";
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
              isDetected: false,
              isConfirmed: true,
            };
          });

          // Filter duplicates
          const unique = parsed.filter(
            (v, idx, self) =>
              idx ===
              self.findIndex(
                (t) => t.city.toLowerCase() === v.city.toLowerCase()
              )
          );

          setSearchResults(unique);
        }
      } catch (err) {
        console.error("Live location search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const localFilteredCities = POPULAR_CITIES.filter((loc) =>
    `${loc.city} ${loc.state} ${loc.pincode || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Handle Enter key in search box to select immediately
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        selectLocation(searchResults[0]);
      } else if (localFilteredCities.length > 0) {
        selectLocation(localFilteredCities[0]);
      } else if (searchQuery.trim().length > 0) {
        selectLocation({
          city: searchQuery.trim(),
          state: "India",
          isConfirmed: true,
        });
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isDropdownOpen)}
        className={`flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#1C2338] px-3 py-1.5 text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] transition-all hover:bg-slate-100 dark:hover:bg-[#263049] hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none cursor-pointer ${buttonClassName}`}
        aria-label="Select location"
      >
        <MapPin className="h-3.5 w-3.5 text-[#0F9D8C] shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-[160px]">
          {currentLocation.isDetected && !currentLocation.isConfirmed ? (
            <span className="text-amber-700 dark:text-amber-400">
              📍 Detected: {currentLocation.city}
            </span>
          ) : (
            `${currentLocation.city}, ${currentLocation.state}`
          )}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
      </button>

      {/* Location Dropdown Modal */}
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4 shadow-2xl ring-1 ring-slate-900/10 dark:ring-black/40 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263049] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C]">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9] uppercase tracking-wider">
                  Select Your City
                </h3>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  Search manually or pick from popular cities
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2338] hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close location selector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 1. PROMINENT SEARCH BOX AT TOP */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type city or pincode (e.g. Hisar, New Delhi)..."
              className="w-full rounded-xl border border-[#CBD5E1] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#1C2338] pl-9 pr-9 py-2 text-xs font-medium text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#0F9D8C] focus:bg-white dark:focus:bg-[#151B2E] focus:ring-2 focus:ring-[#0F9D8C]/20 focus:outline-none transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-slate-400" />
            ) : null}
          </div>

          {/* 2. AUTO-DETECT CONFIRMATION PROMPT (If detection just completed) */}
          {unconfirmedDetected && (
            <div className="mt-3 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <Navigation className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Detected Area (GPS/IP)
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#0F172A] dark:text-[#F1F5F9]">
                    {unconfirmedDetected.city}, {unconfirmedDetected.state}
                  </p>
                  <p className="text-[10.5px] text-amber-800 dark:text-amber-300 mt-0.5">
                    Desktop browsers estimate location via IP network and may be inaccurate. Is this correct?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => selectLocation(unconfirmedDetected, true)}
                  className="flex-1 rounded-lg bg-[#0F9D8C] hover:bg-[#0C8577] text-white py-1.5 px-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  ✓ Confirm {unconfirmedDetected.city}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUnconfirmedDetected(null);
                    searchInputRef.current?.focus();
                  }}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1C2338] hover:bg-slate-50 dark:hover:bg-[#263049] text-slate-700 dark:text-slate-200 py-1.5 px-2 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ✏️ Not Correct? Change
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 3. QUICK-PICK POPULAR CITIES (Always easily accessible) */}
          <div className="mt-3">
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {searchQuery ? "Matching Popular Cities" : "Quick Pick Popular Cities"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {localFilteredCities.slice(0, 8).map((loc) => {
                const isSelected =
                  currentLocation.city.toLowerCase() === loc.city.toLowerCase();
                return (
                  <button
                    key={loc.city}
                    type="button"
                    onClick={() => selectLocation(loc, true)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-[#0F9D8C] text-white font-semibold shadow-xs"
                        : "bg-slate-100 dark:bg-[#1C2338] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#263049]"
                    }`}
                  >
                    <span>{loc.city}</span>
                    {isSelected && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. LIVE SEARCH RESULTS OR CUSTOM CITY ENTRY */}
          {searchQuery.trim().length > 0 && (
            <div className="mt-3 border-t border-slate-100 dark:border-[#263049] pt-2 max-h-44 overflow-y-auto space-y-1 pr-1">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-[10px] font-bold text-[#0F9D8C] uppercase tracking-wider px-1">
                    Search Results ({searchResults.length})
                  </p>
                  {searchResults.map((loc, idx) => (
                    <button
                      key={`live-${loc.city}-${idx}`}
                      type="button"
                      onClick={() => selectLocation(loc, true)}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-[#0F172A] dark:text-[#F1F5F9] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0F9D8C]" />
                        <span className="truncate font-semibold">
                          {loc.city}, {loc.state}
                        </span>
                      </div>
                      {loc.pincode && (
                        <span className="rounded bg-slate-100 dark:bg-[#1C2338] px-1.5 py-0.5 text-[10px] text-slate-500 shrink-0">
                          {loc.pincode}
                        </span>
                      )}
                    </button>
                  ))}
                </>
              ) : null}

              {/* Direct custom selection button for any typed city */}
              <button
                type="button"
                onClick={() =>
                  selectLocation(
                    {
                      city: searchQuery.trim(),
                      state: "India",
                    },
                    true
                  )
                }
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#0F9D8C]/40 bg-teal-50/50 dark:bg-teal-950/30 p-2.5 text-left text-xs font-semibold text-[#0F9D8C] hover:bg-teal-100/60 dark:hover:bg-teal-900/40 transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>Select &quot;{searchQuery.trim()}&quot; as your city</span>
              </button>
            </div>
          )}

          {/* 5. AUTO-DETECT GPS BUTTON AT BOTTOM (Secondary / Optional helper) */}
          <div className="mt-3.5 border-t border-slate-100 dark:border-[#263049] pt-3">
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-[#1C2338] hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-[#263049] hover:border-teal-300 dark:hover:border-teal-700/60 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0F9D8C] dark:hover:text-[#14B8A6] transition-all cursor-pointer disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F9D8C]" />
                  <span>Detecting location...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-3.5 w-3.5 text-[#0F9D8C]" />
                  <span>Auto-detect via GPS</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                    (Best on mobile)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
