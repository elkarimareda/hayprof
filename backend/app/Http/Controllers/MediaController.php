<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
  public function upload(Request $request)
  {
    $request->validate([
      'file' => 'required|file|max:10240|mimetypes:image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/webm',
      'thumbnails' => 'file|max:10240|mimetypes:image/jpeg,image/png,image/gif',
      'media_purpose' => ['required', Rule::in([
        'profile_photo',
        'introduction_video',
        'certificate',
        'portfolio',
        'other'
      ])],
    ]);

    $file = $request->file('file');
    $thumbnails = $request->file('thumbnails');
    $mime = $file->getMimeType();

    // 🔎 Determine type based on actual MIME
    $type = str_contains($mime, 'image')
      ? 'photo'
      : (str_contains($mime, 'video') ? 'video' : null);

    if (!$type) {
      return response()->json(['error' => 'Unsupported file type'], 422);
    }

    $purpose = $request->input('media_purpose');
    if ($purpose === 'profile_photo' && $type !== 'photo') {
      return response()->json(['error' => 'Profile photo must be an image'], 422);
    }
    if ($purpose === 'introduction_video' && $type !== 'video') {
      return response()->json(['error' => 'Introduction video must be a video file'], 422);
    }

    $path = $file->store("uploads/{$purpose}", 's3');

    $media = Media::create([
      'mediable_id'   => $request->user()?->isStudent() ? $request->user()->student->id : ($request->user()?->isTeacher() ? $request->user()->teacher->id : null),
      'mediable_type' => $request->user() ? $request->user()?->isStudent() ? get_class($request->user()->student) : ($request->user()?->isTeacher() ? get_class($request->user()->teacher) : null) : null,
      'type'          => $type, // ✅ derived from file, not user input
      'media_purpose'  => $purpose,
      'file_path'     => $path,
      'mime_type'     => $mime,
      'size'          => $file->getSize(),
      'thumbnail_path' => $thumbnails
        ? $thumbnails->store('uploads/thumbnails', 's3') // store thumbnail on S3
        : null,
    ]);

    return response()->json([
      'id'         => $media->id,
      'type' => $media->type,
      'media_purpose' => $media->media_purpose,
      'url'        => $media->file_path ? Storage::url($media->file_path) : null,
    ]);
  }
}
