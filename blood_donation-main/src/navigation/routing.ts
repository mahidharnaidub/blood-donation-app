import { UserRole } from '../types/multiRole';

// ========================================
// ROLE-BASED ROUTING CONFIG
// ========================================

export interface RouteConfig {
  path: string;
  component: string;
  roles: UserRole[];
  title: string;
  icon?: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export const ROUTES: Record<string, RouteConfig> = {
  // Public routes
  home: {
    path: '/',
    component: 'Home',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Home',
    requiresAuth: true
  },
  
  // User/Donor routes
  profile: {
    path: '/profile',
    component: 'Profile',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Profile',
    requiresAuth: true
  },
  editProfile: {
    path: '/profile/edit',
    component: 'EditProfile',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Edit Profile',
    requiresAuth: true
  },
  donorSearch: {
    path: '/donors',
    component: 'DonorSearch',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Find Donors',
    requiresAuth: true
  },
  hospitals: {
    path: '/hospitals',
    component: 'BloodBanks',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Hospitals',
    requiresAuth: true
  },
  
  // Donation routes
  donations: {
    path: '/donations',
    component: 'Donations',
    roles: ['user', 'admin'],
    title: 'Donations',
    requiresAuth: true
  },
  donationHistory: {
    path: '/donations/history',
    component: 'DonationHistory',
    roles: ['user', 'admin'],
    title: 'Donation History',
    requiresAuth: true
  },
  
  // Hospital routes
  hospitalDashboard: {
    path: '/hospital/dashboard',
    component: 'HospitalDashboard',
    roles: ['hospital', 'admin'],
    title: 'Dashboard',
    requiresAuth: true
  },
  hospitalRequests: {
    path: '/hospital/requests',
    component: 'HospitalRequests',
    roles: ['hospital', 'admin'],
    title: 'Blood Requests',
    requiresAuth: true
  },
  hospitalSubscription: {
    path: '/hospital/subscription',
    component: 'HospitalSubscription',
    roles: ['hospital', 'admin'],
    title: 'Subscription',
    requiresAuth: true
  },
  
  // Agent routes
  agentDashboard: {
    path: '/agent/dashboard',
    component: 'AgentDashboard',
    roles: ['agent', 'admin'],
    title: 'Dashboard',
    requiresAuth: true
  },
  agentReferrals: {
    path: '/agent/referrals',
    component: 'AgentReferrals',
    roles: ['agent', 'admin'],
    title: 'Referrals',
    requiresAuth: true
  },
  agentCommissions: {
    path: '/agent/commissions',
    component: 'AgentCommissions',
    roles: ['agent', 'admin'],
    title: 'Commissions',
    requiresAuth: true
  },
  agentEarnings: {
    path: '/agent/earnings',
    component: 'AgentEarnings',
    roles: ['agent', 'admin'],
    title: 'Earnings',
    requiresAuth: true
  },
  
  // Admin routes
  adminDashboard: {
    path: '/admin/dashboard',
    component: 'AdminDashboard',
    roles: ['admin'],
    title: 'Admin Dashboard',
    requiresAuth: true,
    adminOnly: true
  },
  adminUsers: {
    path: '/admin/users',
    component: 'AdminUsers',
    roles: ['admin'],
    title: 'Users',
    requiresAuth: true,
    adminOnly: true
  },
  adminHospitals: {
    path: '/admin/hospitals',
    component: 'AdminHospitals',
    roles: ['admin'],
    title: 'Hospitals',
    requiresAuth: true,
    adminOnly: true
  },
  adminAgents: {
    path: '/admin/agents',
    component: 'AdminAgents',
    roles: ['admin'],
    title: 'Agents',
    requiresAuth: true,
    adminOnly: true
  },
  adminDonations: {
    path: '/admin/donations',
    component: 'AdminDonations',
    roles: ['admin'],
    title: 'Donations',
    requiresAuth: true,
    adminOnly: true
  },
  adminCommissions: {
    path: '/admin/commissions',
    component: 'AdminCommissions',
    roles: ['admin'],
    title: 'Commissions',
    requiresAuth: true,
    adminOnly: true
  },
  adminAnalytics: {
    path: '/admin/analytics',
    component: 'AdminAnalytics',
    roles: ['admin'],
    title: 'Analytics',
    requiresAuth: true,
    adminOnly: true
  },
  adminSettings: {
    path: '/admin/settings',
    component: 'AdminSettings',
    roles: ['admin'],
    title: 'Settings',
    requiresAuth: true,
    adminOnly: true
  },
  
  // Common routes
  messages: {
    path: '/messages',
    component: 'Messages',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Messages',
    requiresAuth: true
  },
  settings: {
    path: '/settings',
    component: 'Settings',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Settings',
    requiresAuth: true
  },
  
  // Auth routes
  login: {
    path: '/auth/login',
    component: 'Login',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Login',
    requiresAuth: false
  },
  signup: {
    path: '/auth/signup',
    component: 'Signup',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Signup',
    requiresAuth: false
  },
  resetPassword: {
    path: '/auth/reset-password',
    component: 'ResetPassword',
    roles: ['user', 'hospital', 'agent', 'admin'],
    title: 'Reset Password',
    requiresAuth: false
  }
};

// ========================================
// ROLE-BASED NAVIGATION CONFIG
// ========================================

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  badge?: string;
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: 'Home',
    path: '/',
    roles: ['user', 'hospital', 'agent', 'admin']
  },
  {
    key: 'donors',
    label: 'Donors',
    icon: 'Users',
    path: '/donors',
    roles: ['user', 'hospital', 'agent', 'admin']
  },
  {
    key: 'hospitals',
    label: 'Hospitals',
    icon: 'Building',
    path: '/hospitals',
    roles: ['user', 'hospital', 'agent', 'admin']
  },
  {
    key: 'donations',
    label: 'Donate',
    icon: 'Heart',
    path: '/donations',
    roles: ['user', 'admin']
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: 'MessageCircle',
    path: '/messages',
    roles: ['user', 'hospital', 'agent', 'admin']
  }
];

export const ROLE_BASED_NAV: Record<UserRole, NavItem[]> = {
  user: [
    {
      key: 'home',
      label: 'Home',
      icon: 'Home',
      path: '/',
      roles: ['user']
    },
    {
      key: 'donors',
      label: 'Find Donors',
      icon: 'Users',
      path: '/donors',
      roles: ['user']
    },
    {
      key: 'hospitals',
      label: 'Hospitals',
      icon: 'Building',
      path: '/hospitals',
      roles: ['user']
    },
    {
      key: 'donations',
      label: 'Donate',
      icon: 'Heart',
      path: '/donations',
      roles: ['user']
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: 'MessageCircle',
      path: '/messages',
      roles: ['user']
    }
  ],
  
  hospital: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      path: '/hospital/dashboard',
      roles: ['hospital']
    },
    {
      key: 'requests',
      label: 'Blood Requests',
      icon: 'FileText',
      path: '/hospital/requests',
      roles: ['hospital']
    },
    {
      key: 'donors',
      label: 'Find Donors',
      icon: 'Users',
      path: '/donors',
      roles: ['hospital']
    },
    {
      key: 'subscription',
      label: 'Subscription',
      icon: 'CreditCard',
      path: '/hospital/subscription',
      roles: ['hospital']
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: 'MessageCircle',
      path: '/messages',
      roles: ['hospital']
    }
  ],
  
  agent: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      path: '/agent/dashboard',
      roles: ['agent']
    },
    {
      key: 'referrals',
      label: 'Referrals',
      icon: 'UserPlus',
      path: '/agent/referrals',
      roles: ['agent']
    },
    {
      key: 'commissions',
      label: 'Commissions',
      icon: 'TrendingUp',
      path: '/agent/commissions',
      roles: ['agent']
    },
    {
      key: 'earnings',
      label: 'Earnings',
      icon: 'IndianRupee',
      path: '/agent/earnings',
      roles: ['agent']
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: 'MessageCircle',
      path: '/messages',
      roles: ['agent']
    }
  ],
  
  admin: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      path: '/admin/dashboard',
      roles: ['admin']
    },
    {
      key: 'users',
      label: 'Users',
      icon: 'Users',
      path: '/admin/users',
      roles: ['admin']
    },
    {
      key: 'hospitals',
      label: 'Hospitals',
      icon: 'Building',
      path: '/admin/hospitals',
      roles: ['admin']
    },
    {
      key: 'agents',
      label: 'Agents',
      icon: 'UserCheck',
      path: '/admin/agents',
      roles: ['admin']
    },
    {
      key: 'donations',
      label: 'Donations',
      icon: 'Heart',
      path: '/admin/donations',
      roles: ['admin']
    },
    {
      key: 'commissions',
      label: 'Commissions',
      icon: 'TrendingUp',
      path: '/admin/commissions',
      roles: ['admin']
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'BarChart',
      path: '/admin/analytics',
      roles: ['admin']
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'Settings',
      path: '/admin/settings',
      roles: ['admin']
    }
  ]
};

// ========================================
// ROUTE GUARDS & PERMISSIONS
// ========================================

export class RouteGuard {
  static canAccess(route: RouteConfig, userRole?: UserRole, isAuthenticated?: boolean): boolean {
    // Check authentication requirement
    if (route.requiresAuth && !isAuthenticated) {
      return false;
    }
    
    // Check admin-only routes
    if (route.adminOnly && userRole !== 'admin') {
      return false;
    }
    
    // Check role-based access
    if (userRole && !route.roles.includes(userRole)) {
      return false;
    }
    
    return true;
  }
  
  static getRedirectPath(userRole?: UserRole, isAuthenticated?: boolean): string {
    if (!isAuthenticated) {
      return '/auth/login';
    }
    
    if (!userRole) {
      return '/auth/login';
    }
    
    // Role-based default routes
    switch (userRole) {
      case 'hospital':
        return '/hospital/dashboard';
      case 'agent':
        return '/agent/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'user':
      default:
        return '/';
    }
  }
  
  static getAccessibleRoutes(userRole?: UserRole): RouteConfig[] {
    if (!userRole) return [];
    
    return Object.values(ROUTES).filter(route => 
      route.roles.includes(userRole)
    );
  }
  
  static getNavigationItems(userRole?: UserRole): NavItem[] {
    if (!userRole) return [];
    
    return ROLE_BASED_NAV[userRole] || [];
  }
}

// ========================================
// ROUTE HELPERS
// ========================================

export const getRouteByKey = (key: string): RouteConfig | undefined => {
  return ROUTES[key];
};

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return Object.values(ROUTES).find(route => route.path === path);
};

export const isRouteAccessible = (routeKey: string, userRole?: UserRole, isAuthenticated?: boolean): boolean => {
  const route = getRouteByKey(routeKey);
  if (!route) return false;
  
  return RouteGuard.canAccess(route, userRole, isAuthenticated);
};

// ========================================
// BREADCRUMB CONFIG
// ========================================

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export const getBreadcrumbs = (path: string, userRole?: UserRole): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add home
  breadcrumbs.push({
    label: 'Home',
    path: '/',
    icon: 'Home'
  });
  
  // Add role-specific base
  if (userRole && userRole !== 'user') {
    const basePath = RouteGuard.getRedirectPath(userRole, true);
    breadcrumbs.push({
      label: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      path: basePath
    });
  }
  
  // Add current page
  const route = getRouteByPath(path);
  if (route && route.title !== 'Home') {
    breadcrumbs.push({
      label: route.title,
      path: path
    });
  }
  
  return breadcrumbs;
};
