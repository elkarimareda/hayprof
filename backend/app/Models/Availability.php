<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Availability extends Model
{
  protected $fillable = ['teacher_id', 'day_of_week', 'start_time', 'end_time'];

  public function teacher(): BelongsTo
  {
    return $this->belongsTo(Teacher::class);
  }
}
