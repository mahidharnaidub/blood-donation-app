import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Phone,
  MessageCircle,
  Heart,
  Star,
  ChevronRight,
  X,
  Users,
  Loader2
} from 'lucide-react';
import { supabase, Profile } from '../../lib/supabase';
import { formatPhoneNumber } from '../../utils/helpers';
import { useLocation } from '../../contexts/LocationContext';
import { LocationSelector } from '../Location/LocationSelector';

interface DonorSearchProps {
  onBack: () => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function DonorSearch({ onBack }: DonorSearchProps) {
  const { currentLocation } = useLocation();
  const [donors, setDonors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    bloodGroup: '',
    maxDistance: 50, // km
    availableOnly: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load available donors when location changes
  useEffect(() => {
    loadDonors();
  }, [currentLocation]);

  const loadDonors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_available', true)
        .not('full_name', 'is', null);

      // Apply blood group filter
      if (searchFilters.bloodGroup) {
        query = query.eq('blood_group', searchFilters.bloodGroup);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredDonors = data || [];

      // Apply distance filter if location is available
      if (currentLocation && filteredDonors.length > 0) {
        filteredDonors = filteredDonors
          .filter(donor => donor.latitude && donor.longitude)
          .map(donor => {
            const distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              donor.latitude!,
              donor.longitude!
            );
            return { ...donor, distance };
          })
          .filter(donor => donor.distance <= searchFilters.maxDistance)
          .sort((a, b) => (a as any).distance - (b as any).distance);
      }

      setDonors(filteredDonors);
    } catch (error) {
      console.error('Error loading donors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two points
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

  // Filter donors based on search criteria
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesBloodGroup = !searchFilters.bloodGroup || donor.blood_group === searchFilters.bloodGroup;
      const matchesSearch = !searchQuery || 
        donor.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAvailability = !searchFilters.availableOnly || donor.is_available;

      return matchesBloodGroup && matchesSearch && matchesAvailability;
    });
  }, [donors, searchFilters.bloodGroup, searchQuery, searchFilters.availableOnly]);

  const clearFilters = () => {
    setSearchFilters({
      bloodGroup: '',
      maxDistance: 50,
      availableOnly: false
    });
    setSearchQuery('');
  };

  const makeCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={onBack}>
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-xl font-bold">Find Donors</h1>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 rounded-lg bg-gray-100"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* ACTIVE FILTERS */}
        {(searchFilters.bloodGroup || searchFilters.availableOnly) && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchFilters.bloodGroup && (
              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                {searchFilters.bloodGroup}
              </span>
            )}
            {searchFilters.availableOnly && (
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                Available
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* RESULTS */}
      <div className="max-w-lg mx-auto px-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No donors found</h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500">
                {filteredDonors.length} donors found
              </h2>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Heart className="w-3 h-3" />
                Verified donors
              </div>
            </div>

            {filteredDonors.map((donor) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {donor.full_name?.charAt(0) || 'U'}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {donor.full_name || 'Anonymous'}
                      </h3>
                      {donor.is_available && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
                          Available
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded font-medium">
                        {donor.blood_group || 'Unknown'}
                      </span>
                      {donor.location_address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">
                            {donor.location_address}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FILTER BOTTOM SHEET */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Blood Group
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSearchFilters(prev => ({
                        ...prev,
                        bloodGroup: prev.bloodGroup === group ? '' : group
                      }))}
                      className={`py-2 rounded-lg text-sm font-medium transition ${
                        searchFilters.bloodGroup === group
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={searchFilters.availableOnly}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      availableOnly: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Available donors only
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
