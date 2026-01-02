import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Bell,
  ShieldCheck,
  HelpCircle,
  Moon,
  Globe,
  Lock,
  CreditCard,
  FileText,
  LogOut,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { profile, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    bloodRequests: true,
    donationReminders: true,
    availabilityAlerts: true,
    marketingEmails: false,
    pushNotifications: true
  });
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'english',
    visibility: 'public'
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={onBack}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* PROFILE SECTION */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Profile</h2>
          </div>
          <div className="p-4 space-y-4">
            <button className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">
                    {profile?.full_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {profile?.blood_group || 'Not set'} • {profile?.phone_number || 'Not set'}
                  </p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Notifications</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Blood Requests</p>
                <p className="text-sm text-gray-500">Get notified about nearby blood requests</p>
              </div>
              <button
                onClick={() => handleNotificationChange('bloodRequests', !notifications.bloodRequests)}
                className={`w-12 h-6 rounded-full transition ${
                  notifications.bloodRequests ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                  notifications.bloodRequests ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Donation Reminders</p>
                <p className="text-sm text-gray-500">Remind me when I can donate again</p>
              </div>
              <button
                onClick={() => handleNotificationChange('donationReminders', !notifications.donationReminders)}
                className={`w-12 h-6 rounded-full transition ${
                  notifications.donationReminders ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                  notifications.donationReminders ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Availability Alerts</p>
                <p className="text-sm text-gray-500">Auto-off availability after donations</p>
              </div>
              <button
                onClick={() => handleNotificationChange('availabilityAlerts', !notifications.availabilityAlerts)}
                className={`w-12 h-6 rounded-full transition ${
                  notifications.availabilityAlerts ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                  notifications.availabilityAlerts ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Marketing Emails</p>
                <p className="text-sm text-gray-500">Updates and promotional content</p>
              </div>
              <button
                onClick={() => handleNotificationChange('marketingEmails', !notifications.marketingEmails)}
                className={`w-12 h-6 rounded-full transition ${
                  notifications.marketingEmails ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                  notifications.marketingEmails ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* PREFERENCES */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Preferences</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Dark Mode</p>
                <p className="text-sm text-gray-500">Easier on the eyes at night</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('darkMode', !preferences.darkMode)}
                className={`w-12 h-6 rounded-full transition ${
                  preferences.darkMode ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                  preferences.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Language</p>
                <p className="text-sm text-gray-500">Choose your preferred language</p>
              </div>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="english">English</option>
                <option value="hindi">हिंदी</option>
                <option value="spanish">Español</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Profile Visibility</p>
                <p className="text-sm text-gray-500">Control who can see your profile</p>
              </div>
              <select
                value={preferences.visibility}
                onChange={(e) => handlePreferenceChange('visibility', e.target.value)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="public">Public</option>
                <option value="verified">Verified Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* SUPPORT */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Support</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-800">Emergency Helpline</span>
              </div>
              <span className="text-sm text-red-500 font-medium">1099</span>
            </button>

            <button className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-800">Email Support</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>

            <button className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-800">Live Chat</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>

            <button className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-800">Terms & Privacy</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* ABOUT */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">About</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Version</span>
              <span className="text-gray-800 font-medium">2.1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Build</span>
              <span className="text-gray-800 font-medium">2024.01.15</span>
            </div>
            <p className="text-sm text-gray-500 pt-2">
              Blood Connect is a platform connecting blood donors with those in need. 
              Your information is secure and only shared with verified medical facilities.
            </p>
          </div>
        </div>

        {/* SIGN OUT */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
