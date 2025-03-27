import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string or Date object into a readable format
 * @param dateStr The date string or Date object to format
 * @param format Optional format string
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return "N/A";
  
  try {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString();
  } catch (error) {
    return "N/A";
  }
}
