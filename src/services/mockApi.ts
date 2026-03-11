import { Trainer, Booking, User, Role } from '../types';

const MOCK_TRAINERS: Trainer[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    email: 'sarah@flexfit.com',
    role: 'trainer',
    specialties: ['Yoga', 'Pilates', 'Mindfulness'],
    rating: 4.9,
    reviewCount: 124,
    pricePerHour: 75,
    languages: ['English', 'Spanish'],
    certifications: ['RYT-500', 'NASM-CPT'],
    joinedAt: '2023-01-15',
    avatar: 'https://picsum.photos/seed/sarah/200',
    availability: [
      { id: 's1', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', isBooked: false },
      { id: 's2', dayOfWeek: 1, startTime: '10:00', endTime: '11:00', isBooked: true },
      { id: 's3', dayOfWeek: 3, startTime: '14:00', endTime: '15:00', isBooked: false },
    ]
  },
  {
    id: 't2',
    name: 'Marcus Chen',
    email: 'marcus@flexfit.com',
    role: 'trainer',
    specialties: ['HIIT', 'Strength Training', 'Nutrition'],
    rating: 4.8,
    reviewCount: 89,
    pricePerHour: 90,
    languages: ['English', 'Mandarin'],
    certifications: ['CSCS', 'Precision Nutrition L1'],
    joinedAt: '2023-03-20',
    avatar: 'https://picsum.photos/seed/marcus/200',
    availability: [
      { id: 's4', dayOfWeek: 2, startTime: '08:00', endTime: '09:00', isBooked: false },
      { id: 's5', dayOfWeek: 4, startTime: '17:00', endTime: '18:00', isBooked: false },
    ]
  },
  {
    id: 't3',
    name: 'Elena Rodriguez',
    email: 'elena@flexfit.com',
    role: 'trainer',
    specialties: ['Rehab', 'Mobility', 'Senior Fitness'],
    rating: 5.0,
    reviewCount: 56,
    pricePerHour: 85,
    languages: ['English', 'Spanish', 'Portuguese'],
    certifications: ['DPT', 'FMS'],
    joinedAt: '2023-06-10',
    avatar: 'https://picsum.photos/seed/elena/200',
    availability: []
  }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getTrainers: async (filters?: any) => {
    await sleep(800);
    let results = [...MOCK_TRAINERS];
    if (filters?.search) {
      results = results.filter(t => t.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    return results;
  },

  getTrainerById: async (id: string) => {
    await sleep(500);
    const trainer = MOCK_TRAINERS.find(t => t.id === id);
    if (!trainer) throw new Error('Trainer not found');
    return trainer;
  },

  getCurrentUser: async (): Promise<User | null> => {
    await sleep(300);
    const stored = localStorage.getItem('flexfit_user');
    return stored ? JSON.parse(stored) : null;
  },

  login: async (email: string, role: Role): Promise<User> => {
    await sleep(1000);
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      role,
      joinedAt: new Date().toISOString()
    };
    localStorage.setItem('flexfit_user', JSON.stringify(user));
    return user;
  },

  logout: async () => {
    await sleep(300);
    localStorage.removeItem('flexfit_user');
  },

  getBookings: async (userId: string, role: Role): Promise<Booking[]> => {
    await sleep(600);
    // Mock bookings
    return [
      {
        id: 'b1',
        clientId: role === 'client' ? userId : 'c1',
        trainerId: role === 'trainer' ? userId : 't1',
        slotId: 's1',
        date: new Date(Date.now() + 86400000).toISOString(),
        status: 'upcoming',
        duration: 60,
        price: 75
      }
    ];
  }
};
