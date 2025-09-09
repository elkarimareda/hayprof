<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific teacher
     */
    public function getTeacherReviews(Request $request, int $teacherId): JsonResponse
    {
        $teacher = Teacher::findOrFail($teacherId);
        
        $reviews = $teacher->getReviewsWithStudents()
            ->paginate($request->get('per_page', 10));

        $statistics = [
            'average_rating' => $teacher->getAverageRating(),
            'total_reviews' => $teacher->getTotalReviews(),
            'rating_distribution' => $teacher->getRatingDistribution()
        ];

        return response()->json([
            'reviews' => $reviews,
            'statistics' => $statistics
        ]);
    }

    /**
     * Create a new review (students only)
     */
    public function store(Request $request): JsonResponse
    {
        // Ensure user is authenticated and is a student
        $user = Auth::user();
        if (!$user || !$user->student) {
            return response()->json(['error' => 'Only students can leave reviews'], 403);
        }

        // Validate request
        $validatedData = $request->validate(Review::validationRules());

        // Check if student has already reviewed this teacher for this lesson
        $student = $user->student;
        $existingReview = $student->hasReviewedTeacher(
            $validatedData['teacher_id'], 
            $validatedData['lesson_date'] ?? null
        );

        if ($existingReview) {
            return response()->json([
                'error' => 'You have already reviewed this teacher for this lesson'
            ], 422);
        }

        // Verify teacher exists
        $teacher = Teacher::findOrFail($validatedData['teacher_id']);

        // Create review
        $review = Review::create([
            'teacher_id' => $validatedData['teacher_id'],
            'student_id' => $student->id,
            'rating' => $validatedData['rating'],
            'comment' => $validatedData['comment'] ?? null,
            'lesson_date' => $validatedData['lesson_date'] ?? null,
            'is_verified' => false, // Will be verified by admin/system
            'is_approved' => true // Auto-approve for now
        ]);

        $review->load(['student.user', 'teacher.user']);

        return response()->json([
            'message' => 'Review created successfully',
            'review' => $review
        ], 201);
    }

    /**
     * Update a review (only by the student who created it)
     */
    public function update(Request $request, int $reviewId): JsonResponse
    {
        $user = Auth::user();
        if (!$user || !$user->student) {
            return response()->json(['error' => 'Only students can update reviews'], 403);
        }

        $review = Review::findOrFail($reviewId);

        // Ensure the review belongs to the current student
        if ($review->student_id !== $user->student->id) {
            return response()->json(['error' => 'You can only update your own reviews'], 403);
        }

        // Validate request
        $validatedData = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'sometimes|nullable|string|max:1000'
        ]);

        $review->update($validatedData);
        $review->load(['student.user', 'teacher.user']);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review
        ]);
    }

    /**
     * Delete a review (only by the student who created it)
     */
    public function destroy(int $reviewId): JsonResponse
    {
        $user = Auth::user();
        if (!$user || !$user->student) {
            return response()->json(['error' => 'Only students can delete reviews'], 403);
        }

        $review = Review::findOrFail($reviewId);

        // Ensure the review belongs to the current student
        if ($review->student_id !== $user->student->id) {
            return response()->json(['error' => 'You can only delete your own reviews'], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Get reviews by current student
     */
    public function getMyReviews(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user || !$user->student) {
            return response()->json(['error' => 'Only students can view their reviews'], 403);
        }

        $reviews = $user->student->reviews()
            ->with(['teacher.user'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($reviews);
    }

    /**
     * Admin endpoint to approve/disapprove reviews
     */
    public function moderateReview(Request $request, int $reviewId): JsonResponse
    {
        // This would require admin authentication
        $request->validate([
            'is_approved' => 'required|boolean',
            'is_verified' => 'sometimes|boolean'
        ]);

        $review = Review::findOrFail($reviewId);
        
        $review->update([
            'is_approved' => $request->is_approved,
            'is_verified' => $request->is_verified ?? $review->is_verified
        ]);

        return response()->json([
            'message' => 'Review moderated successfully',
            'review' => $review
        ]);
    }
}
