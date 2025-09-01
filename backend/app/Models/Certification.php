<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certification extends Model
{
  protected $table = 'certifications';

  protected $fillable = [
    'teacher_id',
    'subject',
    'certificate',
    'description',
    'issue_by',
    'year_of_study_start',
    'year_of_study_end',
  ];

  public function teacher(): BelongsTo
  {
    return $this->belongsTo(Teacher::class);
  }
}
