import type { Review } from "@/Models/Review";
import type { TeacherProfileData, TeachersResponse } from "@/Models/Teacher";
import api from "@/lib/request";

export const getTeachers = async (): Promise<TeachersResponse> => {
  const response = await api.get<TeachersResponse>("/teachers");
  return response.data;
};

// API function to get teacher profile
export const getTeacherProfile = async (
  teacherId: string
): Promise<TeacherProfileData> => {
  const response = await api.get<TeacherProfileData>(`/teachers/${teacherId}`);
  return response.data;
};

// API function to get teacher reviews
export const getTeacherReviews = async (
  teacherId: string
): Promise<{
  reviews: Review[];
  statistics: { average_rating: number; total_reviews: number };
}> => {
  const response = await api.get<{
    reviews: Review[];
    statistics: { average_rating: number; total_reviews: number };
  }>(`/teachers/${teacherId}/reviews`);
  return response.data;
};

// API function to delete review
export const deleteReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`);
};
