<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $table = 'medias';
    protected $fillable = [
        'mediable_id',
        'mediable_type',
        'type',
        'media_purpose',
        'file_path',
        'mime_type',
        'size',
        'thumbnail_path',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function url(): string
    {
        return Storage::url($this->file_path);
    }

    public function getUrlAttribute(): string
    {
        return $this->url();
    }

    // Helper scopes for different media purposes
    public function scopeProfilePhotos($query)
    {
        return $query->where('media_purpose', 'profile_photo');
    }

    public function scopeIntroductionVideos($query)
    {
        return $query->where('media_purpose', 'introduction_video');
    }

    public function scopeCertificates($query)
    {
        return $query->where('media_purpose', 'certificate');
    }
}
