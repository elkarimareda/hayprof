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
                        'teacher' => [
                            'id' => $enrollment->course->teacher->id,
                            'name' => $enrollment->course->teacher->user->first_name . ' ' . $enrollment->course->teacher->user->last_name,
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
        $teacher = $user->teacher;

        if (!$teacher || $course->teacher_id !== $teacher->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollments = $course->enrollments()
            ->with(['student.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
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
        ]);
    }
}
