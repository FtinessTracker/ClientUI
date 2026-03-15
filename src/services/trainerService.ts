import {
  TrainerProfileRow, AvailabilitySlotRow, BookingRow,
  TrainerClientRow, ConversationRow, MessageRow, PaymentRow,
} from '../types/trainer';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const MOCK_PROFILE: TrainerProfileRow = {
  id: 'profile-1',
  clerk_user_id: 'trainer',
  display_name: 'Alex Johnson',
  bio: 'Passionate fitness trainer with 7+ years helping clients achieve their goals. I believe in a holistic approach combining strength, cardio, and mindfulness for sustainable results.',
  avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
  specialties: ['Strength Training', 'HIIT', 'Nutrition', 'Weight Loss'],
  certifications: ['NASM-CPT', 'Precision Nutrition L1', 'CSCS'],
  languages: ['English', 'Spanish'],
  price_per_hour: 75,
  intro_video_url: '',
  instagram_url: 'https://instagram.com/alexjohnsonfit',
  website_url: 'https://alexjohnsonfit.com',
  years_experience: 7,
  location: 'New York, USA',
  is_accepting_clients: true,
  rating: 4.9,
  review_count: 87,
  total_sessions: 312,
  total_earnings: 24150,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

const MOCK_AVAILABILITY: AvailabilitySlotRow[] = [
  { id: 'av1', trainer_clerk_id: 'trainer', day_of_week: 1, start_time: '07:00', end_time: '09:00', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'av2', trainer_clerk_id: 'trainer', day_of_week: 1, start_time: '17:00', end_time: '19:00', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'av3', trainer_clerk_id: 'trainer', day_of_week: 2, start_time: '06:00', end_time: '08:00', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'av4', trainer_clerk_id: 'trainer', day_of_week: 3, start_time: '09:00', end_time: '12:00', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'av5', trainer_clerk_id: 'trainer', day_of_week: 4, start_time: '17:00', end_time: '20:00', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'av6', trainer_clerk_id: 'trainer', day_of_week: 6, start_time: '08:00', end_time: '12:00', is_active: true, created_at: '2025-01-01T00:00:00Z' },
];

const now = new Date();
const d = (offsetDays: number, hour: number) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + offsetDays);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString();
};

const MOCK_BOOKINGS: BookingRow[] = [
  { id: 'b1', trainer_clerk_id: 'trainer', client_clerk_id: 'u1', client_name: 'Emma Wilson', scheduled_at: d(1, 9), duration_minutes: 60, status: 'confirmed', session_type: 'virtual', price: 75, notes: '', meeting_url: '', created_at: d(-3, 10), updated_at: d(-3, 10) },
  { id: 'b2', trainer_clerk_id: 'trainer', client_clerk_id: 'u2', client_name: 'James Rodriguez', scheduled_at: d(2, 17), duration_minutes: 60, status: 'upcoming', session_type: 'in_person', price: 90, notes: '', meeting_url: '', created_at: d(-2, 10), updated_at: d(-2, 10) },
  { id: 'b3', trainer_clerk_id: 'trainer', client_clerk_id: 'u3', client_name: 'Sofia Chen', scheduled_at: d(3, 7), duration_minutes: 60, status: 'upcoming', session_type: 'virtual', price: 75, notes: 'Marathon prep - interval running', meeting_url: '', created_at: d(-1, 10), updated_at: d(-1, 10) },
  { id: 'b4', trainer_clerk_id: 'trainer', client_clerk_id: 'u6', client_name: 'David Kim', scheduled_at: d(0, 16), duration_minutes: 90, status: 'confirmed', session_type: 'in_person', price: 120, notes: 'Speed and agility drills', meeting_url: '', created_at: d(-5, 10), updated_at: d(-5, 10) },
  { id: 'b5', trainer_clerk_id: 'trainer', client_clerk_id: 'u4', client_name: 'Marcus Thompson', scheduled_at: d(5, 12), duration_minutes: 60, status: 'upcoming', session_type: 'virtual', price: 75, notes: '', meeting_url: '', created_at: d(-1, 10), updated_at: d(-1, 10) },
  { id: 'b6', trainer_clerk_id: 'trainer', client_clerk_id: 'u1', client_name: 'Emma Wilson', scheduled_at: d(-1, 9), duration_minutes: 60, status: 'completed', session_type: 'virtual', price: 75, notes: '', meeting_url: '', created_at: d(-8, 10), updated_at: d(-1, 10) },
  { id: 'b7', trainer_clerk_id: 'trainer', client_clerk_id: 'u3', client_name: 'Sofia Chen', scheduled_at: d(-2, 7), duration_minutes: 60, status: 'completed', session_type: 'virtual', price: 75, notes: '', meeting_url: '', created_at: d(-9, 10), updated_at: d(-2, 10) },
  { id: 'b8', trainer_clerk_id: 'trainer', client_clerk_id: 'u2', client_name: 'James Rodriguez', scheduled_at: d(-3, 17), duration_minutes: 60, status: 'completed', session_type: 'in_person', price: 90, notes: '', meeting_url: '', created_at: d(-10, 10), updated_at: d(-3, 10) },
];

const MOCK_CLIENTS: TrainerClientRow[] = [
  { id: 'c1', trainer_clerk_id: 'trainer', client_clerk_id: 'u1', client_name: 'Emma Wilson', client_email: 'emma@example.com', client_avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120', status: 'active', goal: 'Weight Loss & Tone', notes: 'Prefers morning sessions. Knee injury - avoid deep squats.', total_sessions: 24, joined_at: '2024-09-15T00:00:00Z', last_session_at: d(-1, 9) },
  { id: 'c2', trainer_clerk_id: 'trainer', client_clerk_id: 'u2', client_name: 'James Rodriguez', client_email: 'james@example.com', client_avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120', status: 'active', goal: 'Muscle Gain', notes: 'Very motivated. Looking to compete in local powerlifting.', total_sessions: 18, joined_at: '2024-11-01T00:00:00Z', last_session_at: d(-3, 17) },
  { id: 'c3', trainer_clerk_id: 'trainer', client_clerk_id: 'u3', client_name: 'Sofia Chen', client_email: 'sofia@example.com', client_avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120', status: 'active', goal: 'Marathon Prep', notes: 'Training for NYC Marathon. High endurance focus.', total_sessions: 32, joined_at: '2024-07-20T00:00:00Z', last_session_at: d(-2, 7) },
  { id: 'c4', trainer_clerk_id: 'trainer', client_clerk_id: 'u4', client_name: 'Marcus Thompson', client_email: 'marcus@example.com', client_avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120', status: 'active', goal: 'Strength & Flexibility', notes: 'Sedentary job. Focus on posture and core.', total_sessions: 8, joined_at: '2025-01-10T00:00:00Z', last_session_at: d(-5, 12) },
  { id: 'c5', trainer_clerk_id: 'trainer', client_clerk_id: 'u5', client_name: 'Aria Patel', client_email: 'aria@example.com', client_avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120', status: 'inactive', goal: 'General Fitness', notes: 'On hold - travelling for 2 months.', total_sessions: 12, joined_at: '2024-10-05T00:00:00Z', last_session_at: '2025-01-20T10:00:00Z' },
  { id: 'c6', trainer_clerk_id: 'trainer', client_clerk_id: 'u6', client_name: 'David Kim', client_email: 'david@example.com', client_avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120', status: 'active', goal: 'Athletic Performance', notes: 'Amateur soccer player. Speed and agility.', total_sessions: 45, joined_at: '2024-04-01T00:00:00Z', last_session_at: d(0, 16) },
];

const MOCK_CONVERSATIONS: ConversationRow[] = [
  { id: 'conv1', trainer_clerk_id: 'trainer', client_clerk_id: 'u1', client_name: 'Emma Wilson', client_avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120', last_message: "Thanks coach! See you tomorrow at 9! 💪", last_message_at: new Date(Date.now() - 3600000).toISOString(), unread_count: 0, created_at: '2025-01-01T00:00:00Z' },
  { id: 'conv2', trainer_clerk_id: 'trainer', client_clerk_id: 'u2', client_name: 'James Rodriguez', client_avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120', last_message: "Can we move Thursday's session to 6pm?", last_message_at: new Date(Date.now() - 7200000).toISOString(), unread_count: 2, created_at: '2025-01-02T00:00:00Z' },
  { id: 'conv3', trainer_clerk_id: 'trainer', client_clerk_id: 'u3', client_name: 'Sofia Chen', client_avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120', last_message: "My long run felt amazing this weekend!", last_message_at: new Date(Date.now() - 86400000).toISOString(), unread_count: 1, created_at: '2025-01-03T00:00:00Z' },
  { id: 'conv4', trainer_clerk_id: 'trainer', client_clerk_id: 'u4', client_name: 'Marcus Thompson', client_avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120', last_message: "How's my form looking in that video I sent?", last_message_at: new Date(Date.now() - 172800000).toISOString(), unread_count: 0, created_at: '2025-01-04T00:00:00Z' },
  { id: 'conv5', trainer_clerk_id: 'trainer', client_clerk_id: 'u6', client_name: 'David Kim', client_avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120', last_message: "Feeling sore but in a good way haha", last_message_at: new Date(Date.now() - 259200000).toISOString(), unread_count: 0, created_at: '2025-01-05T00:00:00Z' },
];

const MOCK_MESSAGES: Record<string, MessageRow[]> = {
  conv1: [
    { id: 'm1', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Hey coach! Quick question about tomorrow's session", is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm2', conversation_id: 'conv1', sender_clerk_id: 'trainer', content: "Of course! What's on your mind?", is_read: true, created_at: new Date(Date.now() - 7100000).toISOString() },
    { id: 'm3', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Should I bring anything special? I know we're doing the new HIIT circuit", is_read: true, created_at: new Date(Date.now() - 7000000).toISOString() },
    { id: 'm4', conversation_id: 'conv1', sender_clerk_id: 'trainer', content: "Just bring water and your resistance bands! Also make sure you've eaten a light meal at least 90 minutes before.", is_read: true, created_at: new Date(Date.now() - 6900000).toISOString() },
    { id: 'm5', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Perfect! I've been doing the mobility work you assigned. Hips feel much more open now 😊", is_read: true, created_at: new Date(Date.now() - 4000000).toISOString() },
    { id: 'm6', conversation_id: 'conv1', sender_clerk_id: 'trainer', content: "That's amazing to hear Emma! Consistent mobility work makes such a difference. You're going to crush tomorrow's session!", is_read: true, created_at: new Date(Date.now() - 3800000).toISOString() },
    { id: 'm7', conversation_id: 'conv1', sender_clerk_id: 'u1', content: "Thanks coach! See you tomorrow at 9! 💪", is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  conv2: [
    { id: 'm8', conversation_id: 'conv2', sender_clerk_id: 'trainer', content: "Great work on the deadlifts today James! Your form has improved massively.", is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'm9', conversation_id: 'conv2', sender_clerk_id: 'u2', content: "Thanks! I really felt it this time. The cue about hips really clicked", is_read: true, created_at: new Date(Date.now() - 86300000).toISOString() },
    { id: 'm10', conversation_id: 'conv2', sender_clerk_id: 'u2', content: "Can we move Thursday's session to 6pm?", is_read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm11', conversation_id: 'conv2', sender_clerk_id: 'u2', content: "Work meeting popped up at my usual 5pm slot", is_read: false, created_at: new Date(Date.now() - 7100000).toISOString() },
  ],
  conv3: [
    { id: 'm12', conversation_id: 'conv3', sender_clerk_id: 'u3', content: "Coach! I just finished my long run - 18 miles and felt strong the whole way!", is_read: true, created_at: new Date(Date.now() - 90000000).toISOString() },
    { id: 'm13', conversation_id: 'conv3', sender_clerk_id: 'trainer', content: "18 miles! That's incredible Sofia - your endurance has come so far. How were your splits?", is_read: true, created_at: new Date(Date.now() - 89000000).toISOString() },
    { id: 'm14', conversation_id: 'conv3', sender_clerk_id: 'u3', content: "Averaged 9:20/mile which is a new PB! My long run felt amazing this weekend!", is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  conv4: [
    { id: 'm15', conversation_id: 'conv4', sender_clerk_id: 'u4', content: "Hi coach, I recorded my squat today. How's my form looking in that video I sent?", is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
  ],
  conv5: [
    { id: 'm16', conversation_id: 'conv5', sender_clerk_id: 'trainer', content: "Excellent work in today's session David! Those sprint intervals were on fire.", is_read: true, created_at: new Date(Date.now() - 270000000).toISOString() },
    { id: 'm17', conversation_id: 'conv5', sender_clerk_id: 'u6', content: "Feeling sore but in a good way haha", is_read: true, created_at: new Date(Date.now() - 259200000).toISOString() },
  ],
};

const MOCK_PAYMENTS: PaymentRow[] = [
  { id: 'p1', booking_id: 'b6', trainer_clerk_id: 'trainer', client_clerk_id: 'u1', client_name: 'Emma Wilson', amount: 75, platform_fee: 7.50, net_amount: 67.50, status: 'completed', payment_method: 'card', paid_at: d(-1, 10), created_at: d(-1, 10) },
  { id: 'p2', booking_id: 'b8', trainer_clerk_id: 'trainer', client_clerk_id: 'u2', client_name: 'James Rodriguez', amount: 90, platform_fee: 9, net_amount: 81, status: 'completed', payment_method: 'card', paid_at: d(-3, 18), created_at: d(-3, 18) },
  { id: 'p3', booking_id: 'b7', trainer_clerk_id: 'trainer', client_clerk_id: 'u3', client_name: 'Sofia Chen', amount: 75, platform_fee: 7.50, net_amount: 67.50, status: 'completed', payment_method: 'card', paid_at: d(-2, 8), created_at: d(-2, 8) },
  { id: 'p4', booking_id: 'b4', trainer_clerk_id: 'trainer', client_clerk_id: 'u6', client_name: 'David Kim', amount: 120, platform_fee: 12, net_amount: 108, status: 'pending', payment_method: 'card', paid_at: null, created_at: d(0, 17) },
  { id: 'p5', booking_id: 'b9', trainer_clerk_id: 'trainer', client_clerk_id: 'u6', client_name: 'David Kim', amount: 90, platform_fee: 9, net_amount: 81, status: 'completed', payment_method: 'card', paid_at: d(-7, 17), created_at: d(-7, 17) },
  { id: 'p6', booking_id: 'b10', trainer_clerk_id: 'trainer', client_clerk_id: 'u5', client_name: 'Aria Patel', amount: 75, platform_fee: 7.50, net_amount: 67.50, status: 'refunded', payment_method: 'card', paid_at: d(-14, 10), created_at: d(-14, 10) },
];

let localAvailability = [...MOCK_AVAILABILITY];
let localProfile = { ...MOCK_PROFILE };

export const trainerService = {
  async getProfile(_clerkUserId: string): Promise<TrainerProfileRow> {
    await sleep(300);
    return { ...localProfile };
  },

  async upsertProfile(profile: Partial<TrainerProfileRow> & { clerk_user_id: string }): Promise<TrainerProfileRow> {
    await sleep(400);
    localProfile = { ...localProfile, ...profile, updated_at: new Date().toISOString() };
    return { ...localProfile };
  },

  async getAvailability(_trainerClerkId: string): Promise<AvailabilitySlotRow[]> {
    await sleep(300);
    return [...localAvailability];
  },

  async addAvailabilitySlot(slot: Omit<AvailabilitySlotRow, 'id' | 'created_at'>): Promise<AvailabilitySlotRow> {
    await sleep(300);
    const newSlot: AvailabilitySlotRow = { ...slot, id: `av-${Date.now()}`, created_at: new Date().toISOString() };
    localAvailability.push(newSlot);
    return newSlot;
  },

  async deleteAvailabilitySlot(id: string): Promise<void> {
    await sleep(200);
    localAvailability = localAvailability.filter(s => s.id !== id);
  },

  async getBookings(_trainerClerkId: string): Promise<BookingRow[]> {
    await sleep(300);
    return [...MOCK_BOOKINGS];
  },

  async getUpcomingBookings(_trainerClerkId: string): Promise<BookingRow[]> {
    await sleep(300);
    return MOCK_BOOKINGS.filter(b =>
      (b.status === 'upcoming' || b.status === 'confirmed') &&
      new Date(b.scheduled_at) > new Date()
    ).slice(0, 10);
  },

  async updateBookingStatus(id: string, status: BookingRow['status']): Promise<void> {
    await sleep(200);
    const booking = MOCK_BOOKINGS.find(b => b.id === id);
    if (booking) booking.status = status;
  },

  async getClients(_trainerClerkId: string): Promise<TrainerClientRow[]> {
    await sleep(300);
    return [...MOCK_CLIENTS];
  },

  async getConversations(_trainerClerkId: string): Promise<ConversationRow[]> {
    await sleep(300);
    return [...MOCK_CONVERSATIONS];
  },

  async getMessages(conversationId: string): Promise<MessageRow[]> {
    await sleep(200);
    return [...(MOCK_MESSAGES[conversationId] || [])];
  },

  async sendMessage(conversationId: string, senderClerkId: string, content: string): Promise<MessageRow> {
    await sleep(150);
    const newMsg: MessageRow = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_clerk_id: senderClerkId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    if (!MOCK_MESSAGES[conversationId]) MOCK_MESSAGES[conversationId] = [];
    MOCK_MESSAGES[conversationId].push(newMsg);
    const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    if (conv) { conv.last_message = content; conv.last_message_at = newMsg.created_at; }
    return newMsg;
  },

  async getPayments(_trainerClerkId: string): Promise<PaymentRow[]> {
    await sleep(300);
    return [...MOCK_PAYMENTS];
  },

  async getDashboardStats(_trainerClerkId: string) {
    await sleep(400);
    const completedBookings = MOCK_BOOKINGS.filter(b => b.status === 'completed');
    const upcomingBookings = MOCK_BOOKINGS.filter(b =>
      (b.status === 'upcoming' || b.status === 'confirmed') && new Date(b.scheduled_at) > new Date()
    );
    const totalEarnings = MOCK_PAYMENTS.filter(p => p.status === 'completed').reduce((s, p) => s + p.net_amount, 0);
    const activeClients = MOCK_CLIENTS.filter(c => c.status === 'active').length;

    const now = new Date();
    const weeklyEarnings = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now);
      day.setDate(day.getDate() - (6 - i));
      const name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()];
      const earnings = [120, 230, 0, 180, 300, 150, 400][i];
      return { name, earnings };
    });

    return {
      totalEarnings,
      activeClients,
      completedSessions: completedBookings.length,
      upcomingSessions: upcomingBookings.length,
      weeklyEarnings,
    };
  },
};
