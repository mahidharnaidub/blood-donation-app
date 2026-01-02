import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/* ======================
   TYPES
====================== */
type ProfileUpdates = {
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  blood_group?: string;
  is_available?: boolean;
  location_address?: string; // ✅ CORRECT COLUMN
  address?: string; // ✅ For frontend mapping
  last_donation_date?: string; // ✅ For last donation
};

type AuthContextType = {
  user: any | null;
  profile: any | null;
  saveProfile: (updates: ProfileUpdates) => Promise<void>;
  signOut: () => Promise<void>;
};

/* ======================
   CONTEXT
====================== */
const AuthContext = createContext<AuthContextType | null>(null);

/* ======================
   PROVIDER
====================== */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  /* ======================
     RESTORE SESSION
  ====================== */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        loadProfile(data.session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  /* ======================
     LOAD PROFILE
  ====================== */
  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // Retry once (auth trigger timing)
      setTimeout(async () => {
        const retry = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!retry.error && retry.data) {
          setProfile(retry.data);
        }
      }, 400);

      return;
    }

    if (data) {
      setProfile(data);
    }
  };

  /* ======================
     SAVE / UPDATE PROFILE
  ====================== */
  const saveProfile = async (updates: ProfileUpdates) => {
    console.log('🔥 saveProfile FUNCTION CALLED');
    console.log('🔥 User context:', user);
    
    if (!user) {
      console.error('❌ No user context available');
      return;
    }

    console.log('🔥 saveProfile called with:', updates);

    // Map address to location_address for database compatibility
    const dbUpdates = {
      ...updates,
      ...(updates.address && { location_address: updates.address }),
      address: undefined // Remove address field as it doesn't exist in DB
    };

    console.log('🔥 Database updates:', dbUpdates);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            ...dbUpdates
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('❌ Profile save failed:', error);
        throw error;
      }

      console.log('✅ Profile saved successfully to database, reloading...');
      // Reload profile after save to get updated data
      await loadProfile(user.id);
    } catch (err) {
      console.error('❌ saveProfile error:', err);
      throw err;
    }
  };

  /* ======================
     SIGN OUT
  ====================== */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, saveProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ======================
   HOOK
====================== */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
