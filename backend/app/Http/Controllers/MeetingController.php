<?php

namespace App\Http\Controllers;

use App\Services\BigBlueButtonService;
use App\Models\Meeting;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Exception;

class MeetingController extends Controller
{
    public function __construct(
        private readonly BigBlueButtonService $bbbService
    ) {}

    /**
     * Create a new meeting
     */
    public function createMeeting(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'meeting_id' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_-]+$/'],
            'attendee_password' => ['nullable', 'string', 'min:6', 'max:50'],
            'moderator_password' => ['nullable', 'string', 'min:6', 'max:50'],
            'welcome_message' => ['nullable', 'string', 'max:1000'],
            'record' => ['nullable', 'boolean'],
            'auto_start_recording' => ['nullable', 'boolean'],
            'allow_start_stop_recording' => ['nullable', 'boolean'],
            'max_participants' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'duration' => ['nullable', 'integer', 'min:0', 'max:1440'], // Max 24 hours
            'course_id' => ['nullable', 'exists:courses,id'],
            'schedule_id' => ['nullable', 'exists:course_schedules,id'],
        ]);

        try {
            $meetingId = $validated['meeting_id'] ?? Str::uuid()->toString();
            $attendeePassword = $validated['attendee_password'] ?? Str::random(12);
            $moderatorPassword = $validated['moderator_password'] ?? Str::random(12);
            // Determine meeting name (clients may send 'name' or 'meeting_name'); fallback to meeting ID
            $meetingName = $validated['name'] ?? $validated['meeting_name'] ?? $meetingId;

            // If a course_id is provided, prefer a standardized name using teacher and subject
            if (!empty($validated['course_id'])) {
                $course = Course::with(['teacher', 'subject'])->find($validated['course_id']);
                $meetingName = Meeting::generateNameForCourse($course, $meetingName);
            }

            $params = [
                'meetingID' => $meetingId,
                'attendeePW' => $attendeePassword,
                'moderatorPW' => $moderatorPassword,
                'record' => ($validated['record'] ?? false) ? 'true' : 'false',
                'autoStartRecording' => ($validated['auto_start_recording'] ?? false) ? 'true' : 'false',
                'allowStartStopRecording' => ($validated['allow_start_stop_recording'] ?? true) ? 'true' : 'false',
            ];

            if (isset($validated['welcome_message'])) {
                $params['welcome'] = $validated['welcome_message'];
            }

            if (isset($validated['max_participants'])) {
                $params['maxParticipants'] = $validated['max_participants'];
            }

            if (isset($validated['duration'])) {
                $params['duration'] = $validated['duration'];
            }

            $result = $this->bbbService->createMeeting($params);

            if ($result['returncode'] === 'SUCCESS') {
                // Save meeting to database (schema no longer stores name/teacher/student)
                $meeting = Meeting::create([
                    'meeting_id' => $meetingId,
                    'attendee_password' => $attendeePassword,
                    'moderator_password' => $moderatorPassword,
                    'created_by' => auth()->id() ?? 1, // Fallback to user ID 1 if not authenticated
                    'course_id' => $validated['course_id'] ?? null,
                    'is_recording' => $validated['record'] ?? false,
                    'max_participants' => $validated['max_participants'] ?? null,
                    'duration' => $validated['duration'] ?? null,
                    'status' => 'scheduled',
                    'metadata' => [
                        'meeting_name' => $meetingName,
                        'welcome_message' => $validated['welcome_message'] ?? null,
                        'auto_start_recording' => $validated['auto_start_recording'] ?? false,
                        'allow_start_stop_recording' => $validated['allow_start_stop_recording'] ?? true,
                        'bbb_response' => $result
                    ]
                ]);

                return response()->json([
                    'success' => true,
                    'meeting_id' => $meetingId,
                    'meeting' => $meeting->load(['course', 'creator']),
                    'attendee_password' => $attendeePassword,
                    'moderator_password' => $moderatorPassword,
                    'data' => $result
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Failed to create meeting',
                'data' => $result
            ], 400);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the meeting'
            ], 500);
        }
    }

    /**
     * Join a meeting
     */
    public function joinMeeting(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'meeting_id' => ['required', 'string', 'max:255'],
            'user_name' => ['required', 'string', 'max:255'],
            // don't accept arbitrary passwords from clients — use stored passwords
            'password' => ['nullable', 'string', 'max:50'],
            'is_moderator' => ['nullable', 'boolean'],
            'user_id' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $meetingId = $validated['meeting_id'];

            // Always fetch meeting data from our DB to determine correct passwords/params
            $dbMeeting = Meeting::with(['course.teacher'])->where('meeting_id', $meetingId)->first();
            if (!$dbMeeting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meeting not found in database',
                    'code' => 'MEETING_NOT_FOUND'
                ], 404);
            }

            $isModerator = $validated['is_moderator'] ?? false;

            // Authorization: only the course teacher or a confirmed student may join
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required to join meeting',
                    'code' => 'AUTH_REQUIRED'
                ], 401);
            }

            $isTeacher = false;
            $isStudent = false;

            // Check if the user is the teacher for the course
            if ($dbMeeting->course && $dbMeeting->course->teacher) {
                // Teacher.user_id points to users.id
                if ($dbMeeting->course->teacher->user_id === $user->id) {
                    $isTeacher = true;
                }
            }

            // Check if the user is a confirmed student enrollment for the course
            if (!$isTeacher) {
                $student = \App\Models\Student::where('user_id', $user->id)->first();
                if ($student && $dbMeeting->course_id) {
                    $enrolled = \App\Models\CourseEnrollment::where('course_id', $dbMeeting->course_id)
                        ->where('student_id', $student->id)
                        ->where('status', 'confirmed')
                        ->exists();

                    if ($enrolled) {
                        $isStudent = true;
                    }
                }
            }

            if (!($isTeacher || $isStudent)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to join this meeting',
                    'code' => 'NOT_AUTHORIZED'
                ], 403);
            }

            // Determine the password to use based on role — do not trust client-supplied password
            $passwordToUse = $isModerator ? $dbMeeting->moderator_password : $dbMeeting->attendee_password;

            // Check if meeting is running
            $isRunning = $this->bbbService->isMeetingRunning($meetingId);

            if (!$isRunning) {
                if (!$isModerator) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Meeting is not currently running. Please wait for the teacher to start the meeting.',
                        'code' => 'MEETING_NOT_RUNNING'
                    ], 400);
                }

                // Try to recreate the meeting using stored params (include meeting name from metadata)
                $createParams = [
                    'meetingID' => $dbMeeting->meeting_id,
                    'name' => $dbMeeting->metadata['meeting_name'] ?? $dbMeeting->meeting_id,
                    'attendeePW' => $dbMeeting->attendee_password,
                    'moderatorPW' => $dbMeeting->moderator_password,
                    'record' => $dbMeeting->is_recording ? 'true' : 'false',
                ];

                if ($dbMeeting->max_participants) {
                    $createParams['maxParticipants'] = $dbMeeting->max_participants;
                }

                if ($dbMeeting->duration) {
                    $createParams['duration'] = $dbMeeting->duration;
                }

                if ($dbMeeting->metadata && isset($dbMeeting->metadata['welcome_message'])) {
                    $createParams['welcome'] = $dbMeeting->metadata['welcome_message'];
                }

                $createResult = $this->bbbService->createMeeting($createParams);

                // If BBB explicitly refuses because the meeting was forcibly ended, surface that error
                if (isset($createResult['returncode']) && $createResult['returncode'] === 'FAILED') {
                    $msg = $createResult['message'] ?? 'Failed to create meeting on server';
                    if (str_contains(strtolower($msg), 'forcibly')) {
                        return response()->json([
                            'success' => false,
                            'message' => 'This meeting has been forcibly ended on the server and cannot be restarted. Please contact support or create a new meeting.',
                            'code' => 'MEETING_FORCIBLY_ENDED',
                            'detail' => $msg
                        ], 400);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $msg,
                        'code' => 'MEETING_CREATE_FAILED',
                        'detail' => $createResult
                    ], 400);
                }

                // Mark in DB as running if creation succeeded
                if (isset($createResult['returncode']) && $createResult['returncode'] === 'SUCCESS') {
                    $dbMeeting->update(['status' => 'running']);
                }
            }

            $options = [];
            if (isset($validated['user_id'])) {
                $options['userID'] = $validated['user_id'];
            }

            if ($isModerator) {
                $options['role'] = 'MODERATOR';
            }

            // Build join URL using the stored password for the role
            $joinUrl = $this->bbbService->joinMeeting(
                $meetingId,
                $validated['user_name'],
                $passwordToUse,
                $options
            );

            return response()->json([
                'success' => true,
                'join_url' => $joinUrl,
                'meeting_id' => $meetingId
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate join URL: ' . $e->getMessage(),
                'code' => 'JOIN_ERROR'
            ], 500);
        }
    }

    /**
     * Get meeting information
     */
    public function getMeetingInfo(string $meetingId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'moderator_password' => ['required', 'string', 'max:50'],
        ]);

        try {
            $result = $this->bbbService->getMeetingInfo(
                $meetingId,
                $validated['moderator_password']
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve meeting information'
            ], 500);
        }
    }

    /**
     * End a meeting
     */
    public function endMeeting(string $meetingId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'moderator_password' => ['required', 'string', 'max:50'],
        ]);

        try {
            $result = $this->bbbService->endMeeting(
                $meetingId,
                $validated['moderator_password']
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to end meeting'
            ], 500);
        }
    }

    /**
     * Get all meetings
     */
    public function getMeetings(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'course_id' => ['nullable', 'exists:courses,id'],
                'teacher_id' => ['nullable', 'exists:teachers,id'],
                'student_id' => ['nullable', 'exists:students,id'],
                'status' => ['nullable', 'in:scheduled,running,ended'],
                'include_bbb_data' => ['nullable', 'boolean']
            ]);

            // Query database meetings
            $query = Meeting::with(['course', 'creator']);

            if (isset($validated['course_id'])) {
                $query->forCourse($validated['course_id']);
            }

            if (isset($validated['schedule_id'])) {
                $query->forSchedule($validated['schedule_id']);
            }

            if (isset($validated['status'])) {
                $query->where('status', $validated['status']);
            }

            $meetings = $query->orderBy('created_at', 'desc')->get();

            $response = [
                'success' => true,
                'meetings' => $meetings
            ];

            // Optionally include BigBlueButton server data
            if ($validated['include_bbb_data'] ?? false) {
                $bbbResult = $this->bbbService->getMeetings();
                $response['bbb_data'] = $bbbResult;
            }

            return response()->json($response);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve meetings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if meeting is running
     */
    public function isMeetingRunning(string $meetingId): JsonResponse
    {
        try {
            $isRunning = $this->bbbService->isMeetingRunning($meetingId);

            return response()->json([
                'success' => true,
                'is_running' => $isRunning
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check meeting status'
            ], 500);
        }
    }

    /**
     * Get recordings
     */
    public function getRecordings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'meeting_id' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $result = $this->bbbService->getRecordings($validated['meeting_id'] ?? null);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve recordings'
            ], 500);
        }
    }

    /**
     * Delete recordings
     */
    public function deleteRecordings(string $recordId): JsonResponse
    {
        try {
            $result = $this->bbbService->deleteRecordings($recordId);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete recording'
            ], 500);
        }
    }

    /**
     * Start or restart a meeting (for moderators)
     */
    public function startMeeting(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'meeting_id' => ['required', 'string', 'max:255'],
        ]);

        try {
            $meetingId = $validated['meeting_id'];
            $dbMeeting = Meeting::where('meeting_id', $meetingId)->first();

            if (!$dbMeeting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meeting not found in database'
                ], 404);
            }

            // Check if meeting is already running
            $isRunning = $this->bbbService->isMeetingRunning($meetingId);
            
            if ($isRunning) {
                return response()->json([
                    'success' => true,
                    'message' => 'Meeting is already running',
                    'meeting_id' => $meetingId
                ]);
            }

            // Create/restart the meeting
            $createParams = [
                'name' => $dbMeeting->metadata['meeting_name'] ?? $dbMeeting->meeting_id,
                'meetingID' => $dbMeeting->meeting_id,
                'attendeePW' => $dbMeeting->attendee_password,
                'moderatorPW' => $dbMeeting->moderator_password,
                'record' => $dbMeeting->is_recording ? 'true' : 'false',
            ];

            // Add optional parameters
            if ($dbMeeting->max_participants) {
                $createParams['maxParticipants'] = $dbMeeting->max_participants;
            }

            if ($dbMeeting->duration) {
                $createParams['duration'] = $dbMeeting->duration;
            }

            if ($dbMeeting->metadata && isset($dbMeeting->metadata['welcome_message'])) {
                $createParams['welcome'] = $dbMeeting->metadata['welcome_message'];
            }

            $result = $this->bbbService->createMeeting($createParams);

            if ($result['returncode'] === 'SUCCESS') {
                // Update meeting status
                $dbMeeting->update(['status' => 'running']);

                return response()->json([
                    'success' => true,
                    'message' => 'Meeting started successfully',
                    'meeting_id' => $meetingId,
                    'data' => $result
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to start meeting',
                'data' => $result
            ], 400);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start meeting: ' . $e->getMessage()
            ], 500);
        }
    }
}