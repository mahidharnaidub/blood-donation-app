import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Camera,
  Phone,
  Calendar,
  LogOut,
  HeartPulse,
  ShieldCheck,
  HelpCircle,
  Bell,
  User,
  MapPin,
  Users,
  Settings,
  Edit3,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, DonationHistory } from '../../lib/supabase';
import { formatPhoneNumber } from '../../utils/helpers';
import { useToast } from '../Toast/Toast';
import { EmptyState, ButtonLoader } from '../Loading/Loading';

/* =====================
   LOCKED OVERLAY
===================== */
const LockedOverlay = ({ onLogin }: { onLogin: () => void }) => (
  <div className="absolute inset-0 z-30 flex items-center justify-center">
    <div className="absolute inset-0 backdrop-blur-md bg-white/40" />
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs"
    >
      <h2 className="text-lg font-semibold mb-2">Login required</h2>
      <p className="text-sm text-gray-500 mb-4">
        Please login to view your profile
      </p>
      <button
        onClick={onLogin}
        className="w-full bg-red-500 text-white py-2 rounded-xl"
      >
        Login
      </button>
    </motion.div>
  </div>
);

interface ProfileProps {
  onEdit: () => void;
  onRequireAuth: () => void;
  onFindDonors?: () => void;
  onSettings?: () => void;
}

export function Profile({ onEdit, onRequireAuth, onFindDonors, onSettings }: ProfileProps) {
  const { profile, signOut } = useAuth();
  const { showToast } = useToast();
  
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  /* =====================
     LOAD DONATION HISTORY
  ===================== */
  useEffect(() => {
    if (!profile) return;
    supabase
      .from('donation_history')
      .select('*')
      .eq('user_id', profile.id)
      .order('donation_date', { ascending: false })
      .then(({ data }) => setDonations(data || []));
  }, [profile]);

  /* =====================
     PROFILE COMPLETION
  ===================== */
  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.full_name,
      profile.phone_number,
      profile.location_address,
      profile.blood_group,
      profile.last_donation_date,
      profile.emergency_contact_name,
      profile.emergency_contact_phone
    ];
    return Math.round(
      (fields.filter(Boolean).length / fields.length) * 100
    );
  }, [profile]);

  /* =====================
     AVAILABILITY TOGGLE
  ===================== */
  const toggleAvailability = async () => {
    if (!profile) return;
    setUpdatingAvailability(true);

    try {
      await supabase
        .from('profiles')
        .update({ is_available: !profile.is_available })
        .eq('id', profile.id);

      showToast({
        type: 'success',
        message: `You are now ${!profile.is_available ? 'available' : 'unavailable'} to donate`
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to update availability'
      });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  /* =====================
     PROFILE PHOTO UPLOAD
  ===================== */
  const uploadAvatar = async (file: File) => {
    if (!profile) return;

    try {
      const filePath = `${profile.id}.jpg`;

      await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .update({ profile_photo_url: data.publicUrl })
        .eq('id', profile.id);

      showToast({
        type: 'success',
        message: 'Profile photo updated successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to upload photo'
      });
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 relative">
        <div className="max-w-lg mx-auto px-4 py-6">
          <EmptyState
            icon={<User className="w-8 h-8 text-gray-400" />}
            title="Profile Not Available"
            description="Please login to view your profile information"
            action={
              <button
                onClick={onRequireAuth}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-medium"
              >
                Login
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24 relative">

      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
            <h1 className="font-semibold">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            {onSettings && (
              <button onClick={onSettings} className="p-2 rounded-lg bg-gray-100">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button onClick={onEdit} className="text-red-500 font-medium">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow mb-4"
        >
          <div className="flex gap-4 items-center mb-4">
            <div className="relative">
              <img
                src={profile?.profile_photo_url || undefined}
                alt=""
                className="w-20 h-20 rounded-full object-cover bg-gray-200"
              />
              <input
                type="file"
                hidden
                id="avatar"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && uploadAvatar(e.target.files[0])
                }
              />
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </label>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">
                  {profile?.full_name || 'No name set'}
                </h2>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile?.location_address || 'No location'}
              </p>
              <span className="inline-block mt-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold">
                {profile?.blood_group || 'Not set'}
              </span>
            </div>
          </div>

          {/* AVAILABILITY */}
          <button
            onClick={toggleAvailability}
            disabled={updatingAvailability}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition ${
              profile?.is_available
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {updatingAvailability ? (
              <ButtonLoader text="Updating..." />
            ) : (
              <>
                <HeartPulse className="w-4 h-4" />
                {profile?.is_available ? 'Available to Donate' : 'Not Available'}
              </>
            )}
          </button>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          {onFindDonors && (
            <button
              onClick={onFindDonors}
              className="bg-white p-4 rounded-xl shadow flex flex-col items-center gap-2 hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm font-medium">Find Donors</span>
            </button>
          )}
          
          <button className="bg-white p-4 rounded-xl shadow flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium">Notifications</span>
          </button>
        </motion.div>

        {/* PROFILE COMPLETION */}
        <div className="bg-white rounded-2xl p-4 shadow mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Profile Completion</span>
            <span className="font-semibold">{completion}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-red-500 rounded-full"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-4 rounded-2xl shadow text-center">
            <p className="text-2xl font-bold">{donations.length}</p>
            <p className="text-sm text-gray-500">Total Donations</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow text-center">
            <p className="text-sm font-semibold">
              {profile?.last_donation_date
                ? formatDate(profile.last_donation_date)
                : 'Never'}
            </p>
            <p className="text-sm text-gray-500">Last Donated</p>
          </div>
        </div>

        {/* CONTACT & EMERGENCY */}
        <div className="bg-white rounded-2xl p-6 shadow mb-4 space-y-3">
          <h3 className="font-semibold">Contact & Emergency</h3>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Phone</span>
            <span className="text-sm font-medium">
              {profile?.phone_number
                ? formatPhoneNumber(profile.phone_number)
                : 'Not set'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Emergency Contact</span>
            <span className="text-sm font-medium">
              {profile?.emergency_contact_name
                ? `${profile.emergency_contact_name} (${profile.emergency_contact_phone})`
                : 'Not set'}
            </span>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-2xl p-6 shadow mb-4 space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </h3>
          <button className="w-full text-left text-sm py-2">
            Blood requests near me
          </button>
          <button className="w-full text-left text-sm py-2">
            Donation reminders
          </button>
          <button className="w-full text-left text-sm py-2">
            Availability auto-off alerts
          </button>
        </div>

        {/* SUPPORT & PRIVACY */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6 space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Safety & Support
          </h3>
          <p className="text-sm text-gray-600">
            Your details are visible only to verified hospitals.
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            Medical suitability is decided by doctors.
          </p>
        </div>

        {/* SIGN OUT */}
        <button
          onClick={signOut}
          className="w-full bg-red-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {!profile && <LockedOverlay onLogin={onRequireAuth} />}
    </div>
  );
}
