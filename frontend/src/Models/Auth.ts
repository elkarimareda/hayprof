import type { SocialAccount } from "@/apis/social";

export const UserType = {
  student: "student",
  teacher: "teacher",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

export interface User {
  id: number;
  name: string;
  email: string;
  onboarding_completed: boolean;
  user_type: UserType;
  social_accounts: SocialAccount[];
  avatar?: string | null;
  profile: {
    photo_url: string | null;
    id: number;
  };
}
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}
