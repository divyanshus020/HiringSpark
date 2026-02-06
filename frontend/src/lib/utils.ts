import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the backend base URL for file access (uploads, resumes, etc.)
 * In development: uses VITE_API_URL or localhost
 * In production: uses current domain
 */
export const getBackendHost = (): string => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development: use VITE_API_URL or fallback to localhost
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  } else {
    // Production: use current domain
    return window.location.origin;
  }
};

/**
 * Construct full URL for a file path
 * @param filePath - Relative or absolute file path
 * @returns Full URL to access the file
 */
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';

  // If already a full URL, return as is
  const isFullUrl = /^https?:\/\//i.test(filePath);
  if (isFullUrl) return filePath;

  // Construct full URL with backend host
  const backendHost = getBackendHost();
  return `${backendHost}${filePath}`;
};
