export interface TrainerProfileRow {
  id: string;
  clerk_user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  specialties: string[];
  certifications: string[];
  languages: string[];
  price_per_hour: number;
  intro_video_url: string;
  instagram_url: string;
  website_url: string;
  years_experience: number;
  location: string;
  is_accepting_clients: boolean;
  rating: number;
  review_count: number;
  total_sessions: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlotRow {
  id: string;
  trainer_clerk_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface BookingRow {
  id: string;
  trainer_clerk_id: string;
  client_clerk_id: string;
  client_name: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  session_type: 'virtual' | 'in_person';
  price: number;
  notes: string;
  meeting_url: string;
  created_at: string;
  updated_at: string;
}

export interface TrainerClientRow {
  id: string;
  trainer_clerk_id: string;
  client_clerk_id: string;
  client_name: string;
  client_email: string;
  client_avatar_url: string;
  status: 'active' | 'inactive' | 'pending';
  goal: string;
  notes: string;
  total_sessions: number;
  joined_at: string;
  last_session_at: string | null;
}

export interface ConversationRow {
  id: string;
  trainer_clerk_id: string;
  client_clerk_id: string;
  client_name: string;
  client_avatar_url: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_clerk_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  booking_id: string;
  trainer_clerk_id: string;
  client_clerk_id: string;
  client_name: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  payment_method: string;
  paid_at: string | null;
  created_at: string;
}

export interface SessionNoteRow {
  id: string;
  trainer_clerk_id: string;
  client_clerk_id: string;
  booking_id: string | null;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}
