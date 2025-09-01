<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
  public function register(Request $request)
  {
    // Custom validation
    $rules = [
      'name' => 'required|string|max:255',
      'email' => 'nullable|email|unique:users,email',
      'phone_number' => 'nullable|string|max:20|unique:users,phone_number',
      'user_type' => 'required|in:student,teacher',
      'password' => 'required|string|min:8|confirmed',
      'birth_date' => 'required|date|before:today',

      // Additional fields based on user type
      'biography' => 'required_if:user_type,teacher|string',
    ];

    $request->validate($rules);

    // Ensure at least one contact method is provided
    if (!$request->email && !$request->phone_number) {
      throw ValidationException::withMessages([
        'contact' => ['Either email or phone number is required.'],
      ]);
    }

    DB::beginTransaction();

    try {
      // Create user
      $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'phone_number' => $request->phone_number,
        'user_type' => $request->user_type,
        'password' => Hash::make($request->password),
      ]);

      // Create profile based on user type
      if ($user->isStudent()) {
        Student::create([
          'user_id' => $user->id,
          'birth_date' => $request->birth_date,
        ]);
      } else {
        Teacher::create([
          'user_id' => $user->id,
          'birth_date' => $request->birth_date,
          'biography' => $request->biography,
        ]);
      }

      $token = $user->createToken('auth-token', ['*'])->plainTextToken;

      DB::commit();

      return response()->json([
        'message' => 'Registration successful',
        'user' => [
          'id' => $user->id,
          'name' => $user->name,
          'email' => $user->email,
          'phone_number' => $user->phone_number,
          'user_type' => $user->user_type,
          'profile' => $user->profile,
        ],
        'token' => $token,
      ], 201);
    } catch (\Exception $e) {
      DB::rollBack();
      throw $e;
    }
  }

  public function login(Request $request)
  {
    $request->validate([
      'identifier' => 'required|string', // email or phone
      'password' => 'required|string',
    ]);

    // Find user by email or phone
    $user = User::findByIdentifier($request->identifier);

    if (!$user || !Hash::check($request->password, $user->password)) {
      throw ValidationException::withMessages([
        'identifier' => ['The provided credentials are incorrect.'],
      ]);
    }

    // Create token
    $token = $user->createToken('auth-token', ['*'])->plainTextToken;

    $response = [
      'message' => 'Login successful',
      'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'phone_number' => $user->phone_number,
        'user_type' => $user->user_type,
        'profile' => $user->profile,
      ],
      'token' => $token,
    ];

    // Add onboarding status for teachers
    if ($user->isTeacher()) {
      $response['user']['onboarding_completed'] = $user->profile->onboarding_completed ?? false;
    }

    return response()->json($response);
  }

  public function logout(Request $request)
  {
    $request->user()->currentAccessToken()->delete();

    return response()->json([
      'message' => 'Logout successful'
    ]);
  }

  public function user(Request $request)
  {
    $user = $request->user()->load($request->user()->user_type);

    $response = [
      'id' => $user->id,
      'name' => $user->name,
      'email' => $user->email,
      'phone_number' => $user->phone_number,
      'user_type' => $user->user_type,
      'profile' => $user->profile,
    ];

    // Add onboarding status for teachers
    if ($user->isTeacher()) {
      $response['onboarding_completed'] = $user->profile->onboarding_completed ?? false;
      $response['photo_url'] = $user->profile->photo_url ?? null;
    }

    return response()->json($response);
  }

  public function updateProfile(Request $request)
  {
    $user = $request->user();

    $rules = [
      'name' => 'sometimes|string|max:255',
      'email' => 'sometimes|email|unique:users,email,' . $user->id,
      'phone_number' => 'sometimes|string|max:20|unique:users,phone_number,' . $user->id,
      'birth_date' => 'sometimes|date|before:today',
    ];

    // Add user-type specific rules
    if ($user->isStudent()) {
    } else {
      $rules['biography'] = 'sometimes|string';
    }

    $validated = $request->validate($rules);

    DB::beginTransaction();

    try {
      // Update user
      $userFields = collect($validated)->only(['name', 'email', 'phone_number'])->toArray();
      if (!empty($userFields)) {
        $user->update($userFields);
      }

      // Update profile
      $profileFields = collect($validated)->except(['name', 'email', 'phone_number'])->toArray();
      if (!empty($profileFields)) {
        $user->profile->update($profileFields);
      }

      DB::commit();

      return response()->json([
        'message' => 'Profile updated successfully',
        'user' => [
          'id' => $user->id,
          'name' => $user->name,
          'email' => $user->email,
          'phone_number' => $user->phone_number,
          'user_type' => $user->user_type,
          'profile' => $user->fresh()->profile,
        ],
      ]);
    } catch (\Exception $e) {
      DB::rollBack();
      throw $e;
    }
  }

  public function completeTeacherOnboarding(Request $request)
  {
    $user = $request->user();

    if (!$user->isTeacher()) {
      return response()->json(['error' => 'Only teachers can complete onboarding'], 403);
    }

    $rules = [
      'firstname' => 'required|string|max:255',
      'lastname' => 'required|string|max:255',
      'country' => 'required|string|max:2',
      'birth_date' => 'required|date|before:today',
      'timezone' => 'required|string|max:255',
      'pricing' => 'required|integer|min:1',
      'photo' => 'required|integer|exists:media,id',
      'video' => 'required|integer|exists:media,id',
      'certifications' => 'required|array|min:1',
      'certifications.*.subject' => 'required|string|max:255',
      'certifications.*.certificate' => 'required|string|max:255',
      'certifications.*.description' => 'nullable|string',
      'certifications.*.issue_by' => 'nullable|string|max:255',
      'certifications.*.year_of_study_start' => 'required|string|size:4',
      'certifications.*.year_of_study_end' => 'required|string|size:4',
      'educations' => 'required|array|min:1',
      'educations.*.university' => 'required|string|max:255',
      'educations.*.degree' => 'required|string|max:255',
      'educations.*.degree_type' => 'required|string|max:255',
      'educations.*.specialization' => 'nullable|string|max:255',
      'educations.*.year_of_study_start' => 'required|string|size:4',
      'educations.*.year_of_study_end' => 'required|string|size:4',
      'description' => 'required|array',
      'description.yourself' => 'required|string',
      'description.experience' => 'required|string',
      'description.motivation' => 'required|string',
      'description.headline' => 'required|string',
      'availabilities' => 'required|array|min:1',
      'availabilities.*' => 'array',
      'availabilities.*.*.day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
      'availabilities.*.*.start_time' => 'required|string|date_format:H:i',
      'availabilities.*.*.end_time' => 'required|string|date_format:H:i',
    ];

    $validated = $request->validate($rules);

    DB::beginTransaction();

    try {
      // Update user basic info
      $user->update([
        'name' => $validated['firstname'] . ' ' . $validated['lastname'],
      ]);

      // Update teacher profile
      $teacher = $user->profile;
      $teacher->update([
        'first_name' => $validated['firstname'],
        'last_name' => $validated['lastname'],
        'country' => $validated['country'],
        'birth_date' => $validated['birth_date'],
        'timezone' => $validated['timezone'],
        'pricing' => $validated['pricing'],
      ]);

      // Sync certifications
      $teacher->syncCertifications($validated['certifications']);

      // Sync educations
      $teacher->syncEducations($validated['educations']);

      // Update description
      $teacher->upsertDescription($validated['description']);

      // Sync availabilities
      $teacher->syncAvailabilities($validated['availabilities']);

      // Associate media files - ensure only one of each type per teacher
      $photoMedia = Media::find($validated['photo']);
      $videoMedia = Media::find($validated['video']);

      if ($photoMedia) {
        // Check if teacher already has a profile photo and delete it
        $existingPhoto = Media::where('mediable_type', Teacher::class)
          ->where('mediable_id', $teacher->id)
          ->where('media_purpose', 'profile_photo')
          ->first();

        if ($existingPhoto) {
          // Delete old photo files from storage
          if ($existingPhoto->file_path && Storage::exists($existingPhoto->file_path)) {
            Storage::delete($existingPhoto->file_path);
          }
          if ($existingPhoto->thumbnail_path && Storage::exists($existingPhoto->thumbnail_path)) {
            Storage::delete($existingPhoto->thumbnail_path);
          }
          $existingPhoto->delete();
        }

        // Associate new photo
        $photoMedia->update([
          'mediable_type' => Teacher::class,
          'mediable_id' => $teacher->id,
        ]);
      }

      if ($videoMedia) {
        // Check if teacher already has an introduction video and delete it
        $existingVideo = Media::where('mediable_type', Teacher::class)
          ->where('mediable_id', $teacher->id)
          ->where('media_purpose', 'introduction_video')
          ->first();

        if ($existingVideo) {
          // Delete old video files from storage
          if ($existingVideo->file_path && Storage::exists($existingVideo->file_path)) {
            Storage::delete($existingVideo->file_path);
          }
          if ($existingVideo->thumbnail_path && Storage::exists($existingVideo->thumbnail_path)) {
            Storage::delete($existingVideo->thumbnail_path);
          }
          $existingVideo->delete();
        }

        // Associate new video
        $videoMedia->update([
          'mediable_type' => Teacher::class,
          'mediable_id' => $teacher->id,
        ]);
      }

      // Mark onboarding as completed
      $teacher->completeOnboarding();

      DB::commit();

      return response()->json([
        'message' => 'Teacher onboarding completed successfully',
        'user' => [
          'id' => $user->id,
          'name' => $user->name,
          'email' => $user->email,
          'phone_number' => $user->phone_number,
          'user_type' => $user->user_type,
          'profile' => $user->fresh()->profile->load(['certifications', 'educations', 'description', 'availabilities']),
          'onboarding_completed' => true,
        ],
      ], 200);
    } catch (\Exception $e) {
      DB::rollBack();
      throw $e;
    }
  }

  public function getTeacherProfile(Request $request, $teacherId)
  {
    // Find teacher by ID
    $teacher = Teacher::with([
      'user',
      'certifications',
      'educations',
      'description',
      'availabilities',
      'medias',
      'courses.subject',
      'courses.schedules'
    ])->find($teacherId);

    if (!$teacher) {
      return response()->json(['error' => 'Teacher not found'], 404);
    }

    $user = $teacher->user;

    // Get specific media URLs
    $profilePhoto = $teacher->profilePhoto();
    $introVideo = $teacher->introductionVideo();

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

        'courses' => $teacher->courses->map(function ($course) {
          $thumbnail = $course->medias()->where('media_purpose', 'course_thumbnail')->first();
          return dump($thumbnail);
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
            'thumbnail_url' => $thumbnail ? $thumbnail->url() : null,
            'price_per_student' => $course->price_per_student,
            'number_of_hours' => $course->number_of_hours,
            'min_students' => $course->min_students,
            'max_students' => $course->max_students,
            'schedules' => $course->schedules->map(function ($schedule) {
              return [
                'id' => $schedule->id,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
              ];
            }),
            'is_active' => $course->is_active,
            'is_validated' => $course->is_validated,
            'created_at' => $course->created_at,
          ];
        }),

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
