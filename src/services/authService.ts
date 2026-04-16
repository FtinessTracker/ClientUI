export interface AuthResponse {
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'client' | 'trainer';
}

export interface AuthUser extends AuthResponse {
  id: string;
}

const USERS_KEY = 'trainliv_users';
const CURRENT_USER_KEY = 'trainliv_current_user';

const getStoredUsers = (): Record<string, any> => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, any>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
  async signUp(data: { email: string; password: string; firstName: string; lastName: string; role?: 'client' | 'trainer' }): Promise<AuthUser> {
    const users = getStoredUsers();

    if (users[data.email]) {
      throw new Error('Email already registered');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const userId = `user_${Date.now()}`;
    const userData = {
      id: userId,
      email: data.email,
      password: btoa(data.password),
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'client',
    };

    users[data.email] = userData;
    saveUsers(users);

    const user: AuthUser = {
      id: userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'client',
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async signIn(data: { email: string; password: string }): Promise<AuthUser> {
    const users = getStoredUsers();
    const user = users[data.email];

    if (!user || atob(user.password) !== data.password) {
      throw new Error('Invalid email or password');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return authUser;
  },

  signOut(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('mockTrainer');
  },

  getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isSignedIn(): boolean {
    return localStorage.getItem(CURRENT_USER_KEY) !== null;
  },
};
