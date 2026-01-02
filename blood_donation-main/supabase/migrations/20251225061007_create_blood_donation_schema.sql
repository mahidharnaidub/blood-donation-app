/*
  # Blood Donation Application Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `blood_group` (text) - A+, A-, B+, B-, AB+, AB-, O+, O-
      - `location` (text) - City, State format
      - `latitude` (decimal) - For distance calculation
      - `longitude` (decimal) - For distance calculation
      - `phone_number` (text)
      - `last_donation_date` (date)
      - `is_donor` (boolean) - Whether user is available as donor
      - `is_recipient` (boolean) - Whether user is seeking blood
      - `photo_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `blood_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `blood_group_needed` (text)
      - `status` (text) - pending, accepted, declined, completed
      - `message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

    - `donation_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `donation_date` (date)
      - `location` (text) - Where donation occurred
      - `notes` (text)
      - `created_at` (timestamp)

    - `blood_banks`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `phone` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `operating_hours` (text)
      - `available_blood_types` (text[]) - Array of available blood types
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for users to read other donors' public profiles
    - Add policies for messaging and blood requests
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  location text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  phone_number text,
  last_donation_date date,
  is_donor boolean DEFAULT false,
  is_recipient boolean DEFAULT false,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blood_requests table
CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blood_group_needed text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create donation_history table
CREATE TABLE IF NOT EXISTS donation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  donation_date date NOT NULL,
  location text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create blood_banks table
CREATE TABLE IF NOT EXISTS blood_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  operating_hours text NOT NULL,
  available_blood_types text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_banks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all donor profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_donor = true OR auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Blood requests policies
CREATE POLICY "Users can view their own blood requests"
  ON blood_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create blood requests"
  ON blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update blood requests they received"
  ON blood_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Donation history policies
CREATE POLICY "Users can view own donation history"
  ON donation_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own donation history"
  ON donation_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own donation history"
  ON donation_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own donation history"
  ON donation_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Blood banks policies (public read access)
CREATE POLICY "Anyone can view blood banks"
  ON blood_banks FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_is_donor ON profiles(is_donor);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_sender ON blood_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_receiver ON blood_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_donation_history_user ON donation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_banks_location ON blood_banks(latitude, longitude);