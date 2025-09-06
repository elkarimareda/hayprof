<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
  public function store(Request $request)
  {
    $validated = $request->validate([
      'title' => 'required|string|max:100',
      'subject' => 'required|exists:subjects,id',
      'proficiency_level' => 'nullable|in:beginner,elementary,intermediate,upper_intermediate,advanced,proficient',
      'description' => 'required|string|max:500',
      'thumbnail' => 'required|file|image|max:5120', // 5MB max
      'price_per_student' => 'required|numeric|min:1',
      'count_session' => 'required|integer|min:1|max:20',
      'duration_session' => 'required|numeric|min:0.5|max:8',
      'min_students' => 'required|integer|min:1',
      'max_students' => 'required|integer|min:1',
      'schedule' => 'required|array|min:1',
      'schedule.*.date' => 'required|date_format:Y-m-d\\TH:i',
    ]);

    // Validate max_students >= min_students
    if ($validated['max_students'] < $validated['min_students']) {
      return response()->json([
        'message' => 'Maximum students must be greater than or equal to minimum students',
        'errors' => [
          'max_students' => ['Maximum students must be greater than or equal to minimum students']
        ]
      ], 422);
    }

    // Validate that schedule count matches count_session
    // Filter out empty schedule slots
    $validSchedules = array_filter($validated['schedule'], function ($schedule) {
      return !empty($schedule['date']) && trim($schedule['date']) !== '';
    });

    $scheduleCount = count($validSchedules);
    $sessionCount = (int) $validated['count_session'];

    if ($scheduleCount !== $sessionCount) {
      Log::error('Schedule validation failed', [
        'schedule_count' => $scheduleCount,
        'schedule_count_type' => gettype($scheduleCount),
        'count_session' => $sessionCount,
        'count_session_type' => gettype($sessionCount),
        'count_session_original' => $validated['count_session'],
        'total_schedule_slots' => count($validated['schedule']),
        'valid_schedule_slots' => $scheduleCount,
        'schedule_data' => $validated['schedule']
      ]);

      return response()->json([
        'message' => "Number of valid schedule slots ($scheduleCount) must match the session count ($sessionCount)",
        'errors' => [
          'schedule' => ["Number of valid schedule slots ($scheduleCount) must match the session count ($sessionCount)"]
        ],
        'debug' => [
          'schedule_count' => $scheduleCount,
          'session_count' => $sessionCount,
          'schedule_count_type' => gettype($scheduleCount),
          'session_count_type' => gettype($sessionCount)
        ]
      ], 422);
    }

    // Update validated schedule to only include valid schedules
    $validated['schedule'] = array_values($validSchedules);

    // Get the authenticated teacher
    $teacher = Auth::user()->teacher;
    if (!$teacher) {
      return response()->json(['message' => 'Teacher profile not found'], 404);
    }

    // Create the course first
    $course = $teacher->courses()->create([
      'subject_id' => $validated['subject'],
      'title' => $validated['title'],
      'description' => $validated['description'],
      'proficiency_level' => $validated['proficiency_level'],
      'price_per_student' => $validated['price_per_student'],
      'count_session' => $validated['count_session'],
      'duration_session' => $validated['duration_session'],
      'min_students' => $validated['min_students'],
      'max_students' => $validated['max_students'],
      'is_validated' => false, // Requires validation by default
    ]);

    // Handle thumbnail upload and attach to course
    if ($request->hasFile('thumbnail')) {
      $file = $request->file('thumbnail');
      $mime = $file->getMimeType();
      $path = $file->store('uploads/course-thumbnails');

      $course->medias()->create([
        'type' => 'photo',
        'media_purpose' => 'course_thumbnail',
        'file_path' => $path,
        'mime_type' => $mime,
        'size' => $file->getSize(),
        'thumbnail_path' => null,
      ]);
    }

    // Create course schedules
    $course->syncSchedules($validated['schedule'], $validated['duration_session']);

    // Load relationships for response
    $course->load(['subject', 'schedules']);

    return response()->json([
      'message' => 'Course created successfully and is pending validation',
      'course' => [
        'id' => $course->id,
        'title' => $course->title,
        'subject' => $course->subject,
        'proficiency_level' => $course->proficiency_level,
        'description' => $course->description,
        'thumbnail' => $course->thumbnail,
        'price_per_student' => $course->price_per_student,
        'count_session' => $course->count_session,
        'duration_session' => $course->duration_session,
        'min_students' => $course->min_students,
        'max_students' => $course->max_students,
        'schedules' => $course->schedules,
        'is_active' => $course->is_active,
        'is_validated' => $course->is_validated,
        'created_at' => $course->created_at,
      ]
    ], 201);
  }

  public function index(Request $request)
  {
    $teacher = Auth::user()->teacher;
    if (!$teacher) {
      return response()->json(['message' => 'Teacher profile not found'], 404);
    }

    $courses = $teacher->courses()
      ->with(['subject', 'schedules'])
      ->active()
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json([
      'courses' => $courses->map(function ($course) {
        return [
          'id' => $course->id,
          'title' => $course->title,
          'subject' => $course->subject,
          'proficiency_level' => $course->proficiency_level,
          'description' => $course->description,
          'thumbnail' => $course->thumbnail,
          'price_per_student' => $course->price_per_student,
          'count_session' => $course->count_session,
          'duration_session' => $course->duration_session,
          'min_students' => $course->min_students,
          'max_students' => $course->max_students,
          'schedules' => $course->schedules,
          'is_active' => $course->is_active,
          'is_validated' => $course->is_validated,
          'created_at' => $course->created_at,
        ];
      })
    ]);
  }

  // Admin methods for course validation
  public function pendingValidation(Request $request)
  {
    $courses = Course::with(['subject', 'schedules', 'teacher.user'])
      ->pendingValidation()
      ->orderBy('created_at', 'asc')
      ->get();

    return response()->json([
      'courses' => $courses->map(function ($course) {
        return [
          'id' => $course->id,
          'title' => $course->title,
          'subject' => $course->subject,
          'proficiency_level' => $course->proficiency_level,
          'description' => $course->description,
          'thumbnail' => $course->thumbnail,
          'price_per_student' => $course->price_per_student,
          'count_session' => $course->count_session,
          'duration_session' => $course->duration_session,
          'min_students' => $course->min_students,
          'max_students' => $course->max_students,
          'schedules' => $course->schedules,
          'teacher' => [
            'id' => $course->teacher->id,
            'name' => $course->teacher->user->first_name . ' ' . $course->teacher->user->last_name,
            'email' => $course->teacher->user->email,
          ],
          'is_active' => $course->is_active,
          'is_validated' => $course->is_validated,
          'created_at' => $course->created_at,
        ];
      })
    ]);
  }

  public function validateCourse(Request $request, Course $course)
  {
    $validated = $request->validate([
      'validation_notes' => 'nullable|string|max:1000',
    ]);

    $course->validate(Auth::user(), $validated['validation_notes'] ?? null);

    return response()->json([
      'message' => 'Course validated successfully',
      'course' => [
        'id' => $course->id,
        'title' => $course->title,
        'is_validated' => $course->is_validated,
        'validated_at' => $course->validated_at,
        'validation_notes' => $course->validation_notes,
      ]
    ]);
  }

  public function rejectCourse(Request $request, Course $course)
  {
    $validated = $request->validate([
      'validation_notes' => 'required|string|max:1000',
    ]);

    $course->reject(Auth::user(), $validated['validation_notes']);

    return response()->json([
      'message' => 'Course rejected',
      'course' => [
        'id' => $course->id,
        'title' => $course->title,
        'is_validated' => $course->is_validated,
        'validated_at' => $course->validated_at,
        'validation_notes' => $course->validation_notes,
      ]
    ]);
  }

  public function validated(Request $request)
  {
    $query = Course::validated()->with(['subject', 'teacher.user', 'medias']);

    // Filter by subject if provided
    if ($request->has('subject_id')) {
      $query->where('subject_id', $request->subject_id);
    }
    $courses = $query->get()->map(function ($course) {
      return [
        'id' => $course->id,
        'title' => $course->title,
        'subject' => [
          'id' => $course->subject->id,
          'name' => $course->subject->name,
          'code' => $course->subject->code,
        ],
        'proficiency_level' => $course->proficiency_level,
        'description' => $course->description,
        'thumbnail_url' => $course->thumbnail_url,
        'price_per_student' => $course->price_per_student,
        'count_session' => $course->count_session,
        'duration_session' => $course->duration_session,
        'min_students' => $course->min_students,
        'max_students' => $course->max_students,
        'teacher' => [
          'id' => $course->teacher->id,
          'first_name' => $course->teacher->first_name,
          'last_name' => $course->teacher->last_name,
        ],
        'is_active' => $course->is_active,
        'is_validated' => $course->is_validated,
        'created_at' => $course->created_at,
      ];
    });

    return response()->json([
      'courses' => $courses
    ]);
  }
}
