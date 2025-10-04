<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Student;
use App\Models\CourseEnrollment;
use App\Events\StudentEnrolled;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CourseEnrollmentController extends Controller
{
    public function enroll(Request $request, Course $course)
    {
        $validated = $request->validate([
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // Check if course is active and validated
        if (!$course->is_active || !$course->is_validated) {
            return response()->json(['message' => 'Course is not available for enrollment'], 400);
        }

        // Check if student is already enrolled
        $existingEnrollment = CourseEnrollment::where('course_id', $course->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existingEnrollment) {
            // If enrollment was cancelled, reactivate it
            if ($existingEnrollment->isCancelled() && $existingEnrollment->cancelled_at !== null) {
                $existingEnrollment->update([
                    'status' => 'confirmed',
                    'cancelled_at' => null,
                    'amount_paid' => $validated['amount_paid'] ?? $course->price_per_student,
                    'metadata' => array_merge($existingEnrollment->metadata ?? [], [
                        'reactivated_at' => now(),
                        'payment_method' => $validated['payment_method'] ?? null,
                        'notes' => $validated['notes'] ?? null,
                    ])
                ]);

                // Fire the StudentEnrolled event for reactivated enrollment
                StudentEnrolled::dispatch($existingEnrollment);

                return response()->json([
                    'message' => 'Successfully reactivated enrollment in course',
                    'enrollment' => $existingEnrollment->load(['course', 'student.user'])
                ], 200);
            }

            // If enrollment is still active, return conflict
            return response()->json([
                'message' => 'Already enrolled in this course',
                'enrollment' => $existingEnrollment
            ], 409);
        }

        // Check if course has available spots
        $currentEnrollments = $course->enrollments()->confirmed()->count();
        if ($currentEnrollments >= $course->max_students) {
            return response()->json(['message' => 'Course is full'], 400);
        }

        // Create enrollment
        DB::beginTransaction();
        
        try {
            $enrollment = CourseEnrollment::create([
                'course_id' => $course->id,
                'student_id' => $student->id,
                'status' => 'confirmed', // Auto-confirm for now
                'enrolled_at' => now(),
                'confirmed_at' => now(),
                'amount_paid' => $validated['amount_paid'] ?? $course->price_per_student,
                'metadata' => [
                    'payment_method' => $validated['payment_method'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ]
            ]);

            // Fire the StudentEnrolled event
            StudentEnrolled::dispatch($enrollment);

            DB::commit();

            return response()->json([
                'message' => 'Successfully enrolled in course',
                'enrollment' => $enrollment->load(['course', 'student.user'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to enroll in course'], 500);
        }
    }

    public function unenroll(Request $request, Course $course)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $enrollment = CourseEnrollment::where('course_id', $course->id)
            ->where('student_id', $student->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Not enrolled in this course'], 404);
        }

        // Cancel the enrollment
        $enrollment->cancel();

        // Also cancel any associated meetings that were linked to this enrollment via metadata
        // We store enrollment_id in meeting.metadata when assigning meetings to enrollments.
        $enrollment->course->meetings()
            ->whereRaw("JSON_EXTRACT(metadata, '$.enrollment_id') = ?", [$enrollment->id])
            ->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Successfully unenrolled from course',
            'enrollment' => $enrollment
        ]);
    }

    public function myEnrollments(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $enrollments = $student->enrollments()
            ->with(['course.subject', 'course.teacher.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'enrollments' => $enrollments->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'course' => [
                        'id' => $enrollment->course->id,
                        'title' => $enrollment->course->title,
                        'subject' => $enrollment->course->subject,
                        'proficiency_level' => $enrollment->course->proficiency_level ?? null,
                        'description' => $enrollment->course->description,
                        'thumbnail_url' => $enrollment->course->thumbnail_url ?? null,
                        'price_per_student' => $enrollment->course->price_per_student ?? null,
                        'count_session' => $enrollment->course->count_session ?? null,
                        'duration_session' => $enrollment->course->duration_session ?? null,
                        'min_students' => $enrollment->course->min_students ?? null,
                        'max_students' => $enrollment->course->max_students ?? null,
                        'schedules' => $enrollment->course->schedules ?? null,
                        'is_active' => $enrollment->course->is_active ?? null,
                        'is_validated' => $enrollment->course->is_validated ?? null,
                        'created_at' => $enrollment->course->created_at ?? null,
                        'teacher' => [
                            'id' => $enrollment->course->teacher->id,
                            'first_name' => $enrollment->course->teacher->first_name,
                            'last_name' => $enrollment->course->teacher->last_name,
                        ]
                    ]
                ];
            })
        ]);
    }

    public function courseEnrollments(Request $request, Course $course)
    {
        // Only allow course teacher or admin to view enrollments
        $user = Auth::user();
        // $teacher = $user->teacher;

        // if (!$teacher || $course->teacher_id !== $teacher->id) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }

        $enrollments = $course->enrollments()
            ->with(['student.user', 'course'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'thumbnail_url' => $course->thumbnail_url,
            ],
            'enrollments' => $enrollments->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'confirmed_at' => $enrollment->confirmed_at,
                    'amount_paid' => $enrollment->amount_paid,
                    'student' => [
                        'id' => $enrollment->student->id,
                        'name' => $enrollment->student->user->first_name . ' ' . $enrollment->student->user->last_name,
                        'email' => $enrollment->student->user->email,
                    ]
                ];
            })
        ], 200);
    }
}
