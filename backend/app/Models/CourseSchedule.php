<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseSchedule extends Model
{
  protected $fillable = [
    'course_id',
    'datetime_scheduled',
    'time_of_session',
  ];

  protected $casts = [
    'datetime_scheduled' => 'datetime',
    'time_of_session' => 'integer',
  ];

  public function course(): BelongsTo
  {
    return $this->belongsTo(Course::class);
  }
}
