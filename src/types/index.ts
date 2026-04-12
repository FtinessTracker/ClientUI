export type Role = 'client' | 'trainer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  bio?: string;
  joinedAt: string;
}

export interface Trainer extends User {
  specialties: string[];
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  availability: AvailabilitySlot[];
  languages: string[];
  certifications: string[];
  introVideoUrl?: string;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:mm"
  endTime: string;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  trainerId: string;
  slotId: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  duration: number; // minutes
  price: number;
  notes?: string;
  meetingId?: string;
}

export interface Session {
  id: string;
  bookingId: string;
  roomUrl: string;
  isLive: boolean;
}
