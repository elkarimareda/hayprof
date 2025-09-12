<?php

namespace App\Http\Controllers;

use App\Services\BigBlueButtonService;
use App\Models\BigBlueButtonMeeting;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Exception;

class BigBlueButtonController extends Controller
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
            'name' => ['required', 'string', 'max:255'],
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
            'teacher_id' => ['nullable', 'exists:teachers,id'],
            'student_id' => ['nullable', 'exists:students,id'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ]);

        try {
            $meetingId = $validated['meeting_id'] ?? Str::uuid()->toString();
            $attendeePassword = $validated['attendee_password'] ?? Str::random(12);
            $moderatorPassword = $validated['moderator_password'] ?? Str::random(12);

            $params = [
                'name' => $validated['name'],
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
                // Save meeting to database
                $meeting = BigBlueButtonMeeting::create([
                    'meeting_id' => $meetingId,
                    'name' => $validated['name'],
                    'attendee_password' => $attendeePassword,
                    'moderator_password' => $moderatorPassword,
                    'created_by' => auth()->id() ?? 1, // Fallback to user ID 1 if not authenticated
                    'course_id' => $validated['course_id'] ?? null,
                    'teacher_id' => $validated['teacher_id'] ?? null,
                    'student_id' => $validated['student_id'] ?? null,
                    'is_recording' => $validated['record'] ?? false,
                    'max_participants' => $validated['max_participants'] ?? null,
                    'duration' => $validated['duration'] ?? null,
                    'scheduled_at' => isset($validated['scheduled_at']) ? $validated['scheduled_at'] : now(),
                    'status' => 'scheduled',
                    'metadata' => [
                        'welcome_message' => $validated['welcome_message'] ?? null,
                        'auto_start_recording' => $validated['auto_start_recording'] ?? false,
                        'allow_start_stop_recording' => $validated['allow_start_stop_recording'] ?? true,
                        'bbb_response' => $result
                    ]
                ]);

                return response()->json([
                    'success' => true,
                    'meeting_id' => $meetingId,
                    'meeting' => $meeting->load(['course', 'teacher', 'student']),
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
            'password' => ['required', 'string', 'max:50'],
            'is_moderator' => ['nullable', 'boolean'],
            'user_id' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $options = [];
            
            if (isset($validated['user_id'])) {
                $options['userID'] = $validated['user_id'];
            }

            if ($validated['is_moderator'] ?? false) {
                $options['role'] = 'MODERATOR';
            }

            $joinUrl = $this->bbbService->joinMeeting(
                $validated['meeting_id'],
                $validated['user_name'],
                $validated['password'],
                $options
            );

            return response()->json([
                'success' => true,
                'join_url' => $joinUrl
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate join URL'
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
            $query = BigBlueButtonMeeting::with(['course', 'teacher.user', 'student.user', 'creator']);

            if (isset($validated['course_id'])) {
                $query->forCourse($validated['course_id']);
            }

            if (isset($validated['teacher_id'])) {
                $query->forTeacher($validated['teacher_id']);
            }

            if (isset($validated['student_id'])) {
                $query->forStudent($validated['student_id']);
            }

            if (isset($validated['status'])) {
                $query->where('status', $validated['status']);
            }

            $meetings = $query->orderBy('scheduled_at', 'desc')->get();

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
                'message' => 'Failed to retrieve meetings'
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
}