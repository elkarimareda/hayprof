import api from "@/utils/request";
import type { CourseInputs } from "@/validators/courseSchema";

export interface CourseSchedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export interface Course {
  id: number;
  title: string;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  proficiency_level?: string;
  description: string;
  thumbnail_url?: string;
  price_per_student: number;
  number_of_hours: number;
  min_students: number;
  max_students: number;
  schedules: CourseSchedule[];
  teacher?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  is_active: boolean;
  is_validated: boolean;
  created_at: string;
}

export interface CourseResponse {
  message: string;
  course: Course;
}

export interface CoursesResponse {
  courses: Course[];
}

/**
 * Create a new course
 */
export const createCourse = async (
  data: CourseInputs
): Promise<CourseResponse> => {
  const formData = new FormData();

  // Append course data
  formData.append("title", data.title);
  formData.append("subject", data.subject.toString());

  if (data.proficiency_level) {
    formData.append("proficiency_level", data.proficiency_level);
  }

  formData.append("description", data.description);
  formData.append("thumbnail", data.thumbnail);
  formData.append("price_per_student", data.price_per_student.toString());
  formData.append("number_of_hours", data.number_of_hours.toString());
  formData.append("min_students", data.min_students.toString());
  formData.append("max_students", data.max_students.toString());

  // Append schedule data
  data.schedule.forEach((schedule, index) => {
    formData.append(`schedule[${index}][day_of_week]`, schedule.day_of_week);
    formData.append(`schedule[${index}][start_time]`, schedule.start_time);
    formData.append(`schedule[${index}][end_time]`, schedule.end_time);
  });

  const response = await api.post<CourseResponse>("/courses", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Get teacher's courses
 */
export const getCourses = async (): Promise<CoursesResponse> => {
  const response = await api.get<CoursesResponse>("/courses");
  return response.data;
};

/**
 * Get courses pending validation (admin only)
 */
export const getPendingCourses = async (): Promise<CoursesResponse> => {
  const response = await api.get<CoursesResponse>(
    "/courses/pending-validation"
  );
  return response.data;
};

/**
 * Get all validated courses for browsing (public/students)
 */
export const getValidatedCourses = async (
  subjectId?: number
): Promise<CoursesResponse> => {
  const params = new URLSearchParams();
  if (subjectId) {
    params.append("subject_id", subjectId.toString());
  }

  const response = await api.get<CoursesResponse>(
    `/courses/validated${params.toString() ? `?${params.toString()}` : ""}`
  );
  return response.data;
};

/**
 * Validate a course (admin only)
 */
export const validateCourse = async (
  courseId: number,
  notes?: string
): Promise<{ message: string; course: Partial<Course> }> => {
  const response = await api.post(`/courses/${courseId}/validate`, {
    validation_notes: notes,
  });
  return response.data;
};

/**
 * Reject a course (admin only)
 */
export const rejectCourse = async (
  courseId: number,
  notes: string
): Promise<{ message: string; course: Partial<Course> }> => {
  const response = await api.post(`/courses/${courseId}/reject`, {
    validation_notes: notes,
  });
  return response.data;
};
