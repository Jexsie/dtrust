/**
 * API Configuration
 * Centralizes API URL and helper functions
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export { API_URL };

/**
 * Helper function to get full API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_URL}${endpoint}`;
}
