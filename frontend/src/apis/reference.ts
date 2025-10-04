import type { Language, Subject } from "@/Models/Common";
import api from "@/lib/request";
export interface SubjectsResponse {
  subjects: Subject[];
}

export interface LanguagesResponse {
  languages: Language[];
}

export interface SubjectsQueryParams {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

export interface LanguagesQueryParams {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

/**
 * Get all subjects with optional filtering
 */
export const getSubjects = async (
  params?: SubjectsQueryParams
): Promise<SubjectsResponse> => {
  const response = await api.get<SubjectsResponse>("/subjects", { params });
  return response.data;
};

/**
 * Get a single subject by ID
 */
export const getSubject = async (id: number): Promise<Subject> => {
  const response = await api.get<Subject>(`/subjects/${id}`);
  return response.data;
};

/**
 * Create a new subject
 */
export const createSubject = async (
  data: Partial<Subject>
): Promise<Subject> => {
  const response = await api.post<Subject>("/subjects", data);
  return response.data;
};

/**
 * Update an existing subject
 */
export const updateSubject = async (
  id: number,
  data: Partial<Subject>
): Promise<Subject> => {
  const response = await api.put<Subject>(`/subjects/${id}`, data);
  return response.data;
};

/**
 * Delete a subject
 */
export const deleteSubject = async (id: number): Promise<void> => {
  await api.delete(`/subjects/${id}`);
};

/**
 * Get all languages with optional filtering
 */
export const getLanguages = async (
  params?: LanguagesQueryParams
): Promise<LanguagesResponse> => {
  const response = await api.get<LanguagesResponse>("/languages", {
    params,
  });
  return response.data;
};

/**
 * Get a single language by ID
 */
export const getLanguage = async (id: number): Promise<Language> => {
  const response = await api.get<Language>(`/languages/${id}`);
  return response.data;
};

/**
 * Create a new language
 */
export const createLanguage = async (
  data: Partial<Language>
): Promise<Language> => {
  const response = await api.post<Language>("/languages", data);
  return response.data;
};

/**
 * Update an existing language
 */
export const updateLanguage = async (
  id: number,
  data: Partial<Language>
): Promise<Language> => {
  const response = await api.put<Language>(`/languages/${id}`, data);
  return response.data;
};

/**
 * Delete a language
 */
export const deleteLanguage = async (id: number): Promise<void> => {
  await api.delete(`/languages/${id}`);
};
