<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Student extends Model
{
    protected $fillable = ['user_id', 'birth_date', 'country', 'timezone'];

    protected $casts = [
        'birth_date' => 'date'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function medias(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function bigBlueButtonMeetings(): HasMany
    {
        return $this->hasMany(BigBlueButtonMeeting::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_enrollments')
            ->withPivot(['status', 'enrolled_at', 'confirmed_at', 'amount_paid'])
            ->withTimestamps();
    }

    public function confirmedCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_enrollments')
            ->wherePivot('status', 'confirmed')
            ->withPivot(['enrolled_at', 'confirmed_at', 'amount_paid'])
            ->withTimestamps();
    }

    // Check if student has reviewed a specific teacher
    public function hasReviewedTeacher(int $teacherId, $courseId = null): bool
    {
        $query = $this->reviews()->where('teacher_id', $teacherId);
        
        if ($courseId) {
            $query->where('course_id', $courseId);
        }
        
        return $query->exists();
    }
}
