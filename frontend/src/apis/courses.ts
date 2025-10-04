import type { Course } from "@/Models/Course";
import type { MeetingsResponse } from "@/Models/Meeting";
import api from "@/lib/request";
import type { CourseInputs } from "@/validators/courseSchema";

export interface CourseResponse {
  message: string;
  course: Course;
}

export interface CoursesResponse {
  courses: Course[];
}

export interface EnrollmentResponse {
  message: string;
  enrollment: {
    id: number;
    student_id: number;
    course_id: number;
    enrolled_at: string;
    status: string;
  };
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  enrolled_at: string;
  status: string;
  confirmed_at?: string;
  amount_paid?: string;
  student?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface EnrollmentsResponse {
  enrollments: Enrollment[];
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
  formData.append("count_session", data.count_session.toString());
  formData.append("duration_session", data.duration_session.toString());
  formData.append("min_students", data.min_students.toString());
  formData.append("max_students", data.max_students.toString());
  formData.append("course_date", data.course_date);

  // Filter out empty schedules and reindex
  const validSchedules = data.schedule.filter(
    (schedule) => schedule.date && schedule.date.trim() !== ""
  );

  validSchedules.forEach((schedule, index) => {
    formData.append(`schedule[${index}][date]`, schedule.date);
  });

  const response = await api.post<CourseResponse>("/courses", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Get all courses
 */
export const getCourses = async (): Promise<CoursesResponse> => {
  const response = await api.get<CoursesResponse>("/courses");
  return response.data;
};

/**
 * Get a single course by ID
 */
export const getCourse = async (courseId: string): Promise<Course> => {
  const response = await api.get<Course>(`/courses/${courseId}`);
  return response.data;
};

/**
 * Get a meeting by course ID
 */
export const getCourseMeeting = async (
  courseId: string
): Promise<MeetingsResponse> => {
  const response = await api.get<MeetingsResponse>(
    `/courses/${courseId}/meetings`
  );
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
 * Review a course (admin only)
 */
export const ReviewingCourse = async (
  review: "reject" | "validate",
  courseId: number,
  notes?: string
): Promise<{ message: string; course: Partial<Course> }> => {
  const response = await api.post(`/courses/${courseId}/${review}`, {
    validation_notes: notes,
  });
  return response.data;
};

/**
 * Enroll a student in a course
 */
export const enrollInCourse = async (
  courseId: number
): Promise<EnrollmentResponse> => {
  const response = await api.post<EnrollmentResponse>(
    `/courses/${courseId}/enroll`
  );
  return response.data;
};

/**
 * Get course enrollment for current user
 */
export const getCourseEnrollment = async (
  courseId: number
): Promise<Enrollment | null> => {
  try {
    const response = await api.get<EnrollmentsResponse>(
      `/courses/${courseId}/enrollments`
    );
    // Find the current user's enrollment from the enrollments list
    // Since this endpoint returns all enrollments for the course,
    // we need to filter for the current user (this should be done by the backend ideally)
    const enrollments = response.data.enrollments;
    // For now, we'll assume the API should return only the current user's enrollment
    // or we need a different endpoint
    return enrollments.length > 0 ? enrollments[0] : null;
  } catch (error: unknown) {
    // Return null if not enrolled (404) or other error
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
};

/**
 * Get all enrollments for a course (for teachers/admins)
 */
export const getCourseEnrollments = async (
  courseId: number
): Promise<EnrollmentsResponse> => {
  const response = await api.get<EnrollmentsResponse>(
    `/courses/${courseId}/enrollments`
  );
  return response.data;
};

/**
 * Unenroll a student from a course
 */
export const unenrollFromCourse = async (
  courseId: number
): Promise<{ message: string }> => {
  const response = await api.delete(`/courses/${courseId}/enroll`);
  return response.data;
};

export const joinCourseMeeting = async (
  meetingId: string,
  username: string,
  password: string,
  is_moderator: boolean = false
): Promise<{ join_url: string }> => {
  const response = await api.post<{ join_url: string }>(
    `/bigbluebutton/meetings/join`,
    {
      meeting_id: meetingId,
      user_name: username,
      password,
      is_moderator,
      user_id: undefined,
    }
  );
  return response.data;
};
