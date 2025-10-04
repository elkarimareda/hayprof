export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  type: "other" | "language";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: number;
  name: string;
  code: string;
  proficiency_level?: string;
  native_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
