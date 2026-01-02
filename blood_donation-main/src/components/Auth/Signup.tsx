import { useState } from 'react';
import { Heart, MapPin, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SignupProps {
  onDone: () => void;
  onShowLogin: () => void;
}

const countryCodes = [
  { code: '+91', label: 'India 🇮🇳' },
  { code: '+1', label: 'USA 🇺🇸' },
  { code: '+44', label: 'UK 🇬🇧' },
  { code: '+61', label: 'Australia 🇦🇺' }
];

export function Signup({ onDone, onShowLogin }: SignupProps) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    blood_group: '',
    country_code: '+91',
    phone_number: '',
    latitude: null as number | null,
    longitude: null as number | null,
    location_address: '',
    is_available: true
  });

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  /* ======================
     📍 GET CURRENT LOCATION
  ====================== */
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
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

          setForm(prev => ({
            ...prev,
            latitude,
            longitude,
            location_address: address
          }));
          setError('');
        } catch (err) {
          setError('Failed to get address from location');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setError('Location access denied');
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
      setError('Location search failed');
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
        setForm(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          location_address: address
        }));
        setLocationSearch('');
        setLocationSuggestions([]);
      }
    } catch (err) {
      setError('Failed to select location');
    }
  };

  /* ======================
     🚀 SUBMIT
  ====================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.latitude || !form.longitude || !form.location_address) {
      setError('Please select your location');
      setLoading(false);
      return;
    }

    if (!form.blood_group) {
      setError('Please select your blood group');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      // Save profile
      if (!data.user) {
        setError('Failed to create user account');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          phone_number: `${form.country_code}${form.phone_number}`,
          blood_group: form.blood_group,
          latitude: form.latitude,
          longitude: form.longitude,
          location_address: form.location_address,
          is_available: form.is_available
        })
        .eq('id', data.user.id);

      if (updateError) throw updateError;

      // Force reload the current user's profile
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        await supabase.auth.refreshSession();
      }
    } catch (err: any) {
      console.error('❌ Profile save failed:', err);
      setError(`Profile save failed: ${err.message}`);
      setLoading(false);
      return;
    }

    setLoading(false);
    onDone();
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-red-500 p-3 rounded-full">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border p-3 rounded"
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border p-3 rounded"
          />

          <input
            placeholder="Full Name"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full border p-3 rounded"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
            <select
              value={form.blood_group}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
              className="w-full border p-3 rounded"
              required
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={form.country_code}
              onChange={(e) => setForm({ ...form, country_code: e.target.value })}
              className="border p-3 rounded w-28"
            >
              {countryCodes.map(c => (
                <option key={c.code}>{c.code}</option>
              ))}
            </select>

            <input
              placeholder="Phone Number"
              required
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '') })
              }
              className="w-full border p-3 rounded"
            />
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {locating ? 'Detecting location…' : 'Use current location'}
            </button>

            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1 border p-3 rounded"
                />
                <button
                  type="button"
                  onClick={searchLocation}
                  disabled={searchingLocation || !locationSearch.trim()}
                  className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {form.location_address && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                📍 {form.location_address}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            />
            Available to donate blood
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded font-semibold"
          >
            {loading ? 'Creating account…' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onShowLogin}
            className="text-red-500 font-medium"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
