<?php

namespace App\Listeners;

use App\Events\CourseCreated;
use App\Models\BigBlueButtonMeeting;
use Illuminate\Support\Str;
use Illuminate\Contracts\Queue\ShouldQueue;

class CreateMeetingForCourse implements ShouldQueue
{
    public function handle(CourseCreated $event): void
    {
        $course = $event->course;

        // Create a BigBlueButton meeting for each scheduled session
        foreach ($course->schedules as $schedule) {
            $meetingId = Str::uuid()->toString();
            $attendeePassword = Str::random(12);
            $moderatorPassword = Str::random(12);

            BigBlueButtonMeeting::create([
                'meeting_id' => $meetingId,
                'name' => "{$course->title} - Session " . $schedule->id,
                'attendee_password' => $attendeePassword,
                'moderator_password' => $moderatorPassword,
                'created_by' => $course->teacher->user_id,
                'course_id' => $course->id,
                'teacher_id' => $course->teacher_id,
                'student_id' => null, // Will be updated when students enroll
                'is_recording' => true,
                'max_participants' => $course->max_students + 1, // Students + teacher
                'duration' => $schedule->time_of_session, // Already in minutes
                'scheduled_at' => $schedule->datetime_scheduled,
                'status' => 'scheduled',
                'metadata' => [
                    'auto_created' => true,
                    'schedule_id' => $schedule->id,
                    'course_title' => $course->title,
                    'teacher_name' => $course->teacher->first_name . ' ' . $course->teacher->last_name,
                ]
            ]);
        }
    }
}
