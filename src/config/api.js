// Central place for the backend base URL.
// Reads from the VITE_API_URL environment variable (set in .env / .env.production),
// falling back to localhost for local development.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Convenience helper so call sites don't need to remember to prefix /api/v1 themselves
// if that ever changes. Usage: apiUrl('/hotels/search') -> `${API_BASE_URL}/api/v1/hotels/search`
export const apiUrl = (path) => `${API_BASE_URL}/api/v1${path}`;
