import { motion } from 'framer-motion';
import {
  Home as HomeIcon,
  MessageCircle,
  User,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BottomNavProps {
  activeTab: 'home' | 'messages' | 'banks' | 'profile';
  onTabChange: (tab: 'home' | 'messages' | 'banks' | 'profile') => void;
  unreadMessages?: number; // 👈 optional
}

/* Mobile haptic */
const haptic = () => navigator.vibrate?.(10);

/* Avatar initials */
const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  const p = name.split(' ');
  return p.length > 1 ? p[0][0] + p[1][0] : p[0][0];
};

export function BottomNav({
  activeTab,
  onTabChange,
  unreadMessages = 0
}: BottomNavProps) {
  const { profile } = useAuth();

  const tabs = [
    { key: 'home', label: 'Home', icon: HomeIcon },
    { key: 'messages', label: 'Messages', icon: MessageCircle },
    { key: 'banks', label: 'Banks', icon: Building2 },
    { key: 'profile', label: 'Profile', icon: User }
  ] as const;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-3 pb-safe">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
        <div className="flex justify-around items-center h-16">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;

            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  haptic();
                  onTabChange(key);
                }}
                className="relative flex flex-col items-center justify-center px-4 py-2 rounded-xl"
              >
                {/* Active pill */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 bg-red-50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  />
                )}

                <motion.div
                  className="relative z-10 flex flex-col items-center"
                  animate={{
                    y: isActive ? -2 : 0,
                    scale: isActive ? 1.05 : 1
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* PROFILE AVATAR */}
                  {key === 'profile' && profile ? (
                    profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className={`w-6 h-6 rounded-full object-cover ${
                          isActive ? 'ring-2 ring-red-400' : ''
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                          ${isActive ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'}
                        `}
                      >
                        {getInitials(profile.full_name)}
                      </div>
                    )
                  ) : (
                    <div className="relative">
                      <Icon
                        className={`w-6 h-6 ${
                          isActive ? 'text-red-500' : 'text-gray-400'
                        }`}
                      />

                      {/* 🔴 UNREAD BADGE */}
                      {key === 'messages' && unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </div>
                  )}

                  <span
                    className={`text-[11px] font-medium mt-0.5 ${
                      isActive ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
