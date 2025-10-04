export interface Meeting {
  id: number;
  attendee_password: string;
  course_id: number;
  duration: number;
  is_recording: boolean;
  max_participants: number;
  meeting_id: string;
  metadata: { auto_created: boolean; schedule_id: number };
  moderator_password: string;
  status: string;
}

export interface MeetingsResponse {
  meetings: Meeting[];
}
