/**
 * Centralized timezone utility to ensure consistency across the application.
 * Picks the system timezone using the Intl API.
 */

export function getSystemTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Failed to detect system timezone:', error);
    // Fallback if Intl API is not supported or fails
    return 'UTC';
  }
}

/**
 * Formats a timezone for display.
 * e.g., "America/New_York" -> "New York (America)" or just returns as is.
 */
export function formatTimezone(tz: string): string {
  return tz.replace(/_/g, ' ');
}
