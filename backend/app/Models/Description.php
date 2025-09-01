<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Description extends Model
{
    protected $table = 'descriptions';

    protected $fillable = [
        'teacher_id',
        'yourself',
        'experience',
        'motivation',
        'headline',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
