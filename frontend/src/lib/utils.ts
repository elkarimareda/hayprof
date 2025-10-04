import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
// Lightweight ClassValue type compatible with clsx's ClassValue
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, boolean | undefined | null>
  | ClassValue[];

export function cn(...inputs: ClassValue[]) {
  // class-variance-authority's cx expects values shaped like clsx's ClassValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return twMerge(cx(...(inputs as any)));
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

// Small UI/date helpers used by the template below
export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

export const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
