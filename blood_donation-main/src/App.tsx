import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { supabase } from './lib/supabase';

import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { RoleBasedSignup } from './components/Auth/RoleBasedSignup';
import ResetPassword from './components/Auth/ResetPassword';

import { Home } from './components/Home/Home';
import { Messages } from './components/Messages/Messages';
import { Profile } from './components/Profile/Profile';
import { EditProfile } from './components/Profile/EditProfile';
import { BloodBanks } from './components/BloodBanks/BloodBanks';
import { DonorSearch } from './components/DonorSearch/DonorSearch';
import { Settings } from './components/Settings/Settings';
import { Donations } from './components/Donations/Donations';
import { RoleBasedNav } from './components/Navigation/RoleBasedNav';
import { ToastProvider } from './components/Toast/Toast';

// Role-specific dashboards
import { HospitalDashboard } from './components/Hospital/HospitalDashboard';
import { AgentDashboard } from './components/Agent/AgentDashboard';
import { AdminDashboardNew } from './components/Admin/AdminDashboardNew';
import { Hospitals } from './components/Hospitals/Hospitals';

import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';

type Screen = 'home' | 'messages' | 'profile' | 'banks' | 'hospitals' | 'editProfile' | 'donorSearch' | 'donors' | 'settings' | 'donations' | 
  'hospitalDashboard' | 'hospitalRequests' | 'hospitalSubscription' |
  'agentDashboard' | 'agentReferrals' | 'agentCommissions' | 'agentEarnings' |
  'adminDashboard' | 'adminUsers' | 'adminHospitals' | 'adminAgents' | 'adminDonations' | 'adminCommissions' | 'adminAnalytics' | 'adminSettings';
type AuthScreen = 'login' | 'signup' | 'roleSignup' | 'reset' | null;

export default function App() {
  const { user, profile } = useAuth();

  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const prevUserRef = useRef(user);

  /* 🔐 Close auth screens after login */
  useEffect(() => {
    if (user && authScreen !== null) {
      setAuthScreen(null);
      if (!profile?.is_admin) {
        setActiveScreen('home');
      }
    }
  }, [user, profile, authScreen]);

  /* 🔓 Reset app state on logout */
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    if (prevUser && !user) {
      setActiveScreen('home');
      setAuthScreen(null);
    }
  }, [user]);

  /* 📨 Load unread messages */
  useEffect(() => {
    if (user && profile) {
      const loadUnreadMessages = async () => {
        try {
          const { data, error } = await supabase
            .from('requests')
            .select('id')
            .eq('receiver_id', profile.id)
            .eq('status', 'pending');

          // Handle missing table gracefully
          if (error?.code === 'PGRST116') {
            console.log('requests table not found, setting unread to 0');
            setUnreadMessages(0);
          } else if (error) {
            console.error('Error loading unread messages:', error);
            setUnreadMessages(0);
          } else {
            setUnreadMessages(data?.length || 0);
          }
        } catch (err) {
          console.error('Unexpected error:', err);
          setUnreadMessages(0);
        }
      };

      loadUnreadMessages();
    } else {
      setUnreadMessages(0);
    }
  }, [user, profile]);

  /* 🔑 Password reset route */
  if (window.location.hash.includes('reset-password')) {
    return <ResetPassword />;
  }

  const renderScreen = () => {
    // Auth screens
    if (authScreen === 'login') {
      return <Login onShowSignup={() => setAuthScreen('roleSignup')} />;
    }
    if (authScreen === 'signup') {
      return <Signup onDone={() => setAuthScreen(null)} onShowLogin={() => setAuthScreen('login')} />;
    }
    if (authScreen === 'roleSignup') {
      return <RoleBasedSignup onShowLogin={() => setAuthScreen('login')} onDone={() => setAuthScreen(null)} />;
    }
    if (authScreen === 'reset') {
      return <ResetPassword />;
    }

    // Main app screens
    if (!user) {
      return <Login onShowSignup={() => setAuthScreen('roleSignup')} />;
    }

    // Role-based routing
    const userRole = profile?.role;

    // Admin screens
    if (userRole === 'admin') {
      switch (activeScreen) {
        case 'adminDashboard':
          return <AdminDashboardNew />;
        case 'adminUsers':
          return <AdminLayout><AdminDashboard /></AdminLayout>;
        case 'profile':
          return (
            <Profile 
              onEdit={() => setActiveScreen('editProfile')} 
              onRequireAuth={() => setAuthScreen('login')}
              onFindDonors={() => setActiveScreen('donorSearch')}
              onSettings={() => setActiveScreen('settings')}
            />
          );
        case 'editProfile':
          return <EditProfile onBack={() => setActiveScreen('profile')} />;
        case 'donorSearch':
          return <DonorSearch onBack={() => setActiveScreen('adminDashboard')} />;
        case 'settings':
          return <Settings onBack={() => setActiveScreen('profile')} />;
        default:
          return <AdminDashboardNew />;
      }
    }

    // Hospital screens
    if (userRole === 'hospital') {
      switch (activeScreen) {
        case 'hospitalDashboard':
          return <HospitalDashboard />;
        case 'hospitalRequests':
          return <div className="p-6"><h2 className="text-xl font-bold">Blood Requests</h2><p className="text-gray-600">Manage blood requests</p></div>;
        case 'hospitalSubscription':
          return <div className="p-6"><h2 className="text-xl font-bold">Subscription</h2><p className="text-gray-600">Manage subscription</p></div>;
        case 'donors':
          return <DonorSearch onBack={() => setActiveScreen('hospitalDashboard')} />;
        case 'profile':
          return (
            <Profile 
              onEdit={() => setActiveScreen('editProfile')} 
              onRequireAuth={() => setAuthScreen('login')}
              onFindDonors={() => setActiveScreen('donorSearch')}
              onSettings={() => setActiveScreen('settings')}
            />
          );
        case 'editProfile':
          return <EditProfile onBack={() => setActiveScreen('profile')} />;
        case 'messages':
          return <Messages onRequireAuth={() => setAuthScreen('login')} />;
        default:
          return <HospitalDashboard />;
      }
    }

    // Agent screens
    if (userRole === 'agent') {
      switch (activeScreen) {
        case 'agentDashboard':
          return <AgentDashboard />;
        case 'agentReferrals':
          return <div className="p-6"><h2 className="text-xl font-bold">Referrals</h2><p className="text-gray-600">Track your referrals</p></div>;
        case 'agentCommissions':
          return <div className="p-6"><h2 className="text-xl font-bold">Commissions</h2><p className="text-gray-600">View commissions</p></div>;
        case 'agentEarnings':
          return <div className="p-6"><h2 className="text-xl font-bold">Earnings</h2><p className="text-gray-600">Track earnings</p></div>;
        case 'profile':
          return (
            <Profile 
              onEdit={() => setActiveScreen('editProfile')} 
              onRequireAuth={() => setAuthScreen('login')}
              onFindDonors={() => setActiveScreen('donorSearch')}
              onSettings={() => setActiveScreen('settings')}
            />
          );
        case 'editProfile':
          return <EditProfile onBack={() => setActiveScreen('profile')} />;
        case 'messages':
          return <Messages onRequireAuth={() => setAuthScreen('login')} />;
        default:
          return <AgentDashboard />;
      }
    }

    // Regular user screens
    switch (activeScreen) {
      case 'home':
        return <Home onRequireAuth={() => setAuthScreen('login')} />;
      case 'messages':
        return <Messages onRequireAuth={() => setAuthScreen('login')} />;
      case 'profile':
        return (
          <Profile 
            onEdit={() => setActiveScreen('editProfile')} 
            onRequireAuth={() => setAuthScreen('login')}
            onFindDonors={() => setActiveScreen('donorSearch')}
            onSettings={() => setActiveScreen('settings')}
          />
        );
      case 'editProfile':
        return <EditProfile onBack={() => setActiveScreen('profile')} />;
      case 'banks':
        return <BloodBanks />;
      case 'hospitals':
        return <Hospitals />;
      case 'donorSearch':
        return <DonorSearch onBack={() => setActiveScreen('home')} />;
      case 'donations':
        return <Donations />;
      case 'settings':
        return <Settings onBack={() => setActiveScreen('profile')} />;
      default:
        return <Home onRequireAuth={() => setAuthScreen('login')} />;
    }
  };

  return (
    <LocationProvider>
      <ToastProvider>
        <>
          {/* ✨ Animated screen transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>

          {/* 🔻 Role-based navigation - only show when authenticated and not on auth screens */}
          {user && profile && !authScreen && (
            <RoleBasedNav
              activeTab={activeScreen}
              onTabChange={(tab: string) => setActiveScreen(tab as Screen)}
              unreadMessages={unreadMessages}
              onRequireAuth={() => setAuthScreen('login')}
            />
          )}
        </>
      </ToastProvider>
    </LocationProvider>
  );
}
