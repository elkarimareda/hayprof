<?php

namespace App\Listeners;

use App\Events\CourseCreated;
use App\Models\Meeting;
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

            // Generate standardized meeting name
            $meetingName = Meeting::generateNameForCourse($course, $meetingId);

            Meeting::create([
                'meeting_id' => $meetingId,
                'attendee_password' => $attendeePassword,
                'moderator_password' => $moderatorPassword,
                'created_by' => $course->teacher->user_id ?? null,
                'course_id' => $course->id,
                'schedule_id' => $schedule->id ?? null,
                'is_recording' => true,
                // scheduled_at removed from schema; store date in metadata if needed
                // 'scheduled_at' => $schedule->datetime_scheduled,
                'status' => 'scheduled',
                'metadata' => [
                    'auto_created' => true,
                    'schedule_id' => $schedule->id,
                    'course_title' => $course->title,
                    'meeting_name' => $meetingName,
                ]
            ]);
        }
    }
}
