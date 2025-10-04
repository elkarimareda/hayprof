export interface CourseSchedule {
  id: number;
  datetime_scheduled: string;
  time_of_session: number; // duration in minutes
}
export interface Course {
  id: number;
  title: string;
  subject: {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  proficiency_level?: string;
  description: string;
  thumbnail_url?: string;
  price_per_student: number;
  count_session: number;
  duration_session: number;
  min_students: number;
  max_students: number;
  schedules: CourseSchedule[];
  teacher: {
    id: number;
    first_name: string;
    last_name: string;
    photo_url?: string;
  };
  is_active: boolean;
  is_validated: boolean;
  created_at: string;
}
