import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { requireOptionalNativeModule } from 'expo';

export interface UserLocation {
  area: string;         // e.g. "Sector 14", "Model Town", "Indiranagar"
  city: string;         // e.g. "Gurugram", "Hisar", "Bengaluru"
  state: string;        // e.g. "Haryana", "Karnataka"
  pincode?: string;
  fullAddress: string;  // e.g. "Sector 14, Gurugram, Haryana 122001"
  latitude?: number;
  longitude?: number;
  isAllIndia?: boolean;
  source?: 'gps' | 'search' | 'city' | 'network';
}

interface LocationContextValue {
  location: UserLocation;
  recentLocations: UserLocation[];
  isDetecting: boolean;
  locationError: string | null;
  setLocation: (loc: UserLocation) => Promise<void>;
  setAllIndiaMode: () => Promise<void>;
  detectCurrentLocation: () => Promise<UserLocation | null>;
  searchLocations: (query: string) => Promise<UserLocation[]>;
  clearError: () => void;
}

const LOCATION_STORE_KEY = 'curalink_user_real_location_v1';
const RECENT_STORE_KEY = 'curalink_recent_locations_v1';

export const DEFAULT_LOCATION: UserLocation = {
  area: 'All India',
  city: 'All India',
  state: 'India',
  fullAddress: 'All India • 24×7 Video & Clinic Visits',
  isAllIndia: true,
  source: 'city',
};

type ExpoLocationModule = typeof import('expo-location');
let cachedExpoLocation: ExpoLocationModule | null | undefined;

function getSafeLocationModule(): ExpoLocationModule | null {
  if (cachedExpoLocation !== undefined) return cachedExpoLocation;
  try {
    const nativeMod = requireOptionalNativeModule('ExpoLocation');
    if (!nativeMod) {
      cachedExpoLocation = null;
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-location') as ExpoLocationModule;
    if (mod && typeof mod.getCurrentPositionAsync === 'function') {
      cachedExpoLocation = mod;
      return mod;
    }
    cachedExpoLocation = null;
    return null;
  } catch {
    cachedExpoLocation = null;
    return null;
  }
}

async function reverseGeocodeViaNominatim(lat: number, lon: number): Promise<UserLocation | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CuraLinkMobileApp/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.city_district ||
      addr.state_district ||
      addr.county ||
      addr.village ||
      'India';

    const area =
      addr.neighbourhood ||
      addr.suburb ||
      addr.residential ||
      addr.road ||
      addr.quarter ||
      addr.village ||
      city;

    const state = addr.state || 'India';
    const pincode = addr.postcode || undefined;
    const parts = [area !== city ? area : null, city, state, pincode].filter(Boolean);

    return {
      area,
      city,
      state,
      pincode,
      fullAddress: parts.join(', ') || `${city}, ${state}`,
      latitude: lat,
      longitude: lon,
      isAllIndia: false,
      source: 'gps',
    };
  } catch {
    return null;
  }
}

async function detectLocationViaNetwork(): Promise<UserLocation | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const ipRes = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeout);
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData?.city) {
        return {
          area: ipData.city,
          city: ipData.city,
          state: ipData.region || 'India',
          pincode: ipData.postal || undefined,
          fullAddress: [ipData.city, ipData.region, ipData.postal].filter(Boolean).join(', '),
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          isAllIndia: false,
          source: 'network',
        };
      }
    }
  } catch {
    // Continue
  }
  return null;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<UserLocation>(DEFAULT_LOCATION);
  const [recentLocations, setRecentLocations] = useState<UserLocation[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSaved() {
      try {
        const [savedRaw, recentRaw] = await Promise.all([
          SecureStore.getItemAsync(LOCATION_STORE_KEY),
          SecureStore.getItemAsync(RECENT_STORE_KEY),
        ]);
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (parsed?.city && parsed?.area) setLocationState(parsed);
        }
        if (recentRaw) {
          const parsedRecent = JSON.parse(recentRaw);
          if (Array.isArray(parsedRecent)) setRecentLocations(parsedRecent.slice(0, 5));
        }
      } catch {
        // Ignore storage read error
      }
    }
    loadSaved();
  }, []);

  const persistLocation = useCallback(async (loc: UserLocation) => {
    setLocationState(loc);
    setLocationError(null);
    try {
      await SecureStore.setItemAsync(LOCATION_STORE_KEY, JSON.stringify(loc));
      if (!loc.isAllIndia) {
        setRecentLocations((prev) => {
          const filtered = prev.filter(
            (r) => !(r.area.toLowerCase() === loc.area.toLowerCase() && r.city.toLowerCase() === loc.city.toLowerCase())
          );
          const next = [loc, ...filtered].slice(0, 5);
          SecureStore.setItemAsync(RECENT_STORE_KEY, JSON.stringify(next)).catch(() => null);
          return next;
        });
      }
    } catch {
      // Ignore storage write error
    }
  }, []);

  const setAllIndiaMode = useCallback(async () => {
    await persistLocation(DEFAULT_LOCATION);
  }, [persistLocation]);

  const detectCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    setIsDetecting(true);
    setLocationError(null);

    try {
      const ExpoLoc = getSafeLocationModule();

      if (ExpoLoc) {
        // 1. Verify if Location Services (GPS) are toggled ON on the device
        let servicesEnabled = true;
        try {
          servicesEnabled = await ExpoLoc.hasServicesEnabledAsync();
        } catch {
          // Continue if unsupported
        }

        if (!servicesEnabled) {
          setLocationError('Device GPS is turned off. Please enable Location in your phone quick settings.');
          setIsDetecting(false);
          return null;
        }

        // 2. Request / verify foreground permissions
        let { status } = await ExpoLoc.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const requestRes = await ExpoLoc.requestForegroundPermissionsAsync();
          status = requestRes.status;
        }

        if (status !== 'granted') {
          setLocationError('Location permission was denied. Please select your city or area below.');
          setIsDetecting(false);
          return null;
        }

        // 3. Obtain Coordinates
        let latitude: number | null = null;
        let longitude: number | null = null;

        try {
          const lastKnown = await ExpoLoc.getLastKnownPositionAsync({ maxAge: 120000 });
          if (lastKnown?.coords) {
            latitude = lastKnown.coords.latitude;
            longitude = lastKnown.coords.longitude;
          }
        } catch {
          // Continue to live position
        }

        if (latitude === null || longitude === null) {
          const livePos = await ExpoLoc.getCurrentPositionAsync({
            accuracy: ExpoLoc.Accuracy.Balanced,
          });
          latitude = livePos.coords.latitude;
          longitude = livePos.coords.longitude;
        }

        if (latitude !== null && longitude !== null) {
          // 4. Native OS Reverse Geocoding
          try {
            const nativePlaces = await ExpoLoc.reverseGeocodeAsync({ latitude, longitude });
            if (nativePlaces && nativePlaces.length > 0) {
              const p = nativePlaces[0];
              const city = p.city || p.subregion || p.region || 'India';
              const area = p.district || p.name || p.street || city;
              const state = p.region || 'India';
              const pincode = p.postalCode || undefined;
              const parts = [area !== city ? area : null, city, state, pincode].filter(Boolean);

              const detected: UserLocation = {
                area,
                city,
                state,
                pincode,
                fullAddress: parts.join(', ') || `${city}, ${state}`,
                latitude,
                longitude,
                isAllIndia: false,
                source: 'gps',
              };
              await persistLocation(detected);
              return detected;
            }
          } catch {
            // Fall through to Nominatim
          }

          // 5. Nominatim OSM Fallback
          const nominatimResult = await reverseGeocodeViaNominatim(latitude, longitude);
          if (nominatimResult) {
            await persistLocation(nominatimResult);
            return nominatimResult;
          }

          const coordLocation: UserLocation = {
            area: 'Current Location',
            city: 'Local Area',
            state: 'India',
            fullAddress: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude,
            isAllIndia: false,
            source: 'gps',
          };
          await persistLocation(coordLocation);
          return coordLocation;
        }
      }

      // If ExpoLocation native module is not linked in this build or failed, use Network IP Geolocation
      const networkResult = await detectLocationViaNetwork();
      if (networkResult) {
        await persistLocation(networkResult);
        return networkResult;
      }

      setLocationError('Could not detect location automatically. Please search your area or select a city below.');
      return null;
    } catch (err: unknown) {
      // Final Network Fallback
      const networkResult = await detectLocationViaNetwork();
      if (networkResult) {
        await persistLocation(networkResult);
        return networkResult;
      }

      const msg = err instanceof Error ? err.message : 'Unable to acquire location.';
      setLocationError(`${msg} Please select your city or area below.`);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, [persistLocation]);

  const searchLocations = useCallback(async (query: string): Promise<UserLocation[]> => {
    const q = query.trim();
    if (q.length < 2) return [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&addressdetails=1&limit=8&q=${encodeURIComponent(
          q
        )}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CuraLinkMobileApp/1.0',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (!res.ok) return [];
      const rows = await res.json();
      if (!Array.isArray(rows)) return [];

      return rows.map((row: any) => {
        const addr = row.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.city_district ||
          addr.state_district ||
          addr.county ||
          addr.village ||
          row.name ||
          'India';
        const area =
          addr.neighbourhood ||
          addr.suburb ||
          addr.quarter ||
          addr.road ||
          row.name ||
          city;
        const state = addr.state || 'India';
        const pincode = addr.postcode || undefined;
        const parts = [area !== city ? area : null, city, state, pincode].filter(Boolean);

        return {
          area,
          city,
          state,
          pincode,
          fullAddress: parts.join(', ') || row.display_name,
          latitude: row.lat ? parseFloat(row.lat) : undefined,
          longitude: row.lon ? parseFloat(row.lon) : undefined,
          isAllIndia: false,
          source: 'search',
        } as UserLocation;
      });
    } catch {
      return [];
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        recentLocations,
        isDetecting,
        locationError,
        setLocation: persistLocation,
        setAllIndiaMode,
        detectCurrentLocation,
        searchLocations,
        clearError: () => setLocationError(null),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
