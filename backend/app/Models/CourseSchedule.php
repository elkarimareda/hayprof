<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseSchedule extends Model
{
  protected $fillable = [
    'course_id',
    'day_of_week',
    'start_time',
    'end_time',
  ];

  protected $casts = [
    'start_time' => 'datetime:H:i',
    'end_time' => 'datetime:H:i',
  ];

  public function course(): BelongsTo
  {
    return $this->belongsTo(Course::class);
  }
}
