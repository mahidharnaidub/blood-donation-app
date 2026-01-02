import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationContextType {
  currentLocation: Location | null;
  setLocation: (location: Location | null) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
      localStorage.removeItem('userLocation');
    }
  }, []);

  const setLocation = (location: Location | null) => {
    setCurrentLocation(location);
    // Persist to localStorage
    if (location) {
      localStorage.setItem('userLocation', JSON.stringify(location));
    } else {
      localStorage.removeItem('userLocation');
    }
  };

  const clearLocation = () => {
    setCurrentLocation(null);
    localStorage.removeItem('userLocation');
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setLocation,
        clearLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
