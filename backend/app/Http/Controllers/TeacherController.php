<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
  public function index(Request $request)
  {
    $query = Teacher::with(['user', 'certifications', 'languages', 'medias'])
      ->where('onboarding_completed', true);

    // Filter by subject if provided
    if ($request->has('subject_id')) {
      $query->whereHas('courses', function ($courseQuery) use ($request) {
        $courseQuery->where('subject_id', $request->subject_id)
          ->where('is_validated', true);
      });
    }

    $teachers = $query->get()->map(function ($teacher) {
      $profilePhoto = $teacher->medias()->where('media_purpose', 'profile_photo')->first();
      $introVideo = $teacher->medias()->where('media_purpose', 'introduction_video')->first();

      return [
        'id' => $teacher->id,
        'first_name' => $teacher->first_name,
        'last_name' => $teacher->last_name,
        'country' => $teacher->country,
        'timezone' => $teacher->timezone,
        'pricing' => $teacher->pricing,
        'biography' => $teacher->biography,
        'onboarding_completed' => $teacher->onboarding_completed,
        'photo_url' => $profilePhoto ? $profilePhoto->url() : null,
        'video_url' => $introVideo ? $introVideo->url() : null,
        'user' => [
          'id' => $teacher->user->id,
          'name' => $teacher->user->name,
          'email' => $teacher->user->email,
        ],
        'certifications' => $teacher->certifications->map(function ($cert) {
          return [
            'id' => $cert->id,
            'subject' => $cert->subject,
            'certificate' => $cert->certificate,
          ];
        }),
        'languages' => $teacher->languages->map(function ($language) {
          return [
            'id' => $language->id,
            'name' => $language->name,
            'code' => $language->code,
            'proficiency_level' => $language->pivot->proficiency_level,
          ];
        }),
        'courses_count' => $teacher->courses()->where('is_validated', true)->count(),
        'subjects' => $teacher->courses()
          ->where('is_validated', true)
          ->with('subject')
          ->get()
          ->pluck('subject.name')
          ->unique()
          ->values(),
        'reviews' => [
          'average_rating' => $teacher->getAverageRating(),
          'total_reviews' => $teacher->getTotalReviews(),
        ]
      ];
    });

    return response()->json([
      'teachers' => $teachers
    ]);
  }

  public function profile(Request $request, $teacherId)
  {
    // Find teacher by ID with all related data
    $teacher = Teacher::with([
      'user',
      'certifications',
      'educations',
      'description',
      'availabilities',
      'languages',
      'medias',
      'courses.subject',
      'courses.schedules',
      'courses.medias'
    ])->find($teacherId);

    if (!$teacher) {
      return response()->json(['error' => 'Teacher not found'], 404);
    }

    $user = $teacher->user;

    // Get specific media URLs
    $profilePhoto = $teacher->medias()->where('media_purpose', 'profile_photo')->first();
    $introVideo = $teacher->medias()->where('media_purpose', 'introduction_video')->first();

    $response = [
      'id' => $user->id,
      'name' => $user->name,
      'email' => $user->email,
      'phone_number' => $user->phone_number,
      'user_type' => $user->user_type,
      'profile' => [
        'id' => $teacher->id,
        'user_id' => $teacher->user_id,
        'first_name' => $teacher->first_name,
        'last_name' => $teacher->last_name,
        'country' => $teacher->country,
        'birth_date' => $teacher->birth_date,
        'timezone' => $teacher->timezone,
        'pricing' => $teacher->pricing,
        'biography' => $teacher->biography,
        'onboarding_completed' => $teacher->onboarding_completed,
        'created_at' => $teacher->created_at,
        'updated_at' => $teacher->updated_at,

        // Media URLs
        'photo_url' => $profilePhoto ? $profilePhoto->url() : null,
        'video_url' => $introVideo ? $introVideo->url() : null,
        'thumbnail_video_url' => $introVideo ? $introVideo->thumbnail_path : null,

        // Related data
        'certifications' => $teacher->certifications->map(function ($cert) {
          return [
            'id' => $cert->id,
            'subject' => $cert->subject,
            'certificate' => $cert->certificate,
            'description' => $cert->description,
            'issue_by' => $cert->issue_by,
            'year_of_study_start' => $cert->year_of_study_start,
            'year_of_study_end' => $cert->year_of_study_end,
          ];
        }),

        'educations' => $teacher->educations->map(function ($edu) {
          return [
            'id' => $edu->id,
            'university' => $edu->university,
            'degree' => $edu->degree,
            'degree_type' => $edu->degree_type,
            'specialization' => $edu->specialization,
            'year_of_study_start' => $edu->year_of_study_start,
            'year_of_study_end' => $edu->year_of_study_end,
          ];
        }),

        'description' => $teacher->description ? [
          'id' => $teacher->description->id,
          'yourself' => $teacher->description->yourself,
          'experience' => $teacher->description->experience,
          'motivation' => $teacher->description->motivation,
          'headline' => $teacher->description->headline,
        ] : null,

        'languages' => $teacher->languages->map(function ($language) {
          return [
            'id' => $language->id,
            'name' => $language->name,
            'code' => $language->code,
            'native_name' => $language->native_name,
            'proficiency_level' => $language->pivot->proficiency_level,
          ];
        }),

        'courses' => $teacher->courses->map(function ($course) {
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
            'schedules' => $course->schedules->map(function ($schedule) {
              return [
                'id' => $schedule->id,
                'datetime_scheduled' => $schedule->datetime_scheduled,
                'time_of_session' => $schedule->time_of_session,
              ];
            }),
            'is_active' => $course->is_active,
            'is_validated' => $course->is_validated,
            'created_at' => $course->created_at,
          ];
        }),

        'reviews' => [
          'average_rating' => $teacher->getAverageRating(),
          'total_reviews' => $teacher->getTotalReviews(),
          'rating_distribution' => $teacher->getRatingDistribution(),
        ],
        'students' => $teacher->getAllEnrolledStudents(),

        'availabilities' => $teacher->availabilities->groupBy('day_of_week')->map(function ($daySlots, $day) {
          return $daySlots->map(function ($slot) {
            return [
              'id' => $slot->id,
              'day_of_week' => $slot->day_of_week,
              'start_time' => $slot->start_time,
              'end_time' => $slot->end_time,
            ];
          })->values();
        }),
      ]
    ];

    return response()->json($response);
  }
}
