<?php

namespace App\Listeners;

use App\Events\StudentEnrolled;
use App\Models\Meeting;
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

        // Find existing meetings for this course
        $meetings = Meeting::where('course_id', $course->id)
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
            // Update metadata only; don't store student_id on meeting
            $meeting->update([
                'metadata' => array_merge($meeting->metadata ?? [], [
                    'enrollment_id' => $enrollment->id,
                    'student_name' => $student->user->first_name . ' ' . $student->user->last_name,
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

            Meeting::create([
                'meeting_id' => $meetingId,
                'attendee_password' => $attendeePassword,
                'moderator_password' => $moderatorPassword,
                'created_by' => $course->teacher->user_id ?? null,
                'course_id' => $course->id,
                'schedule_id' => $schedule->id ?? null,
                'is_recording' => true,
                // scheduled_at removed from schema; keep scheduled datetime in metadata if needed
                // 'scheduled_at' => $schedule->datetime_scheduled,
                'status' => 'scheduled',
                'metadata' => [
                    'auto_created' => true,
                    'auto_created_for_enrollment' => true,
                    'schedule_id' => $schedule->id,
                    'course_title' => $course->title,
                    'student_name' => $student->user->first_name . ' ' . $student->user->last_name,
                    // Generate standardized meeting name
                    'meeting_name' => Meeting::generateNameForCourse($course, $meetingId),
                ]
            ]);
        }
    }
}
