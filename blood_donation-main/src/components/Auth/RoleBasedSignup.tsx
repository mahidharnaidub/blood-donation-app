import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Building, User, UserCheck, AlertCircle, MapPin, Search } from 'lucide-react';
import { UserRole, SignupForm } from '../../types/multiRole';
import { supabase } from '../../lib/supabase';
import { useToast } from '../Toast/Toast';
import { ButtonLoader } from '../Loading/Loading';

interface RoleBasedSignupProps {
  onShowLogin: () => void;
  onDone: () => void;
}

export function RoleBasedSignup({ onShowLogin, onDone }: RoleBasedSignupProps) {
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState<SignupForm>({
    email: '',
    password: '',
    full_name: '',
    blood_group: '',
    phone_number: '',
    country_code: '+91',
    latitude: null as number | null,
    longitude: null as number | null,
    location_address: '',
    is_available: true,
    role: 'user',
    referral_code: '',
    hospital_name: '',
    hospital_license: '',
    hospital_services: []
  });

  const roles = [
    {
      key: 'user' as UserRole,
      title: 'Blood Donor',
      description: 'Donate blood, find donors, support causes',
      icon: User,
      color: 'bg-red-500',
      features: ['Find nearby donors', 'Donate blood', 'Support causes', 'Emergency requests']
    },
    {
      key: 'hospital' as UserRole,
      title: 'Hospital',
      description: 'Post blood requests, find donors',
      icon: Building,
      color: 'bg-blue-500',
      features: ['Post blood requests', 'Find donors', 'Subscription plans', 'Analytics']
    },
    {
      key: 'agent' as UserRole,
      title: 'Agent',
      description: 'Refer hospitals, earn commissions',
      icon: UserCheck,
      color: 'bg-green-500',
      features: ['Refer hospitals', 'Earn commissions', 'Track referrals', 'Monthly payouts']
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setForm(prev => ({ ...prev, role }));
    setStep(2);
  };

  const handleInputChange = (field: keyof SignupForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (selectedRole === 'user' && !form.blood_group) {
      setError('Please select your blood group');
      setLoading(false);
      return;
    }

    try {
      // Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      });
      
      if (authError || !data.user) {
        setError(authError?.message || 'Signup failed');
        setLoading(false);
        return;
      }

      // Update profile with role and additional data
      const profileData: any = {
        full_name: form.full_name,
        phone_number: `${form.country_code}${form.phone_number}`,
        blood_group: form.blood_group,
        latitude: form.latitude,
        longitude: form.longitude,
        location_address: form.location_address,
        is_available: form.is_available,
        role: form.role
      };

      // Add role-specific fields
      if (form.role === 'hospital') {
        profileData.full_name = form.hospital_name;
        profileData.hospital_license = form.hospital_license;
        profileData.hospital_services = form.hospital_services;
      }

      // Handle referral code
      if (form.referral_code && form.role === 'hospital') {
        // TODO: Validate referral code and set referred_by
        profileData.referred_by = form.referral_code;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Profile update failed:', updateError);
        throw updateError;
      }

      showToast({
        type: 'success',
        message: 'Account created successfully!'
      });

      onDone();
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Join Our Platform</h2>
        <p className="text-gray-600">Choose your role to get started</p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <motion.button
            key={role.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect(role.key)}
            className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-red-200 transition-all text-left"
          >
            <div className="flex gap-4">
              <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <role.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{role.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-2">
                  {role.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onShowLogin}
            className="text-red-500 font-medium hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </motion.div>
  );

  const renderSignupForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep(1)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">
            Create {roles.find(r => r.key === selectedRole)?.title} Account
          </h2>
          <p className="text-gray-600">Fill in your details to get started</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common fields */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-lg">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {selectedRole === 'hospital' ? 'Hospital Name' : 'Full Name'}
            </label>
            <input
              type="text"
              value={selectedRole === 'hospital' ? form.hospital_name : form.full_name}
              onChange={(e) => handleInputChange(
                selectedRole === 'hospital' ? 'hospital_name' : 'full_name',
                e.target.value
              )}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={selectedRole === 'hospital' ? 'Hospital name' : 'Your full name'}
              required
            />
          </div>

          {/* Blood Group - Only for Blood Donors */}
          {selectedRole === 'user' && (
            <div>
              <label className="block text-sm font-medium mb-2">Blood Group</label>
              <select
                value={form.blood_group}
                onChange={(e) => handleInputChange('blood_group', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <div className="flex gap-2">
              <select
                value={form.country_code}
                onChange={(e) => handleInputChange('country_code', e.target.value)}
                className="px-3 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <input
                type="tel"
                value={form.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {locating ? 'Detecting location…' : 'Use current location'}
            </button>

            <div className="relative mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1 border p-3 rounded-lg"
                />
                <button
                  type="button"
                  onClick={searchLocation}
                  disabled={searchingLocation || !locationSearch.trim()}
                  className="px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200"
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
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                📍 {form.location_address}
              </div>
            )}
          </div>

          {/* Hospital specific fields */}
          {selectedRole === 'hospital' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Hospital License Number</label>
                <input
                  type="text"
                  value={form.hospital_license}
                  onChange={(e) => handleInputChange('hospital_license', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="License number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Services Offered</label>
                <div className="space-y-2">
                  {['Emergency Care', 'Blood Bank', 'Surgery', 'Maternity', 'ICU', 'Pediatrics'].map((service) => (
                    <label key={service} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.hospital_services?.includes(service) || false}
                        onChange={(e) => {
                          const services = form.hospital_services || [];
                          if (e.target.checked) {
                            handleInputChange('hospital_services', [...services, service]);
                          } else {
                            handleInputChange('hospital_services', services.filter(s => s !== service));
                          }
                        }}
                        className="rounded"
                      />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Referral code for hospitals */}
          {selectedRole === 'hospital' && (
            <div>
              <label className="block text-sm font-medium mb-2">Referral Code (Optional)</label>
              <input
                type="text"
                value={form.referral_code}
                onChange={(e) => handleInputChange('referral_code', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter agent referral code"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-4 rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <ButtonLoader text="Creating Account..." /> : 'Create Account'}
        </button>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {step === 1 ? renderRoleSelection() : renderSignupForm()}
        </AnimatePresence>
      </div>
    </div>
  );
}
