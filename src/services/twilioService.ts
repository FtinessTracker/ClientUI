import { API_BASE_URL } from '../config';

export interface TwilioTokenResponse {
  token: string;
  identity?: string;
  roomName?: string;
}

export async function getTwilioVideoToken({ roomName, userId }: { roomName: string; userId: string }): Promise<TwilioTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/video/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ roomName, identity: userId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch Twilio token');
  }

  return response.json();
}
