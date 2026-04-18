import { useUser } from '@clerk/clerk-react';
import { User, Role } from '../types';

export function useAppUser(): { appUser: User | null; isLoaded: boolean } {
  const { user, isLoaded } = useUser();

  // If a real Clerk session is active, it always takes priority.
  // Clear any stale mock trainer data so it cannot bleed into the client session.
  if (isLoaded && user) {
    localStorage.removeItem('mockTrainer');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userId');

    const role = (user.publicMetadata?.role as Role) || 'client';

    const appUser: User = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      name: user.fullName || user.username || user.firstName || 'User',
      role,
      avatar: user.imageUrl,
      joinedAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };

    return { appUser, isLoaded: true };
  }

  if (!isLoaded) return { appUser: null, isLoaded: false };

  // No active Clerk session — fall back to mock trainer (trainer-only local auth)
  const mockUserStr = localStorage.getItem('mockTrainer');
  if (mockUserStr) {
    try {
      const mockUser = JSON.parse(mockUserStr);
      return { appUser: mockUser, isLoaded: true };
    } catch (e) {
      localStorage.removeItem('mockTrainer');
    }
  }

  return { appUser: null, isLoaded: true };
}
