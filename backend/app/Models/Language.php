<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Language extends Model
{
    protected $fillable = [
        'name',
        'code',
        'native_name',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // Scope for active languages
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Relationships
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_languages')
            ->withPivot('proficiency_level')
            ->withTimestamps();
    }

    // Helper methods for specific user types
    public function teachers(): BelongsToMany
    {
        return $this->users()->where('user_type', 'teacher');
    }

    public function students(): BelongsToMany
    {
        return $this->users()->where('user_type', 'student');
    }
}
