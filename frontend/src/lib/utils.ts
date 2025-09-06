import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate year options (e.g., from 1950 to current year + 5)
const currentYear = new Date().getFullYear();
export const yearOptions = Array.from(
  { length: currentYear - 1950 + 6 },
  (_, i) => {
    const year = (currentYear + 5 - i).toString();
    return { label: year, value: year };
  }
);
