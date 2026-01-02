import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Camera,
  MapPin,
  Calendar,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, BloodGroup } from '../../lib/supabase';

/* ======================
   TYPES
====================== */
interface EditProfileProps {
  onBack: () => void;
}

interface FormData {
  full_name: string;
  blood_group: BloodGroup;
  location_address: string;
  phone_number: string;
  last_donation_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notify_requests: boolean;
  notify_reminders: boolean;
}

const bloodGroups: BloodGroup[] = [
  'A+','A-','B+','B-','AB+','AB-','O+','O-'
];

/* ======================
   COMPONENT
====================== */
export function EditProfile({ onBack }: EditProfileProps) {
  const { profile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    blood_group: 'O+',
    location_address: '',
    phone_number: '',
    last_donation_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notify_requests: true,
    notify_reminders: true
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ======================
     LOAD PROFILE
  ====================== */
  useEffect(() => {
    if (!profile) return;

    setFormData({
      full_name: profile.full_name || '',
      blood_group: profile.blood_group || 'O+',
      location_address: profile.location_address || '',
      phone_number: profile.phone_number || '',
      last_donation_date: profile.last_donation_date || '',
      emergency_contact_name: profile.emergency_contact_name || '',
      emergency_contact_phone: profile.emergency_contact_phone || '',
      notify_requests: profile.notify_requests ?? true,
      notify_reminders: profile.notify_reminders ?? true
    });
  }, [profile]);

  useEffect(() => {
    if (!profile) onBack();
  }, [profile, onBack]);

  /* ======================
     PHOTO UPLOAD
  ====================== */
  const uploadAvatar = async (file: File) => {
    if (!profile) return;

    const path = `${profile.id}.jpg`;

    await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    await supabase
      .from('profiles')
      .update({ profile_photo_url: data.publicUrl })
      .eq('id', profile.id);
  };

  /* ======================
     SUBMIT
  ====================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        blood_group: formData.blood_group,
        location_address: formData.location_address,
        phone_number: formData.phone_number,
        last_donation_date: formData.last_donation_date || null,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        notify_requests: formData.notify_requests,
        notify_reminders: formData.notify_reminders
      })
      .eq('id', profile.id);

    if (!error) {
      setSuccess(true);
      setTimeout(onBack, 1200);
    }

    setLoading(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-red-500 rounded-full" />
      </div>
    );
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* AVATAR */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={profile.profile_photo_url || undefined}
              className="w-24 h-24 rounded-full bg-gray-200 object-cover"
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
              className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={formData.full_name}
            onChange={(v) => setFormData({ ...formData, full_name: v })} />

          <Select label="Blood Group" value={formData.blood_group}
            options={bloodGroups}
            onChange={(v) =>
              setFormData({ ...formData, blood_group: v })
            } />

          <Input label="Location" icon={<MapPin className="w-5 h-5 text-gray-400" />}
            value={formData.location_address}
            onChange={(v) =>
              setFormData({ ...formData, location_address: v })
            } />

          <Input label="Phone Number"
            value={formData.phone_number}
            onChange={(v) =>
              setFormData({ ...formData, phone_number: v })
            } />

          <DateInput label="Last Donated On"
            value={formData.last_donation_date}
            onChange={(v) =>
              setFormData({ ...formData, last_donation_date: v })
            } />

          <Input label="Emergency Contact Name"
            value={formData.emergency_contact_name}
            onChange={(v) =>
              setFormData({ ...formData, emergency_contact_name: v })
            } />

          <Input label="Emergency Contact Phone"
            value={formData.emergency_contact_phone}
            onChange={(v) =>
              setFormData({ ...formData, emergency_contact_phone: v })
            } />

          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h3>

            <Toggle label="Blood requests near me"
              checked={formData.notify_requests}
              onChange={(v) =>
                setFormData({ ...formData, notify_requests: v })
              } />

            <Toggle label="Donation reminders"
              checked={formData.notify_reminders}
              onChange={(v) =>
                setFormData({ ...formData, notify_reminders: v })
              } />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 border py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ======================
   HELPER COMPONENTS
====================== */
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

const Input = ({ label, value, onChange, icon }: InputProps) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg"
      />
      {icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      )}
    </div>
  </div>
);

interface SelectProps {
  label: string;
  value: BloodGroup;
  options: BloodGroup[];
  onChange: (value: BloodGroup) => void;
}

const Select = ({ label, value, options, onChange }: SelectProps) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BloodGroup)}
      className="w-full px-4 py-3 border rounded-lg"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const DateInput = ({ label, value, onChange }: DateInputProps) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border rounded-lg"
    />
  </div>
);

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const Toggle = ({ label, checked, onChange }: ToggleProps) => (
  <label className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);
