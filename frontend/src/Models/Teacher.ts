import type { User } from "./Auth";
import type { Language } from "./Common";
import type { Course } from "./Course";
import type { Review } from "./Review";

export interface TeacherProfileData {
  profile: Teacher;
  reviews: Review[];
  courses: Course[];
}

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  country: string;
  timezone: string;
  pricing: number;
  biography?: string;
  onboarding_completed: boolean;
  photo_url?: string;
  video_url?: string;
  thumbnail_video_url?: string;
  user: User;
  certifications?: Certification[];
  courses: Course[];
  subjects?: string[];
  students_count?: number;
  rating?: number;
  reviews?: {
    total_reviews?: number;
    average_rating?: number;
  };
  courses_count?: number;
  languages?: Language[];
  experience_years?: number;
  response_time?: string;
  students?: User[];
}

export interface TeachersResponse {
  teachers: Teacher[];
}

export interface Certification {
  id: number;
  subject: string;
  certificate: string;
  description?: string;
  issue_by?: string;
  year_of_study_start: string;
  year_of_study_end: string;
}
export interface Education {
  id: number;
  university: string;
  degree: string;
  degree_type: string;
  specialization?: string;
  year_of_study_start: string;
  year_of_study_end: string;
}

export interface Description {
  id: number;
  yourself?: string;
  experience?: string;
  motivation?: string;
  headline?: string;
}
