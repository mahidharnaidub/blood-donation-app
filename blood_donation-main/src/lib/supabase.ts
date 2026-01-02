import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbznadzdtocylurckgtd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FM8fLN_85fnTDkIJCVo05Q_xV7qUIXo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* =====================
   ENUMS
===================== */
export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

/* =====================
   PROFILES (MATCHES DB)
===================== */
export interface Profile {
  id: string;
  full_name: string | null;
  blood_group: BloodGroup | null;

  phone_number: string | null;
  date_of_birth: string | null;

  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;

  is_available: boolean;
  is_admin: boolean;

  profile_photo_url?: string | null;
  medical_notes?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;

  created_at: string;
  updated_at: string;
}

/* =====================
   BLOOD REQUESTS
===================== */
export interface BloodRequest {
  id: string;
  sender_id: string;
  receiver_id: string;

  blood_group_needed: BloodGroup;
  status: 'pending' | 'accepted' | 'declined' | 'completed';

  created_at: string;

  sender?: Profile;
  receiver?: Profile;
}

/* =====================
   MESSAGES
===================== */
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;

  sender?: Profile;
  receiver?: Profile;
}

/* =====================
   DONATION HISTORY
===================== */
export interface DonationHistory {
  id: string;
  user_id: string;
  donation_date: string;
  location: string;
  notes?: string | null;
  created_at: string;
}

/* =====================
   BLOOD BANKS
===================== */
export interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
  available_blood_types: BloodGroup[];
  created_at: string;
}
