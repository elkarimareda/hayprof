<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Course extends Model
{
  protected $fillable = [
    'teacher_id',
    'subject_id',
    'thumbnail_media_id',
    'title',
    'description',
    'proficiency_level',
    'price_per_student',
    'count_session',
    'duration_session',
    'min_students',
    'max_students',
    'course_date',
    'is_active',
    'is_validated',
    'validated_at',
    'validated_by',
    'validation_notes',
  ];

  protected $casts = [
    'price_per_student' => 'decimal:2',
    'count_session' => 'integer',
    'duration_session' => 'integer', // Now storing minutes as integer
    'course_date' => 'date',
    'is_active' => 'boolean',
    'is_validated' => 'boolean',
    'validated_at' => 'datetime',
  ];

  // Relationships
  public function teacher(): BelongsTo
  {
    return $this->belongsTo(Teacher::class);
  }

  public function subject(): BelongsTo
  {
    return $this->belongsTo(Subject::class);
  }

  public function schedules(): HasMany
  {
    return $this->hasMany(CourseSchedule::class);
  }

  public function medias(): MorphMany
  {
    return $this->morphMany(Media::class, 'mediable');
  }

  public function reviews(): HasMany
  {
    return $this->hasMany(Review::class);
  }

  public function approvedReviews(): HasMany
  {
    return $this->hasMany(Review::class)->approved();
  }

  public function getThumbnailUrlAttribute(): ?string
  {
    $thumbnail = $this->medias()->where('media_purpose', 'course_thumbnail')->first();
    return $thumbnail ? $thumbnail->url() : null;
  }

  public function validatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'validated_by');
  }

  public function bigBlueButtonMeetings(): HasMany
  {
    return $this->hasMany(BigBlueButtonMeeting::class);
  }

  public function enrollments(): HasMany
  {
    return $this->hasMany(CourseEnrollment::class);
  }

  public function students(): BelongsToMany
  {
    return $this->belongsToMany(Student::class, 'course_enrollments')
      ->withPivot(['status', 'enrolled_at', 'confirmed_at', 'amount_paid'])
      ->withTimestamps();
  }

  public function confirmedStudents(): BelongsToMany
  {
    return $this->belongsToMany(Student::class, 'course_enrollments')
      ->wherePivot('status', 'confirmed')
      ->withPivot(['enrolled_at', 'confirmed_at', 'amount_paid'])
      ->withTimestamps();
  }

  // Scopes
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  public function scopeValidated($query)
  {
    return $query->where('is_validated', true);
  }

  public function scopePendingValidation($query)
  {
    return $query->where('is_validated', false);
  }

  public function validate(User $validator, ?string $notes = null): void
  {
    $this->update([
      'is_validated' => true,
      'validated_at' => now(),
      'validated_by' => $validator->id,
      'validation_notes' => $notes,
    ]);
  }

  public function reject(User $validator, string $notes): void
  {
    $this->update([
      'is_validated' => false,
      'validated_at' => now(),
      'validated_by' => $validator->id,
      'validation_notes' => $notes,
    ]);
  }

  // Helper to sync schedules
  public function syncSchedules(array $schedules, float $durationSession): void
  {
    $this->schedules()->delete();

    foreach ($schedules as $schedule) {
      $this->schedules()->create([
        'datetime_scheduled' => $schedule['date'],
        'time_of_session' => (int) $durationSession, // Now storing minutes as integer
      ]);
    }
  }
}
