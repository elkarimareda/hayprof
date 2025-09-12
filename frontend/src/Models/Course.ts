export default interface Course {
  id: number;
  title: string;
  subject: Subject;
  proficiency_level: string;
  description: string;
  thumbnail_url: string;
  price_per_student: string;
  number_of_hours: number | null;
  min_students: number;
  max_students: number;
  schedules: Schedule[];
  is_active: boolean;
  is_validated: boolean;
  created_at: string;
}

interface Schedule {
  id: number;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}
