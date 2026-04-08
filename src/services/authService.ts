import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

export interface AuthResponse {
  email: string;
  firstName?: string;
  lastName?: string;
  token?: string; // Standard practice, though curl didn't specify
  [key: string]: any;
}

const parseAuthError = (data: any): string => {
  if (!data) return 'Action failed';
  
  if (typeof data.message === 'string') {
    // Check if the backend relayed a Clerk error as a stringified JSON
    if (data.message.includes('Clerk signup error:')) {
      try {
        const jsonStr = data.message.split('Clerk signup error:')[1].trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.errors && parsed.errors[0]?.message) {
          return parsed.errors[0].message;
        }
      } catch (e) {
        // Fallback to original message
      }
    }
    return data.message;
  }
  
  if (Array.isArray(data.errors) && data.errors[0]?.message) {
    return data.errors[0].message;
  }
  
  return 'Action failed';
};

export const authService = {
  async signUp(data: { email: string; password: string; firstName: string; lastName: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseAuthError(errorData));
    }

    return response.json();
  },

  async signIn(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseAuthError(errorData));
    }

    return response.json();
  },
};
