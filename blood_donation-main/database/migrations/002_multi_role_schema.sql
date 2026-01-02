-- ========================================
-- MULTI-ROLE PLATFORM DATABASE SCHEMA
-- ========================================

-- 1. EXTEND PROFILES TABLE (ADD ROLE-BASED FIELDS)
-- ========================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'hospital', 'agent', 'admin')),
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired', 'cancelled')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS hospital_services TEXT[], -- For hospital role
ADD COLUMN IF NOT EXISTS hospital_license TEXT, -- For hospital role
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. DONATION CAUSES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS donation_causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('child_support', 'medical_support', 'emergency_blood', 'patient_assistance', 'app_operations')),
  target_amount DECIMAL(12,2),
  raised_amount DECIMAL(12,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DONATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  cause_id UUID REFERENCES donation_causes(id),
  amount DECIMAL(10,2) NOT NULL,
  donation_type TEXT NOT NULL CHECK (donation_type IN ('one_time', 'monthly')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT, -- 'razorpay', 'stripe', etc.
  transaction_id TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RECURRING DONATIONS (AUTO-PAY)
-- ========================================
CREATE TABLE IF NOT EXISTS recurring_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  cause_id UUID REFERENCES donation_causes(id),
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_billing_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMMISSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  hospital_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('signup', 'subscription', 'renewal')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SUBSCRIPTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('hospital_basic', 'hospital_premium', 'agent_basic')),
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. HOSPITAL REQUESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS hospital_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES profiles(id) NOT NULL,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units_needed INTEGER NOT NULL,
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  contact_number TEXT,
  hospital_name TEXT,
  location_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ANALYTICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_cause_id ON donations(cause_id);
CREATE INDEX IF NOT EXISTS idx_recurring_donations_user_id ON recurring_donations(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_hospital_id ON commissions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_requests_hospital_id ON hospital_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_requests_status ON hospital_requests(status);
CREATE INDEX IF NOT EXISTS idx_hospital_requests_location ON hospital_requests(latitude, longitude);

-- ========================================
-- RLS POLICIES (ROW LEVEL SECURITY)
-- ========================================

-- Profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Donations table
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all donations" ON donations FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can insert own donations" ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can insert donations" ON donations FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Recurring donations table
ALTER TABLE recurring_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recurring donations" ON recurring_donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all recurring donations" ON recurring_donations FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can insert own recurring donations" ON recurring_donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring donations" ON recurring_donations FOR UPDATE USING (auth.uid() = user_id);

-- Commissions table
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view own commissions" ON commissions FOR SELECT USING (auth.uid() = agent_id);
CREATE POLICY "Admins can view all commissions" ON commissions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage commissions" ON commissions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage subscriptions" ON subscriptions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Hospital requests table
ALTER TABLE hospital_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active requests" ON hospital_requests FOR SELECT USING (status = 'active');
CREATE POLICY "Hospitals can manage own requests" ON hospital_requests FOR ALL USING (auth.uid() = hospital_id);
CREATE POLICY "Admins can manage all requests" ON hospital_requests FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Donation causes table
ALTER TABLE donation_causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active causes" ON donation_causes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage causes" ON donation_causes FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- TRIGGERS AND FUNCTIONS
-- ========================================

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate referral code for agents
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'agent' AND NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating referral codes
CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_donations_updated_at BEFORE UPDATE ON recurring_donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospital_requests_updated_at BEFORE UPDATE ON hospital_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donation_causes_updated_at BEFORE UPDATE ON donation_causes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA (FOR DEVELOPMENT)
-- ========================================

-- Insert sample donation causes
INSERT INTO donation_causes (title, description, category, target_amount, raised_amount, is_featured) VALUES
('Emergency Blood Fund', 'Help us maintain blood supply for emergencies', 'emergency_blood', 500000.00, 125000.00, true),
('Child Medical Support', 'Support children needing critical medical care', 'child_support', 1000000.00, 450000.00, true),
('Poor Patient Assistance', 'Help underprivileged patients get medical treatment', 'patient_assistance', 750000.00, 200000.00, false),
('App Operations', 'Keep the platform running and reach more people', 'app_operations', 300000.00, 75000.00, false);

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- View for active hospitals with subscriptions
CREATE OR REPLACE VIEW active_hospitals AS
SELECT 
  p.*,
  s.expires_at as subscription_expires,
  s.status as subscription_status
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
WHERE p.role = 'hospital' AND (s.status = 'active' OR s.status IS NULL);

-- View for agent earnings
CREATE OR REPLACE VIEW agent_earnings AS
SELECT 
  a.id as agent_id,
  a.full_name as agent_name,
  a.referral_code,
  COALESCE(SUM(c.amount), 0) as total_commissions,
  COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END), 0) as paid_commissions,
  COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount ELSE 0 END), 0) as pending_commissions,
  COUNT(DISTINCT c.hospital_id) as hospitals_referred
FROM profiles a
LEFT JOIN commissions c ON a.id = c.agent_id
WHERE a.role = 'agent'
GROUP BY a.id, a.full_name, a.referral_code;

-- View for donation statistics
CREATE OR REPLACE VIEW donation_stats AS
SELECT 
  dc.id as cause_id,
  dc.title,
  dc.category,
  dc.target_amount,
  COALESCE(SUM(d.amount), 0) as total_donated,
  COUNT(DISTINCT d.user_id) as donor_count,
  dc.raised_amount
FROM donation_causes dc
LEFT JOIN donations d ON dc.id = d.cause_id AND d.payment_status = 'completed'
WHERE dc.is_active = true
GROUP BY dc.id, dc.title, dc.category, dc.target_amount, dc.raised_amount;
