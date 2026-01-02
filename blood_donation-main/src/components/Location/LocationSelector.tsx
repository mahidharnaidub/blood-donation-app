import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void;
  currentLocation?: Location | null;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function LocationSelector({ 
  onLocationSelect, 
  currentLocation, 
  className = '',
  showLabel = true,
  compact = false
}: LocationSelectorProps) {
  const [locating, setLocating] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  /* ======================
     📍 GET CURRENT LOCATION
  ====================== */
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const address = data.display_name || 'Location detected';

          const location: Location = {
            latitude,
            longitude,
            address
          };

          onLocationSelect(location);
          setShowSelector(false);
        } catch (err) {
          console.error('Failed to get address from location:', err);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error('Location access denied:', err);
        setLocating(false);
      }
    );
  };

  /* ======================
     🔍 SEARCH LOCATION
  ====================== */
  const searchLocation = async () => {
    if (!locationSearch.trim()) return;

    setSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=5`
      );
      const data = await res.json();
      const suggestions = data.map((item: any) => item.display_name);
      setLocationSuggestions(suggestions);
    } catch (err) {
      console.error('Location search failed:', err);
    } finally {
      setSearchingLocation(false);
    }
  };

  const selectLocation = async (address: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const location: Location = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          address
        };

        onLocationSelect(location);
        setLocationSearch('');
        setLocationSuggestions([]);
        setShowSelector(false);
      }
    } catch (err) {
      console.error('Failed to select location:', err);
    }
  };

  if (compact) {
    return (
      <div className={className}>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2 p-2 bg-red-50 rounded-full hover:bg-red-100 transition"
        >
          <MapPin className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-700 font-medium truncate max-w-[150px]">
            {currentLocation?.address?.split(',').slice(0, 2).join(', ') || 'Location'}
          </span>
        </button>

        {showSelector && (
          <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg p-3 z-50 mt-1">
            <div className="space-y-2">
              <button
                onClick={useCurrentLocation}
                disabled={locating}
                className="w-full flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <MapPin className="w-3 h-3" />
                {locating ? 'Detecting...' : 'Current Location'}
              </button>

              <div className="relative">
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Search area..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="flex-1 border p-2 rounded text-sm"
                  />
                  <button
                    onClick={searchLocation}
                    disabled={searchingLocation || !locationSearch.trim()}
                    className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <Search className="w-3 h-3" />
                  </button>
                </div>

                {locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded mt-1 max-h-32 overflow-y-auto z-10">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocation(suggestion)}
                        className="w-full text-left px-2 py-1 hover:bg-gray-100 text-xs"
                      >
                        {suggestion.split(',').slice(0, 2).join(', ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      )}
      
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="w-full flex items-center justify-between p-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-700 truncate">
            {currentLocation?.address?.split(',').slice(0, 2).join(', ') || 'Select location'}
          </span>
        </div>
        <span className="text-xs text-red-600">
          {currentLocation ? 'Change' : 'Select'}
        </span>
      </button>

      {showSelector && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg p-3 z-50 mt-1">
          <div className="space-y-2">
            <button
              onClick={useCurrentLocation}
              disabled={locating}
              className="w-full flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              <MapPin className="w-3 h-3" />
              {locating ? 'Detecting...' : 'Current Location'}
            </button>

            <div className="relative">
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Search area..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1 border p-2 rounded text-sm"
                />
                <button
                  onClick={searchLocation}
                  disabled={searchingLocation || !locationSearch.trim()}
                  className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>

              {locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded mt-1 max-h-32 overflow-y-auto z-10">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(suggestion)}
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 text-xs"
                    >
                      {suggestion.split(',').slice(0, 2).join(', ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentLocation && (
        <div className="mt-1 p-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          📍 {currentLocation.address?.split(',').slice(0, 2).join(', ')}
        </div>
      )}
    </div>
  );
}
