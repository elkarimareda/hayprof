<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Education extends Model
{
  protected $table = 'educations';

  protected $fillable = [
    'teacher_id',
    'university',
    'degree',
    'degree_type',
    'specialization',
    'year_of_study_start',
    'year_of_study_end',
  ];

  public function teacher(): BelongsTo
  {
    return $this->belongsTo(Teacher::class);
  }
}
