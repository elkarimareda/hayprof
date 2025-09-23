export interface Review {
  comment: string;
  course?: { title: string };
  created_at: string;
  id: number;
  is_verified: boolean;
  rating: number;
  student: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    photo_url?: string;
  };
}
