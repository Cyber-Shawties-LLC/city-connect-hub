import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface MarketArea {
  id: string;
  name: string;
  state: string;
  displayName: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export const MARKET_AREAS: MarketArea[] = [
  { id: 'norfolk', name: 'Norfolk', state: 'VA', displayName: 'Norfolk, Virginia', coordinates: { lat: 36.8468, lon: -76.2852 } },
  { id: 'el-paso', name: 'El Paso', state: 'TX', displayName: 'El Paso, Texas', coordinates: { lat: 31.7619, lon: -106.4850 } },
  { id: 'atlanta', name: 'Atlanta', state: 'GA', displayName: 'Atlanta, Georgia', coordinates: { lat: 33.7490, lon: -84.3880 } },
  { id: 'providence', name: 'Providence', state: 'RI', displayName: 'Providence, Rhode Island', coordinates: { lat: 41.8240, lon: -71.4128 } },
  { id: 'birmingham', name: 'Birmingham', state: 'AL', displayName: 'Birmingham, Alabama', coordinates: { lat: 33.5207, lon: -86.8025 } },
  { id: 'chesterfield', name: 'Chesterfield', state: 'VA', displayName: 'Chesterfield, Virginia', coordinates: { lat: 37.3768, lon: -77.5080 } },
  { id: 'seattle', name: 'Seattle', state: 'WA', displayName: 'Seattle, Washington', coordinates: { lat: 47.6062, lon: -122.3321 } },
];

interface LocationContextType {
  selectedMarket: MarketArea | null;
  detectedLocation: { lat: number; lon: number } | null;
  detectedMarket: MarketArea | null;
  isDetecting: boolean;
  locationError: string | null;
  setSelectedMarket: (market: MarketArea) => void;
  detectLocation: () => Promise<void>;
  getLocationString: () => string; // Returns "City, State" format
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the nearest market area within a threshold (50 miles)
function findNearestMarket(lat: number, lon: number): MarketArea | null {
  let nearest: MarketArea | null = null;
  let minDistance = Infinity;
  const threshold = 50; // miles

  for (const market of MARKET_AREAS) {
    if (market.coordinates) {
      const distance = calculateDistance(lat, lon, market.coordinates.lat, market.coordinates.lon);
      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        nearest = market;
      }
    }
  }

  return nearest;
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMarket, setSelectedMarketState] = useState<MarketArea | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [detectedMarket, setDetectedMarket] = useState<MarketArea | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsDetecting(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Changed to false - more reliable
          timeout: 15000, // Increased timeout
          maximumAge: 300000 // Allow cached position up to 5 minutes
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      setDetectedLocation({ lat, lon });

      // Find nearest market area
      const nearest = findNearestMarket(lat, lon);
      setDetectedMarket(nearest);

      // Auto-select if a market is found
      if (nearest) {
        setSelectedMarketState(nearest);
        setLocationError(null); // Clear any previous errors
      } else {
        setLocationError('You are not in a supported market area');
      }
    } catch (error: any) {
      console.error('Location detection error:', error);
      
      // Provide user-friendly error messages based on error code
      let errorMessage = 'Failed to detect location';
      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again or select your city manually.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLocationError(errorMessage);
      // Don't clear detected location if we already have one
      if (!detectedLocation) {
        setDetectedLocation(null);
        setDetectedMarket(null);
      }
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selected_market');
    if (saved) {
      try {
        const market = MARKET_AREAS.find(m => m.id === saved);
        if (market) {
          setSelectedMarketState(market);
        }
      } catch (e) {
        console.error('Failed to load saved market:', e);
      }
    } else {
      // Default to Norfolk if nothing is saved
      setSelectedMarketState(MARKET_AREAS[0]);
    }
    // Don't auto-detect on mount - let user explicitly request it
  }, []);

  // Save to localStorage when selected market changes
  useEffect(() => {
    if (selectedMarket) {
      localStorage.setItem('selected_market', selectedMarket.id);
    }
  }, [selectedMarket]);

  const setSelectedMarket = useCallback((market: MarketArea) => {
    setSelectedMarketState(market);
  }, []);

  const getLocationString = useCallback(() => {
    if (selectedMarket) {
      return `${selectedMarket.name}, ${selectedMarket.state}`;
    }
    return 'Norfolk, VA'; // Default fallback
  }, [selectedMarket]);

  return (
    <LocationContext.Provider
      value={{
        selectedMarket,
        detectedLocation,
        detectedMarket,
        isDetecting,
        locationError,
        setSelectedMarket,
        detectLocation,
        getLocationString,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

