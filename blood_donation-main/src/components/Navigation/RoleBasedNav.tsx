import { UserRole } from '../../types/multiRole';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  Building, 
  Heart, 
  MessageCircle, 
  LayoutDashboard,
  UserPlus,
  TrendingUp,
  IndianRupee,
  UserCheck,
  Menu,
  Settings,
  LogOut
} from 'lucide-react';

interface RoleBasedNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadMessages?: number;
  onRequireAuth?: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: any;
  path: string;
  requiresAuth?: boolean;
  badge?: string;
}

export function RoleBasedNav({ activeTab, onTabChange, unreadMessages = 0, onRequireAuth }: RoleBasedNavProps) {
  const { profile } = useAuth();
  const userRole = profile?.role as UserRole;
  const isLoggedIn = !!profile;

  // Base navigation - ALWAYS visible for ALL roles
  const baseNavItems: NavItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: Home,
      path: '/'
    },
    {
      key: 'donorSearch',
      label: 'Find Donors',
      icon: Users,
      path: '/donorSearch'
    },
    {
      key: 'hospitals',
      label: 'Hospitals',
      icon: Building,
      path: '/hospitals'
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: Users,
      path: '/profile',
      requiresAuth: true
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      requiresAuth: true,
      badge: unreadMessages > 0 ? unreadMessages.toString() : undefined
    }
  ];

  // Role-specific additional items
  const getRoleSpecificItems = (): NavItem[] => {
    if (!userRole) return [];

    switch (userRole) {
      case 'hospital':
        return [
          {
            key: 'hospitalDashboard',
            label: 'Hospital',
            icon: LayoutDashboard,
            path: '/hospitalDashboard'
          },
          {
            key: 'hospitalRequests',
            label: 'Requests',
            icon: Users,
            path: '/hospitalRequests'
          },
          {
            key: 'hospitalSubscription',
            label: 'Subscription',
            icon: Heart,
            path: '/hospitalSubscription'
          }
        ];

      case 'agent':
        return [
          {
            key: 'agentDashboard',
            label: 'Agent',
            icon: LayoutDashboard,
            path: '/agentDashboard'
          },
          {
            key: 'agentReferrals',
            label: 'Referrals',
            icon: UserPlus,
            path: '/agentReferrals'
          },
          {
            key: 'agentCommissions',
            label: 'Commissions',
            icon: TrendingUp,
            path: '/agentCommissions'
          },
          {
            key: 'agentEarnings',
            label: 'Earnings',
            icon: IndianRupee,
            path: '/agentEarnings'
          }
        ];

      case 'admin':
        return [
          {
            key: 'adminDashboard',
            label: 'Admin',
            icon: LayoutDashboard,
            path: '/adminDashboard'
          },
          {
            key: 'adminUsers',
            label: 'Users',
            icon: Users,
            path: '/adminUsers'
          },
          {
            key: 'adminHospitals',
            label: 'Hospitals',
            icon: Building,
            path: '/adminHospitals'
          },
          {
            key: 'adminAgents',
            label: 'Agents',
            icon: UserCheck,
            path: '/adminAgents'
          },
          {
            key: 'adminDonations',
            label: 'Donations',
            icon: Heart,
            path: '/adminDonations'
          }
        ];

      default:
        return [];
    }
  };

  const roleSpecificItems = getRoleSpecificItems();
  
  // Combine base items with role-specific items
  const allNavItems = [...baseNavItems, ...roleSpecificItems];

  const handleTabChange = (item: NavItem) => {
    // Check if tab requires authentication
    if (item.requiresAuth && !isLoggedIn) {
      onRequireAuth?.();
      return;
    }
    
    onTabChange(item.key);
    // Use proper navigation - the parent will handle the state change
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center py-2">
          {allNavItems.map((item) => {
            const isActive = activeTab === item.key;
            const isLocked = item.requiresAuth && !isLoggedIn;
            
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item)}
                disabled={isLocked}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors relative ${
                  isLocked 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : isActive 
                      ? 'text-red-500' 
                      : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
