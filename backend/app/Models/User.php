<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'user_type',
        'password',
        'email_verified_at',
        'phone_verified_at',
        'provider',
        'provider_id',
        'avatar',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return (bool) ($this->user_type === 'admin' ?? false);
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    public function languages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'user_languages')
            ->withPivot('proficiency_level')
            ->withTimestamps();
    }

    public function isStudent()
    {
        return $this->user_type === 'student';
    }

    public function isTeacher()
    {
        return $this->user_type === 'teacher';
    }

    public function getProfileAttribute()
    {
        if($this->isAdmin()) return null;
        $profile = $this->isStudent() ? $this->student : $this->teacher;

        // For teachers, we'll handle photo_url in the controller/API response
        // Don't modify the model instance to avoid database update issues

        return $profile;
    }

    // Find user by email or phone
    public static function findByIdentifier($identifier)
    {
        return static::where('email', $identifier)
            ->orWhere('phone_number', $identifier)
            ->first();
    }

    /**
     * Get all social accounts for this user
     */
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    /**
     * Get a specific social account by provider
     */
    public function getSocialAccount(string $provider): ?SocialAccount
    {
        return $this->socialAccounts()->where('provider', $provider)->first();
    }

    /**
     * Check if user has a social account for the given provider
     */
    public function hasSocialAccount(string $provider): bool
    {
        return $this->socialAccounts()->where('provider', $provider)->exists();
    }

    /**
     * Get all linked social providers
     */
    public function getLinkedProviders(): array
    {
        return $this->socialAccounts()->pluck('provider')->toArray();
    }

    /**
     * Get the primary avatar (from most recent social account or null)
     */
    public function getPrimaryAvatar(): ?string
    {
        $latestSocialAccount = $this->socialAccounts()
            ->whereNotNull('avatar')
            ->latest()
            ->first();
            
        return $latestSocialAccount?->avatar ?? $this->avatar;
    }

    // Validation rules
    public static function getValidationRules($isUpdate = false)
    {
        $emailRule = $isUpdate ? 'sometimes|' : 'required_without:phone_number|';
        $phoneRule = $isUpdate ? 'sometimes|' : 'required_without:email|';

        return [
            'name' => 'required|string|max:255',
            'email' => $emailRule . 'email|unique:users,email',
            'phone_number' => $phoneRule . 'string|max:20|unique:users,phone_number',
            'user_type' => 'required|in:student,teacher',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
