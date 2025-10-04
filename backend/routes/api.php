<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseEnrollmentController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SocialAuthController;
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
  
  // Social Authentication Routes
  Route::prefix('auth/social')->group(function () {
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider'])
        ->where('provider', 'google|facebook|twitter|github');
    Route::get('/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback'])
        ->where('provider', 'google|facebook|twitter|github');
  });
  
  Route::post('/upload', [MediaController::class, 'upload']);
  Route::get('/media/config', [MediaController::class, 'config']);

    // Reference data endpoints (public)
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{subject}', [SubjectController::class, 'show']);
  Route::get('/languages', [LanguageController::class, 'index']);
  Route::get('/languages/{id}', [LanguageController::class, 'show']);

  // Public course browsing
    // Use the unified index with ?status=validated
    Route::get('/courses/validated', [CourseController::class, 'index']);
  Route::get('/courses/{id}', [CourseController::class, 'show']);

  // Public teacher browsing
  Route::get('/teachers', [TeacherController::class, 'index']);
  Route::get('/teachers/{id}', [TeacherController::class, 'profile']);
  Route::get('/teachers/{id}/reviews', [ReviewController::class, 'getTeacherReviews']);

  

  Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth/social')->group(function () {
        Route::post('/{provider}/link', [SocialAuthController::class, 'linkAccount'])
            ->where('provider', 'google|facebook|twitter|github');
        Route::delete('/{provider}/unlink', [SocialAuthController::class, 'unlinkAccount'])
            ->where('provider', 'google|facebook|twitter|github');
    });
    Route::post('/user/upload', [MediaController::class, 'upload']);
    Route::prefix('bigbluebutton')
        ->middleware(['throttle:30,1'])
        ->group(function () {
            Route::post('/meetings', [MeetingController::class, 'createMeeting']);
            Route::post('/meetings/join', [MeetingController::class, 'joinMeeting']);
            Route::post('/meetings/{meetingId}/start', [MeetingController::class, 'startMeeting'])
                ->whereAlphaNumeric('meetingId');
            Route::get('/meetings/{meetingId}/info', [MeetingController::class, 'getMeetingInfo'])
                ->whereAlphaNumeric('meetingId');
            Route::delete('/meetings/{meetingId}', [MeetingController::class, 'endMeeting'])
                ->whereAlphaNumeric('meetingId');
            Route::get('/meetings', [MeetingController::class, 'getMeetings']);
            Route::get('/meetings/{meetingId}/status', [MeetingController::class, 'isMeetingRunning'])
                ->whereAlphaNumeric('meetingId');
            Route::get('/recordings', [MeetingController::class, 'getRecordings']);
            Route::delete('/recordings/{recordId}', [MeetingController::class, 'deleteRecordings'])
                ->whereAlphaNumeric('recordId');
        });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/teacher/onboarding', [AuthController::class, 'completeTeacherOnboarding']);

    Route::get('/teacher/profile/{id}', [TeacherController::class, 'profile']);
    Route::get('/student/profile/{id}', [StudentController::class, 'profile']);
    
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
            return app(MeetingController::class)->getMeetings($request);
        });
        Route::post('/meetings', function ($courseId, Request $request) {
            $request->merge(['course_id' => $courseId]);
            return app(MeetingController::class)->createMeeting($request);
        });
    });

    Route::prefix('teachers/{teacher}')->group(function () {
        Route::get('/meetings', function ($teacherId, Request $request) {
            $request->merge(['teacher_id' => $teacherId]);
            return app(MeetingController::class)->getMeetings($request);
        });
    });

    Route::prefix('students/{student}')->group(function () {
        Route::get('/meetings', function ($studentId, Request $request) {
            $request->merge(['student_id' => $studentId]);
            return app(MeetingController::class)->getMeetings($request);
        });
    });

    // Course enrollment routes
    Route::post('/courses/{course}/enroll', [CourseEnrollmentController::class, 'enroll']);
    Route::delete('/courses/{course}/enroll', [CourseEnrollmentController::class, 'unenroll']);
    Route::get('/my-enrollments', [CourseEnrollmentController::class, 'myEnrollments']);
    Route::get('/courses/{course}/enrollments', [CourseEnrollmentController::class, 'courseEnrollments']);

    // Admin-only reference data management
    Route::middleware('admin')->group(function () {
        Route::get('/courses', [CourseController::class, 'index']);
        
        Route::post('/subjects', [SubjectController::class, 'store']);
        Route::put('/subjects/{subject}', [SubjectController::class, 'update']);
        Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

        Route::post('/languages', [LanguageController::class, 'store']);
        Route::put('/languages/{id}', [LanguageController::class, 'update']);
        Route::delete('/languages/{id}', [LanguageController::class, 'destroy']);

        // Course validation management
    // Use the unified index with ?status=pending
    Route::get('/courses/pending-validation', [CourseController::class, 'index']);
    Route::post('/courses/{course}/validate', [CourseController::class, 'reviewCourse'])->defaults('action', 'validate');
    Route::post('/courses/{course}/reject', [CourseController::class, 'reviewCourse'])->defaults('action', 'reject');

        // Review moderation
        Route::put('/reviews/{id}/moderate', [ReviewController::class, 'moderateReview']);

        // Student browsing
        Route::get('/students', [StudentController::class, 'index']);
    });
  });
});
