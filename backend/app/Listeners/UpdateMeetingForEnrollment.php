<?php

namespace App\Listeners;

use App\Events\StudentEnrolled;
use App\Models\BigBlueButtonMeeting;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateMeetingForEnrollment implements ShouldQueue
{
    public function handle(StudentEnrolled $event): void
    {
        $enrollment = $event->enrollment;
        $course = $enrollment->course;
        $student = $enrollment->student;

        // Only update meetings when enrollment is confirmed
        if (!$enrollment->isConfirmed()) {
            return;
        }

        // Find existing meetings for this course that don't have a student assigned yet
        $meetings = BigBlueButtonMeeting::where('course_id', $course->id)
            ->where('teacher_id', $course->teacher_id)
            ->whereNull('student_id')
            ->where('status', 'scheduled')
            ->get();

        // For group courses, we might want different logic
        // For now, let's create individual meetings for each enrolled student
        if ($meetings->isEmpty()) {
            // If no meetings exist, create new ones for this student
            $this->createMeetingsForStudent($course, $student);
        } else {
            // If meetings exist, assign the first available one to this student
            $meeting = $meetings->first();
            $meeting->update([
                'student_id' => $student->id,
                'name' => "{$course->title} - {$student->user->first_name} {$student->user->last_name}",
                'metadata' => array_merge($meeting->metadata ?? [], [
                    'student_name' => $student->user->first_name . ' ' . $student->user->last_name,
                    'enrollment_id' => $enrollment->id,
                ])
            ]);
        }
    }

    private function createMeetingsForStudent($course, $student): void
    {
        foreach ($course->schedules as $schedule) {
            $meetingId = \Illuminate\Support\Str::uuid()->toString();
            $attendeePassword = \Illuminate\Support\Str::random(12);
            $moderatorPassword = \Illuminate\Support\Str::random(12);

            BigBlueButtonMeeting::create([
                'meeting_id' => $meetingId,
                'name' => "{$course->title} - {$student->user->first_name} {$student->user->last_name}",
                'attendee_password' => $attendeePassword,
                'moderator_password' => $moderatorPassword,
                'created_by' => $course->teacher->user_id,
                'course_id' => $course->id,
                'teacher_id' => $course->teacher_id,
                'student_id' => $student->id,
                'is_recording' => true,
                'max_participants' => 2, // Just teacher and student
                'duration' => $schedule->time_of_session, // Already in minutes
                'scheduled_at' => $schedule->datetime_scheduled,
                'status' => 'scheduled',
                'metadata' => [
                    'auto_created' => true,
                    'auto_created_for_enrollment' => true,
                    'schedule_id' => $schedule->id,
                    'course_title' => $course->title,
                    'teacher_name' => $course->teacher->first_name . ' ' . $course->teacher->last_name,
                    'student_name' => $student->user->first_name . ' ' . $student->user->last_name,
                ]
            ]);
        }
    }
}
