import { User } from '../types';
import { authService } from '../services/authService';

export function useAppUser(): { appUser: User | null; isLoaded: boolean } {
  const mockUserStr = localStorage.getItem('mockTrainer');
  if (mockUserStr) {
    try {
      const mockUser = JSON.parse(mockUserStr);
      return { appUser: mockUser, isLoaded: true };
    } catch (e) {
      console.error('Failed to parse mock trainer', e);
    }
  }

  const authUser = authService.getCurrentUser();

  if (!authUser) return { appUser: null, isLoaded: true };

  const appUser: User = {
    id: authUser.id,
    email: authUser.email,
    name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.email,
    role: authUser.role,
    avatar: undefined,
    joinedAt: new Date().toISOString(),
  };

  return { appUser, isLoaded: true };
}
