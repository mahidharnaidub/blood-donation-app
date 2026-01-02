import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Droplet,
  X,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { LocationSelector } from '../Location/LocationSelector';
import { supabase, BloodGroup, Profile } from '../../lib/supabase';
import {
  calculateDistance,
  formatDistance,
  getTimeSinceLastDonation
} from '../../utils/helpers';

/* ------------------ CONSTANTS ------------------ */
const bloodGroups: BloodGroup[] = [
  'A+','A-','B+','B-','AB+','AB-','O+','O-'
];

interface DonorWithDistance extends Profile {
  distance?: number;
}

interface HomeProps {
  onRequireAuth: () => void;
}

/* ------------------ HELPERS ------------------ */
const vibrate = () => navigator.vibrate?.(10);

const shortLocation = (loc: string) => {
  if (!loc) return '';
  return loc.split(',').slice(0, 2).join(',');
};

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  const p = name.split(' ');
  return p.length > 1 ? p[0][0] + p[1][0] : p[0][0];
};

/* ------------------ COMPONENT ------------------ */
export function Home({ onRequireAuth }: HomeProps) {
  const { user } = useAuth();
  const { currentLocation, setLocation } = useLocation();

  const [selectedBloodGroup, setSelectedBloodGroup] =
    useState<BloodGroup | null>(null);
  const [donors, setDonors] = useState<DonorWithDistance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDonors, setLoadingDonors] = useState(false);

  const [radius, setRadius] = useState(10);
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  /* Bottom sheets */
  const [showDonorSheet, setShowDonorSheet] =
    useState<DonorWithDistance | null>(null);

  /* ------------------ AUTO LOCATION INITIALIZATION ------------------ */
  useEffect(() => {
    const initializeLocation = async () => {
      // If no current location, detect it automatically
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
          }
        );
      }
    };

    initializeLocation();
  }, [currentLocation, setLocation]);

  /* ------------------ DATA ------------------ */
  useEffect(() => {
    if (!currentLocation) return;

    const loadDonors = async () => {
      setLoadingDonors(true);

      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('is_available', true);

        if (selectedBloodGroup) {
          query = query.eq('blood_group', selectedBloodGroup);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error loading donors:', error);
          setDonors([]);
          return;
        }

        const withDistance =
          data?.map((d) => ({
            ...d,
            distance: calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              d.latitude!,
              d.longitude!
            )
          }))
          .filter((d) => d.distance <= radius)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0)) || [];

        setDonors(withDistance);
      } catch (err) {
        console.error('Error loading donors:', err);
        setDonors([]);
      } finally {
        setLoadingDonors(false);
      }
    };

    loadDonors();
  }, [currentLocation, selectedBloodGroup, radius]);

  const filteredDonors = donors.filter((d) => {
    if (onlyAvailable && !d.is_available) return false;
    if (
      !(
        (d.full_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.location_address ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
      return false;

    return d.distance === undefined || d.distance <= radius;
  });

  /* ------------------ RENDER ------------------ */
  return (
    <div className="min-h-screen bg-[#FFF5F5] pb-24 overflow-x-hidden">

      {/* HEADER */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 space-y-3">

        <div className="flex items-center gap-2">
  {/* LOCATION SELECTOR */}
  <LocationSelector
    onLocationSelect={setLocation}
    currentLocation={currentLocation}
    compact={true}
    className="flex-1"
  />

  {/* LOGIN BUTTON */}
  {!user && (
    <button
      className="
        text-xs text-red-600 border border-red-600
        px-3 py-2 rounded-full
        shrink-0
      "
    >
      Login
    </button>
  )}
</div>


          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search donors"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border"
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-lg mx-auto px-4 py-5">

        <div className="grid grid-cols-4 gap-3 mb-5">
          {bloodGroups.map((g) => (
            <motion.button
              key={g}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                vibrate();
                setSelectedBloodGroup(
                  selectedBloodGroup === g ? null : g
                );
              }}
              className={`rounded-2xl p-3 ${
                selectedBloodGroup === g
                  ? 'bg-red-500 text-white'
                  : 'bg-white'
              }`}
            >
              <Droplet className="w-6 h-6 mx-auto text-red-500" />
              <p className="text-sm text-center mt-1">{g}</p>
            </motion.button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm mb-4">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="accent-red-500"
          />
          Show only available donors
        </label>

        <div className="flex gap-2 mb-6">
          {[5, 10, 20].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-4 py-2 rounded-full ${
                radius === r
                  ? 'bg-red-500 text-white'
                  : 'bg-white border'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        <h2 className="font-bold mb-4">Nearby Donors</h2>

        {loadingDonors ? (
          <p className="text-center py-16 text-gray-500">Loading…</p>
        ) : filteredDonors.length === 0 ? (
          <p className="text-center py-16 text-gray-500">
            No donors found
          </p>
        ) : (
          filteredDonors.map((d) => (
            <motion.div
              key={d.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDonorSheet(d)}
              className="bg-white rounded-2xl p-4 mb-4 shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                  {d.full_name ? getInitials(d.full_name) : '?'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{d.full_name || 'Name not set'}</p>
                  <p className="text-xs text-gray-500">
                    {d.distance
                      ? formatDistance(d.distance)
                      : d.location_address || 'Location unknown'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full">
                      {d.blood_group || 'Not set'}
                    </span>
                    {d.phone_number && (
                      <span className="text-xs text-gray-500">• Phone available</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* DONOR PROFILE SHEET */}
      <AnimatePresence>
        {showDonorSheet && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4 z-50"
          >
            <div className="flex justify-between mb-3">
              <p className="font-semibold">Donor profile</p>
              <X onClick={() => setShowDonorSheet(null)} />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center">
                {getInitials(showDonorSheet.full_name)}
              </div>
              <div>
                <p className="font-semibold">{showDonorSheet.full_name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistance(showDonorSheet.distance || 0)}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              Last donated:{' '}
              {getTimeSinceLastDonation(
                showDonorSheet.date_of_birth || undefined
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  (window.location.href = `tel:${showDonorSheet.phone_number}`)
                }
                className="flex-1 border py-2 rounded-xl"
              >
                Call
              </button>
              <button
                onClick={() => {
                  // TODO: Implement send request functionality
                  console.log('Send request to:', showDonorSheet.id);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
              >
                Request
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
