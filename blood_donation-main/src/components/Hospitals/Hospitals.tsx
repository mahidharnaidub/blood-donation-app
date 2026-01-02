import { useState, useEffect } from 'react';
import { Building, Phone, Navigation, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { LocationSelector } from '../Location/LocationSelector';

interface Hospital {
  id: string;
  full_name: string;
  location_address: string;
  latitude: number;
  longitude: number;
  phone_number?: string;
  role: 'hospital' | 'blood_bank';
  distance?: number;
}

interface HospitalsProps {
  onBack?: () => void;
}

export function Hospitals({ onBack }: HospitalsProps) {
  const { profile } = useAuth();
  const { currentLocation, setLocation } = useLocation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hospitals' | 'bloodBanks'>('hospitals'); // Default to hospitals

  // Initialize location from profile or detect current location
  useEffect(() => {
    const initializeLocation = async () => {
      // First try to get from profile
      if (profile?.latitude && profile?.longitude && profile?.location_address && !currentLocation) {
        setLocation({
          latitude: profile.latitude,
          longitude: profile.longitude,
          address: profile.location_address
        });
        return;
      }

      // If no profile location and no current location, detect current location
      if (!currentLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Get address from coordinates
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();
              const address = data.display_name || 'Current location';

              setLocation({
                latitude,
                longitude,
                address
              });
            } catch (error) {
              console.error('Failed to get address:', error);
              // Set location even if address fetch fails
              setLocation({
                latitude,
                longitude,
                address: 'Current location'
              });
            }
          },
          (error) => {
            console.error('Location detection failed:', error);
            // Set a default location or handle error appropriately
            setLoading(false);
          }
        );
      }
    };

    initializeLocation();
  }, [profile, currentLocation, setLocation]);

  // Fetch hospitals and blood banks when location changes
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLocation) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, location_address, latitude, longitude, phone_number, role')
          .in('role', ['hospital', 'blood_bank']);
          // Remove is_active check as it might not exist

        if (error) throw error;

        const allPlaces = data || [];
        
        // Calculate distances and sort
        const placesWithDistance = allPlaces.map(place => {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            place.latitude,
            place.longitude
          );
          return { ...place, distance };
        }).sort((a, b) => a.distance - b.distance);

        // Separate hospitals and blood banks
        const hospitalPlaces = placesWithDistance.filter(p => p.role === 'hospital');
        const bankPlaces = placesWithDistance.filter(p => p.role === 'blood_bank');

        setHospitals(hospitalPlaces);
        setBloodBanks(bankPlaces);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLocation]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const makeCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white hover:bg-gray-100 transition"
              >
                ← Back
              </button>
            )}
            <h1 className="text-2xl font-bold">Hospitals & Blood Banks</h1>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 transition"
            >
              ← Back
            </button>
          )}
          <h1 className="text-2xl font-bold">Hospitals & Blood Banks</h1>
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          <LocationSelector
            onLocationSelect={setLocation}
            currentLocation={currentLocation}
            compact={false}
          />
        </div>

        {/* Slider Tabs */}
        <div className="bg-white rounded-xl p-1 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🏥 Hospitals
            </button>
            <button
              onClick={() => setActiveTab('bloodBanks')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'bloodBanks'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🩸 Blood Banks
            </button>
          </div>
        </div>

        {!currentLocation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                Location access is required to show nearby hospitals and blood banks.
              </p>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'hospitals' ? (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              Nearby Hospitals
            </h2>
            
            {hospitals.length === 0 ? (
              <p className="text-gray-500">No hospitals found nearby.</p>
            ) : (
              <div className="space-y-3">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{hospital.full_name}</h3>
                      <span className="text-sm text-gray-500">
                        {hospital.distance?.toFixed(1) || '0.0'} km away
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {hospital.location_address}
                    </p>
                    
                    <div className="flex gap-2">
                      {hospital.phone_number && (
                        <button
                          onClick={() => makeCall(hospital.phone_number!)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                      )}
                      
                      <button
                        onClick={() => openDirections(hospital.location_address)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-500" />
              Blood Banks
            </h2>
            
            {bloodBanks.length === 0 ? (
              <p className="text-gray-500">No blood banks found nearby.</p>
            ) : (
              <div className="space-y-3">
                {bloodBanks.map((bloodBank) => (
                  <div key={bloodBank.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{bloodBank.full_name}</h3>
                      <span className="text-sm text-gray-500">
                        {bloodBank.distance?.toFixed(1) || '0.0'} km away
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {bloodBank.location_address}
                    </p>
                    
                    <div className="flex gap-2">
                      {bloodBank.phone_number && (
                        <button
                          onClick={() => makeCall(bloodBank.phone_number!)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                      )}
                      
                      <button
                        onClick={() => openDirections(bloodBank.location_address)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
