export interface Student {
  id: number;
  name: string;
  email: string;
  country: string;
  created_at: string;
  photo_url: string | null;
}

export interface StudentsResponse {
  students: Student[];
}
