import { useUser } from '@clerk/clerk-react';
import { User, Role } from '../types';

export function useAppUser(): { appUser: User | null; isLoaded: boolean } {
  const { user, isLoaded } = useUser();

  // Check for mock trainer in localStorage first (for the mock module)
  const mockUserStr = localStorage.getItem('mockTrainer');
  if (mockUserStr) {
    try {
      const mockUser = JSON.parse(mockUserStr);
      return { appUser: mockUser, isLoaded: true };
    } catch (e) {
      console.error('Failed to parse mock trainer', e);
    }
  }

  if (!isLoaded) return { appUser: null, isLoaded: false };
  if (!user) return { appUser: null, isLoaded: true };

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
