/*
  # Trainer App Comprehensive Schema

  ## Overview
  Creates all tables needed for the trainer-focused app including profiles, availability,
  clients, sessions, messages, payments, and analytics.

  ## New Tables

  ### trainer_profiles
  Extended trainer data: bio, specialties, certifications, pricing, social links

  ### availability_slots
  Weekly recurring availability blocks per trainer (day + time range)

  ### bookings
  Session bookings linking clients to trainers with status tracking

  ### sessions
  Actual training sessions tied to bookings, with notes and ratings

  ### clients
  Trainer-client relationships with status and metadata

  ### messages
  Direct messages between trainers and clients

  ### conversations
  Message thread containers linking trainer + client

  ### payments
  Payment records for sessions (amount, status, payout info)

  ### trainer_notes
  Private notes trainers keep on clients

  ## Security
  - RLS enabled on all tables
  - All data scoped to authenticated user (trainer or client)
*/

-- Trainer profiles (extends Clerk user data)
CREATE TABLE IF NOT EXISTS trainer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  specialties text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  price_per_hour numeric(10,2) DEFAULT 0,
  intro_video_url text DEFAULT '',
  instagram_url text DEFAULT '',
  website_url text DEFAULT '',
  years_experience integer DEFAULT 0,
  location text DEFAULT '',
  is_accepting_clients boolean DEFAULT true,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  total_earnings numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can read own profile"
  ON trainer_profiles FOR SELECT
  TO authenticated
  USING (clerk_user_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can insert own profile"
  ON trainer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can update own profile"
  ON trainer_profiles FOR UPDATE
  TO authenticated
  USING (clerk_user_id = auth.jwt()->>'sub')
  WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

CREATE POLICY "Anyone can view trainer profiles"
  ON trainer_profiles FOR SELECT
  TO anon
  USING (true);

-- Availability slots (weekly recurring schedule)
CREATE TABLE IF NOT EXISTS availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_clerk_id text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time text NOT NULL,
  end_time text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can manage own availability"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can insert own availability"
  ON availability_slots FOR INSERT
  TO authenticated
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can update own availability"
  ON availability_slots FOR UPDATE
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub')
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can delete own availability"
  ON availability_slots FOR DELETE
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Clients can view trainer availability"
  ON availability_slots FOR SELECT
  TO anon
  USING (is_active = true);

-- Client-trainer relationships
CREATE TABLE IF NOT EXISTS trainer_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_clerk_id text NOT NULL,
  client_clerk_id text NOT NULL,
  client_name text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  client_avatar_url text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  goal text DEFAULT '',
  notes text DEFAULT '',
  total_sessions integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  last_session_at timestamptz,
  UNIQUE(trainer_clerk_id, client_clerk_id)
);

ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can view own clients"
  ON trainer_clients FOR SELECT
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can insert clients"
  ON trainer_clients FOR INSERT
  TO authenticated
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can update own clients"
  ON trainer_clients FOR UPDATE
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub')
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_clerk_id text NOT NULL,
  client_clerk_id text NOT NULL,
  client_name text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'confirmed', 'completed', 'cancelled', 'no_show')),
  session_type text NOT NULL DEFAULT 'virtual' CHECK (session_type IN ('virtual', 'in_person')),
  price numeric(10,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  meeting_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Client can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (client_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can insert bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub')
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

-- Conversations (message threads)
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_clerk_id text NOT NULL,
  client_clerk_id text NOT NULL,
  client_name text NOT NULL DEFAULT '',
  client_avatar_url text DEFAULT '',
  last_message text DEFAULT '',
  last_message_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(trainer_clerk_id, client_clerk_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub')
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_clerk_id text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.trainer_clerk_id = auth.jwt()->>'sub' OR c.client_clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Participants can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_clerk_id = auth.jwt()->>'sub' AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.trainer_clerk_id = auth.jwt()->>'sub' OR c.client_clerk_id = auth.jwt()->>'sub')
    )
  );

-- Payments / Earnings
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  trainer_clerk_id text NOT NULL,
  client_clerk_id text NOT NULL,
  client_name text NOT NULL DEFAULT '',
  amount numeric(10,2) NOT NULL DEFAULT 0,
  platform_fee numeric(10,2) NOT NULL DEFAULT 0,
  net_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  payment_method text DEFAULT 'card',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

-- Session notes (private trainer notes per client)
CREATE TABLE IF NOT EXISTS session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_clerk_id text NOT NULL,
  client_clerk_id text NOT NULL,
  booking_id uuid REFERENCES bookings(id),
  content text NOT NULL DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainer can manage own session notes"
  ON session_notes FOR SELECT
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can insert session notes"
  ON session_notes FOR INSERT
  TO authenticated
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Trainer can update own session notes"
  ON session_notes FOR UPDATE
  TO authenticated
  USING (trainer_clerk_id = auth.jwt()->>'sub')
  WITH CHECK (trainer_clerk_id = auth.jwt()->>'sub');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_trainer ON availability_slots(trainer_clerk_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trainer ON bookings(trainer_clerk_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON trainer_clients(trainer_clerk_id);
CREATE INDEX IF NOT EXISTS idx_conversations_trainer ON conversations(trainer_clerk_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_payments_trainer ON payments(trainer_clerk_id);
