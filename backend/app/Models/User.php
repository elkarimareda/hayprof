<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

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
        ];
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
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
        $profile = $this->isStudent() ? $this->student : $this->teacher;

        // Add photo URL for teachers
        if ($this->isTeacher() && $profile) {
            $profile->photo_url = $profile->profilePhotoUrl();
        }

        return $profile;
    }

    // Find user by email or phone
    public static function findByIdentifier($identifier)
    {
        return static::where('email', $identifier)
            ->orWhere('phone_number', $identifier)
            ->first();
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
