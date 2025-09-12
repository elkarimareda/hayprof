<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BigBlueButtonController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseEnrollmentController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('bigbluebutton')
    ->middleware(['throttle:30,1'])
    ->group(function () {
        Route::post('/meetings', [BigBlueButtonController::class, 'createMeeting']);
        Route::post('/meetings/join', [BigBlueButtonController::class, 'joinMeeting']);
        Route::get('/meetings/{meetingId}/info', [BigBlueButtonController::class, 'getMeetingInfo'])
            ->whereAlphaNumeric('meetingId');
        Route::delete('/meetings/{meetingId}', [BigBlueButtonController::class, 'endMeeting'])
            ->whereAlphaNumeric('meetingId');
        Route::get('/meetings', [BigBlueButtonController::class, 'getMeetings']);
        Route::get('/meetings/{meetingId}/status', [BigBlueButtonController::class, 'isMeetingRunning'])
            ->whereAlphaNumeric('meetingId');
        Route::get('/recordings', [BigBlueButtonController::class, 'getRecordings']);
        Route::delete('/recordings/{recordId}', [BigBlueButtonController::class, 'deleteRecordings'])
            ->whereAlphaNumeric('recordId');
    });

Route::middleware('api')->group(function () {
  Route::get('/test-bbb', function (App\Services\BigBlueButtonService $bbb) {
    try {
        $meetings = $bbb->getMeetings();
        return response()->json(['status' => 'connected', 'data' => $meetings]);
    } catch (Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
    }
});
  Route::post('/register', [AuthController::class, 'register']);
  Route::post('/login', [AuthController::class, 'login']);
  Route::post('/upload', [MediaController::class, 'upload']);
  Route::get('/media/config', [MediaController::class, 'config']);

  // Reference data endpoints (public)
  Route::get('/subjects', [SubjectController::class, 'index']);
  Route::get('/subjects/{id}', [SubjectController::class, 'show']);
  Route::get('/languages', [LanguageController::class, 'index']);
  Route::get('/languages/{id}', [LanguageController::class, 'show']);

  // Public course browsing
  Route::get('/courses/validated', [CourseController::class, 'validated']);
  Route::get('/courses/{id}', [CourseController::class, 'show']);

  // Public teacher browsing
  Route::get('/teachers', [TeacherController::class, 'index']);
  Route::get('/teachers/{id}', [TeacherController::class, 'profile']);
  Route::get('/teachers/{id}/reviews', [TeacherController::class, 'getTeacherReviews']);

  // Public student browsing
  Route::get('/students', [StudentController::class, 'index']);

  Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/teacher/onboarding', [AuthController::class, 'completeTeacherOnboarding']);

    Route::get('/teacher/profile/{id}', [TeacherController::class, 'profile']);
    Route::get('/student/profile/{id}', [StudentController::class, 'profile']);
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);

    // Review routes (authenticated users)
    Route::get('/reviews/my', [ReviewController::class, 'getMyReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // BigBlueButton meeting routes for authenticated users
    Route::prefix('courses/{course}')->group(function () {
        Route::get('/meetings', function ($courseId, Request $request) {
            $request->merge(['course_id' => $courseId]);
            return app(BigBlueButtonController::class)->getMeetings($request);
        });
        Route::post('/meetings', function ($courseId, Request $request) {
            $request->merge(['course_id' => $courseId]);
            return app(BigBlueButtonController::class)->createMeeting($request);
        });
    });

    Route::prefix('teachers/{teacher}')->group(function () {
        Route::get('/meetings', function ($teacherId, Request $request) {
            $request->merge(['teacher_id' => $teacherId]);
            return app(BigBlueButtonController::class)->getMeetings($request);
        });
    });

    Route::prefix('students/{student}')->group(function () {
        Route::get('/meetings', function ($studentId, Request $request) {
            $request->merge(['student_id' => $studentId]);
            return app(BigBlueButtonController::class)->getMeetings($request);
        });
    });

    // Course enrollment routes
    Route::post('/courses/{course}/enroll', [CourseEnrollmentController::class, 'enroll']);
    Route::delete('/courses/{course}/enroll', [CourseEnrollmentController::class, 'unenroll']);
    Route::get('/my-enrollments', [CourseEnrollmentController::class, 'myEnrollments']);
    Route::get('/courses/{course}/enrollments', [CourseEnrollmentController::class, 'courseEnrollments']);

    // Admin-only reference data management
    Route::middleware('admin')->group(function () {
      Route::post('/subjects', [SubjectController::class, 'store']);
      Route::put('/subjects/{id}', [SubjectController::class, 'update']);
      Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);

      Route::post('/languages', [LanguageController::class, 'store']);
      Route::put('/languages/{id}', [LanguageController::class, 'update']);
      Route::delete('/languages/{id}', [LanguageController::class, 'destroy']);

      // Course validation management
      Route::get('/courses/pending-validation', [CourseController::class, 'pendingValidation']);
      Route::post('/courses/{course}/validate', [CourseController::class, 'validateCourse']);
      Route::post('/courses/{course}/reject', [CourseController::class, 'rejectCourse']);

      // Review moderation
      Route::put('/reviews/{id}/moderate', [ReviewController::class, 'moderateReview']);
    });
  });
});
