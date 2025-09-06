<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
  public function index(Request $request)
  {
    $query = Student::with(['user', 'medias']);

    // Apply filters
    if ($request->has('country')) {
      $query->where('country', $request->country);
    }

    $students = $query->paginate(12);

    // Format the response to include user data and media URLs
    $formattedStudents = $students->getCollection()->map(function ($student) {
      $user = $student->user;
      $profilePhoto = $student->medias()->where('media_purpose', 'profile_photo')->first();

      return [
        'id' => $student->id,
        'name' => $user->name,
        'email' => $user->email,
        'country' => $student->country ?? 'Not specified',
        'photo_url' => $profilePhoto ? $profilePhoto->url() : null,
        'created_at' => $student->created_at,
      ];
    });

    $students->setCollection($formattedStudents);

    return response()->json([
      'students' => $students
    ]);
  }

  public function profile(Request $request, $studentId)
  {
    // Find student by ID with all related data
    $student = Student::with([
      'user',
      'medias'
    ])->find($studentId);

    if (!$student) {
      return response()->json(['error' => 'Student not found'], 404);
    }

    $user = $student->user;

    // Get specific media URLs
    $profilePhoto = $student->medias()->where('media_purpose', 'profile_photo')->first();

    $response = [
      'id' => $user->id,
      'name' => $user->name,
      'email' => $user->email,
      'phone_number' => $user->phone_number,
      'user_type' => $user->user_type,
      'profile' => [
        'id' => $student->id,
        'user_id' => $student->user_id,
        'birth_date' => $student->birth_date,
        'country' => $student->country,
        'timezone' => $student->timezone,
        'created_at' => $student->created_at,
        'updated_at' => $student->updated_at,

        // Media URLs
        'photo_url' => $profilePhoto ? $profilePhoto->url() : null,
      ]
    ];

    return response()->json($response);
  }
}
