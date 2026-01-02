// ========================================
// MULTI-ROLE PLATFORM TYPES
// ========================================

export type UserRole = 'user' | 'hospital' | 'agent' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  location_address: string | null;
  is_available: boolean | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  last_donation_date: string | null;
  profile_photo_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  
  // New role-based fields
  role: UserRole;
  referral_code?: string;
  referred_by?: string;
  wallet_balance: number;
  is_verified: boolean;
  latitude?: number;
  longitude?: number;
  subscription_status?: 'active' | 'inactive' | 'expired' | 'cancelled';
  subscription_expires_at?: string;
  commission_rate?: number;
  total_earnings?: number;
  hospital_services?: string[];
  hospital_license?: string;
}

export interface DonationCause {
  id: string;
  title: string;
  description?: string;
  category: 'child_support' | 'medical_support' | 'emergency_blood' | 'patient_assistance' | 'app_operations';
  target_amount?: number;
  raised_amount: number;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  user_id: string;
  cause_id?: string;
  amount: number;
  donation_type: 'one_time' | 'monthly';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  message?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  cause?: DonationCause;
  user?: Profile;
}

export interface RecurringDonation {
  id: string;
  user_id: string;
  cause_id?: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_billing_date: string;
  is_active: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  cause?: DonationCause;
  user?: Profile;
}

export interface Commission {
  id: string;
  agent_id: string;
  hospital_id: string;
  amount: number;
  commission_type: 'signup' | 'subscription' | 'renewal';
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  description?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  agent?: Profile;
  hospital?: Profile;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'hospital_basic' | 'hospital_premium' | 'agent_basic';
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  user?: Profile;
}

export interface HospitalRequest {
  id: string;
  hospital_id: string;
  patient_name: string;
  blood_group: string;
  units_needed: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  contact_number?: string;
  hospital_name?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  
  // Joined fields
  hospital?: Profile;
}

export interface Analytics {
  id: string;
  event_type: string;
  user_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ========================================
// EXTENDED PROFILE INTERFACES
// ========================================

export interface UserProfile extends Profile {
  role: 'user';
  donation_history: Donation[];
  recurring_donations: RecurringDonation[];
}

export interface HospitalProfile extends Profile {
  role: 'hospital';
  hospital_services: string[];
  hospital_license: string;
  subscription_status: 'active' | 'inactive' | 'expired' | 'cancelled';
  subscription_expires_at?: string;
  requests: HospitalRequest[];
}

export interface AgentProfile extends Profile {
  role: 'agent';
  referral_code: string;
  referred_by?: string;
  commission_rate: number;
  total_earnings: number;
  commissions: Commission[];
  hospitals_referred: Profile[];
}

export interface AdminProfile extends Profile {
  role: 'admin';
}

// ========================================
// FORM TYPES
// ========================================

export interface SignupForm {
  email: string;
  password: string;
  full_name: string;
  blood_group: string;
  phone_number: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  location_address: string;
  is_available: boolean;
  role: UserRole;
  referral_code?: string; // Optional, used when referred by agent
  
  // Hospital specific
  hospital_name?: string;
  hospital_license?: string;
  hospital_services?: string[];
}

export interface DonationForm {
  cause_id?: string;
  amount: number;
  donation_type: 'one_time' | 'monthly';
  message?: string;
  is_anonymous: boolean;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface HospitalRequestForm {
  patient_name: string;
  blood_group: string;
  units_needed: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  contact_number?: string;
  hospital_name?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

// ========================================
// DASHBOARD TYPES
// ========================================

export interface UserDashboard {
  profile: UserProfile;
  recent_donations: Donation[];
  active_recurring: RecurringDonation[];
  donation_stats: {
    total_donated: number;
    monthly_donations: number;
    causes_supported: number;
  };
}

export interface HospitalDashboard {
  profile: HospitalProfile;
  subscription: Subscription;
  requests: HospitalRequest[];
  analytics: {
    total_requests: number;
    fulfilled_requests: number;
    monthly_views: number;
    monthly_calls: number;
  };
}

export interface AgentDashboard {
  profile: AgentProfile;
  commissions: Commission[];
  earnings: {
    total_earned: number;
    pending_commissions: number;
    paid_commissions: number;
    hospitals_referred: number;
  };
  referral_stats: {
    referral_code: string;
    total_referrals: number;
    active_hospitals: number;
    conversion_rate: number;
  };
}

export interface AdminDashboard {
  platform_stats: {
    total_users: number;
    total_hospitals: number;
    total_agents: number;
    total_donations: number;
    monthly_revenue: number;
  };
  pending_approvals: {
    hospitals: number;
    commissions: number;
  };
  recent_activities: Analytics[];
  donation_causes: DonationCause[];
}

// ========================================
// LOCATION TYPES
// ========================================

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface SearchResult<T> {
  item: T;
  distance: number;
  distance_text: string;
}

export interface NearbyDonor extends SearchResult<Profile> {
  blood_group: string;
  is_available: boolean;
}

export interface NearbyHospital extends SearchResult<HospitalProfile> {
  subscription_active: boolean;
  services: string[];
}

// ========================================
// PAYMENT TYPES (MOCK)
// ========================================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'net_banking' | 'wallet';
  provider: string;
  last_four?: string;
  expiry?: string;
  is_default: boolean;
}

export interface PaymentResponse {
  success: boolean;
  transaction_id?: string;
  error?: string;
  mock?: boolean; // Indicates this is a mock payment
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'hospital_basic' | 'hospital_premium' | 'agent_basic';
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  is_popular?: boolean;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// ========================================
// FILTER & SEARCH TYPES
// ========================================

export interface DonorSearchFilters {
  blood_group?: string;
  location?: string;
  radius?: number;
  is_available?: boolean;
}

export interface HospitalSearchFilters {
  services?: string[];
  location?: string;
  radius?: number;
  subscription_active?: boolean;
}

export interface DonationFilters {
  category?: string;
  date_range?: {
    start: string;
    end: string;
  };
  amount_range?: {
    min: number;
    max: number;
  };
  payment_status?: string;
}
