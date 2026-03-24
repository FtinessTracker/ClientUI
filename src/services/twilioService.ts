export async function getTwilioVideoToken({ roomName }: { roomName: string }): Promise<{ token: string }> {
  const response = await fetch('http://localhost:8080/api/video/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ roomName }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch Twilio token');
  }

  return response.json();
}
