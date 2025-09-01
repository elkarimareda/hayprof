<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
    'number_of_hours',
    'min_students',
    'max_students',
    'is_active',
    'is_validated',
    'validated_at',
    'validated_by',
    'validation_notes',
  ];

  protected $casts = [
    'price_per_student' => 'decimal:2',
    'number_of_hours' => 'decimal:1',
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

  public function getThumbnailUrlAttribute(): ?string
  {
    $thumbnail = $this->medias()->where('media_purpose', 'course_thumbnail')->first();
    return $thumbnail ? $thumbnail->url() : null;
  }

  public function validatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'validated_by');
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
  public function syncSchedules(array $schedules): void
  {
    $this->schedules()->delete();

    foreach ($schedules as $schedule) {
      $this->schedules()->create([
        'day_of_week' => $schedule['day_of_week'],
        'start_time' => $schedule['start_time'],
        'end_time' => $schedule['end_time'],
      ]);
    }
  }
}
