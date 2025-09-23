<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'provider_email',
        'avatar',
        'provider_data',
    ];

    protected $casts = [
        'provider_data' => 'array',
    ];

    /**
     * Get the user that owns the social account
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if this social account matches the given provider data
     */
    public function matchesProvider(string $provider, string $providerId): bool
    {
        return $this->provider === $provider && $this->provider_id === $providerId;
    }

    /**
     * Update the social account with fresh data from provider
     */
    public function updateFromProvider(object $socialUser): void
    {
        $this->update([
            'provider_email' => $socialUser->getEmail(),
            'avatar' => $socialUser->getAvatar(),
            'provider_data' => [
                'name' => $socialUser->getName(),
                'nickname' => $socialUser->getNickname(),
                'raw' => $socialUser->getRaw(),
            ],
        ]);
    }
}