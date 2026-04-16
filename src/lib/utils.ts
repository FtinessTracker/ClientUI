import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format UTC date string to readable format
 * Example: "2026-04-16T10:30:00Z" -> "Apr 16, 2026"
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format price in cents to display
 * 0 -> "FREE"
 * 1000 -> "$10.00"
 */
export function formatPrice(priceInCents: number): string {
  if (!priceInCents || priceInCents === 0) {
    return 'FREE';
  }
  return `$${(priceInCents / 100).toFixed(2)}`;
}
