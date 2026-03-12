import { useUser } from '@clerk/clerk-react';
import { User } from '../types';

export function useAppUser(): { appUser: User | null; isLoaded: boolean } {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return { appUser: null, isLoaded: false };
  }

  if (!user) {
    return { appUser: null, isLoaded: true };
  }

  const role = (user.publicMetadata?.role as 'client' | 'trainer') || 'client';

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
