// Configuration utilities for handling local vs production environments

/**
 * Detect if we're running in production
 */
export const isProduction = (): boolean => {
  if (import.meta.env.PROD) {
    return true;
  }
  
  const hostname = window.location.hostname;
  
  // Local development: localhost or local network IPs
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')) {
    return false;
  }
  
  // Production
  return true;
};

/**
 * Get the base path for the app (empty for local, '/app' for production)
 */
export const getBasePath = (): string => {
  if (isProduction()) {
    // Check if we're on itstud.hiof.no
    if (window.location.hostname.includes('itstud.hiof.no')) {
      return '/~philipag/app';
    }
    return '/app';
  }
  return '';
};

/**
 * Get the API base URL
 * In production, API calls go directly to itstud.hiof.no (not under /app/)
 * In local development, use localhost:8081 or the same IP if accessing from network
 */
export const getApiBaseUrl = (): string => {
  // Check for environment variable first (useful for production overrides)
  const envApiBase = import.meta.env.VITE_API_BASE as string | undefined;
  if (envApiBase) {
    return envApiBase.replace(/\/$/, ''); // Remove trailing slash
  }

  if (isProduction()) {
    // Production: API calls go directly to the server root, not under /app/
    // Backend is likely on the same server but possibly different port/path
    if (window.location.hostname.includes('itstud.hiof.no')) {
      // Backend API at itstud.hiof.no root (not under /app/)
      // If backend is on a different port, you can set VITE_API_BASE env var
      return 'https://itstud.hiof.no';
    }
    // Fallback for other production environments
    return window.location.origin;
  }
  
  // Local development - use same hostname as frontend, but port 8081
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:8081`;
};

/**
 * Build a full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const apiBase = getApiBaseUrl();
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${apiBase}/${cleanEndpoint}`;
};

