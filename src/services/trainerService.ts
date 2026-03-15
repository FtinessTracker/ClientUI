import { supabase, TrainerProfileRow, AvailabilitySlotRow, BookingRow, TrainerClientRow, ConversationRow, MessageRow, PaymentRow } from '../lib/supabase';

export const trainerService = {
  async getProfile(clerkUserId: string): Promise<TrainerProfileRow | null> {
    const { data } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();
    return data;
  },

  async upsertProfile(profile: Partial<TrainerProfileRow> & { clerk_user_id: string }): Promise<TrainerProfileRow | null> {
    const { data } = await supabase
      .from('trainer_profiles')
      .upsert({ ...profile, updated_at: new Date().toISOString() }, { onConflict: 'clerk_user_id' })
      .select()
      .maybeSingle();
    return data;
  },

  async getAvailability(trainerClerkId: string): Promise<AvailabilitySlotRow[]> {
    const { data } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('trainer_clerk_id', trainerClerkId)
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time');
    return data || [];
  },

  async addAvailabilitySlot(slot: Omit<AvailabilitySlotRow, 'id' | 'created_at'>): Promise<AvailabilitySlotRow | null> {
    const { data } = await supabase
      .from('availability_slots')
      .insert(slot)
      .select()
      .maybeSingle();
    return data;
  },

  async deleteAvailabilitySlot(id: string): Promise<void> {
    await supabase.from('availability_slots').delete().eq('id', id);
  },

  async getBookings(trainerClerkId: string): Promise<BookingRow[]> {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('trainer_clerk_id', trainerClerkId)
      .order('scheduled_at', { ascending: true });
    return data || [];
  },

  async getUpcomingBookings(trainerClerkId: string): Promise<BookingRow[]> {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('trainer_clerk_id', trainerClerkId)
      .in('status', ['upcoming', 'confirmed'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10);
    return data || [];
  },

  async updateBookingStatus(id: string, status: BookingRow['status']): Promise<void> {
    await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
  },

  async getClients(trainerClerkId: string): Promise<TrainerClientRow[]> {
    const { data } = await supabase
      .from('trainer_clients')
      .select('*')
      .eq('trainer_clerk_id', trainerClerkId)
      .order('joined_at', { ascending: false });
    return data || [];
  },

  async getConversations(trainerClerkId: string): Promise<ConversationRow[]> {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('trainer_clerk_id', trainerClerkId)
      .order('last_message_at', { ascending: false });
    return data || [];
  },

  async getMessages(conversationId: string): Promise<MessageRow[]> {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return data || [];
  },

  async sendMessage(conversationId: string, senderClerkId: string, content: string): Promise<MessageRow | null> {
    const { data } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_clerk_id: senderClerkId, content })
      .select()
      .maybeSingle();

    if (data) {
      await supabase
        .from('conversations')
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }
    return data;
  },

  async getPayments(trainerClerkId: string): Promise<PaymentRow[]> {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('trainer_clerk_id', trainerClerkId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getDashboardStats(trainerClerkId: string) {
    const [bookings, clients, payments] = await Promise.all([
      supabase.from('bookings').select('id, status, price, scheduled_at').eq('trainer_clerk_id', trainerClerkId),
      supabase.from('trainer_clients').select('id, status').eq('trainer_clerk_id', trainerClerkId),
      supabase.from('payments').select('net_amount, status, created_at').eq('trainer_clerk_id', trainerClerkId).eq('status', 'completed'),
    ]);

    const allBookings = bookings.data || [];
    const allClients = clients.data || [];
    const allPayments = payments.data || [];

    const totalEarnings = allPayments.reduce((sum, p) => sum + Number(p.net_amount), 0);
    const activeClients = allClients.filter(c => c.status === 'active').length;
    const completedSessions = allBookings.filter(b => b.status === 'completed').length;
    const upcomingSessions = allBookings.filter(b =>
      (b.status === 'upcoming' || b.status === 'confirmed') &&
      new Date(b.scheduled_at) > new Date()
    ).length;

    const now = new Date();
    const weeklyEarnings = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now);
      day.setDate(day.getDate() - (6 - i));
      const dayStart = new Date(day.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(day.setHours(23, 59, 59, 999)).toISOString();
      const earned = allPayments
        .filter(p => p.created_at >= dayStart && p.created_at <= dayEnd)
        .reduce((sum, p) => sum + Number(p.net_amount), 0);
      return {
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(dayStart).getDay()],
        earnings: earned,
      };
    });

    return { totalEarnings, activeClients, completedSessions, upcomingSessions, weeklyEarnings };
  },
};
