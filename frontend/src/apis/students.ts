import type { StudentsResponse } from "@/Models/Student";
import api from "@/lib/request";

export const getStudents = async (): Promise<StudentsResponse> => {
  const response = await api.get<StudentsResponse>("/students");
  return response.data;
};
