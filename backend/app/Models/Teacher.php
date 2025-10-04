<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Teacher extends Model
{
    protected $fillable = [
        'user_id',
        'birth_date',
        'first_name',
        'last_name',
        'country',
        'timezone',
        'pricing',
        'phone_number',
        'biography',
        'onboarding_completed',
        'verified_teacher'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'onboarding_completed' => 'boolean',
        'verified_teacher' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(Availability::class);
    }

    // New relation for certifications
    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class);
    }

    // New relation for educations
    public function educations(): HasMany
    {
        return $this->hasMany(Education::class);
    }

    // Reviews relationship
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // Approved reviews only
    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->approved();
    }

    // Courses relationship
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    // Languages relationship through user
    public function languages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'user_languages', 'user_id', 'language_id', 'user_id')
            ->withPivot('proficiency_level')
            ->withTimestamps();
    }

    // Helper to sync certifications array (delete & recreate)
    public function syncCertifications(array $items): void
    {
        $this->certifications()->delete();

        foreach ($items as $item) {
            $this->certifications()->create([
                'subject' => $item['subject'],
                'certificate' => $item['certificate'],
                'description' => $item['description'] ?? null,
                'issue_by' => $item['issue_by'] ?? null,
                'year_of_study_start' => $item['year_of_study_start'],
                'year_of_study_end' => $item['year_of_study_end'],
            ]);
        }
    }

    // Helper to sync educations array (delete & recreate)
    public function syncEducations(array $items): void
    {
        $this->educations()->delete();

        foreach ($items as $item) {
            $this->educations()->create([
                'university' => $item['university'],
                'degree' => $item['degree'],
                'degree_type' => $item['degree_type'],
                'specialization' => $item['specialization'] ?? null,
                'year_of_study_start' => $item['year_of_study_start'],
                'year_of_study_end' => $item['year_of_study_end'],
            ]);
        }
    }

    // Helper to sync availabilities (delete & recreate)
    public function syncAvailabilities(array $availabilities): void
    {
        $this->availabilities()->delete();

        foreach ($availabilities as $daySlots) {
            foreach ($daySlots as $slot) {
                $this->availabilities()->create([
                    'day_of_week' => $slot['day_of_week'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                ]);
            }
        }
    }

    // Helper to sync languages (with proficiency levels)
    public function syncLanguages(array $languages): void
    {
        $syncData = [];
        foreach ($languages as $language) {
            $syncData[$language['language_id']] = [
                'proficiency_level' => $language['proficiency_level'] ?? 'conversational'
            ];
        }
        $this->languages()->sync($syncData);
    }

    public function description(): HasOne
    {
        return $this->hasOne(Description::class);
    }

    // Helper to create or update description
    public function upsertDescription(array $data)
    {
        // Ensure allowed keys only
        $payload = [
            'yourself' => $data['yourself'] ?? null,
            'experience' => $data['experience'] ?? null,
            'motivation' => $data['motivation'] ?? null,
            'headline' => $data['headline'] ?? null,
        ];

        if ($this->description) {
            $this->description()->update($payload);
            return $this->description()->first();
        }

        return $this->description()->create($payload);
    }

    public function medias(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class);
    }

    // Get specific media types
    public function profilePhoto()
    {
        return $this->medias()->profilePhotos()->latest()->first();
    }

    public function introductionVideo()
    {
        return $this->medias()->introductionVideos()->latest()->first();
    }

    public function certificates()
    {
        return $this->medias()->certificates();
    }

    // Helper to get profile photo URL
    public function profilePhotoUrl(): ?string
    {
        return $this->profilePhoto()?->url();
    }

    // Helper to get introduction video URL
    public function introductionVideoUrl(): ?string
    {
        return $this->introductionVideo()?->url();
    }

    // Helper method to mark onboarding as completed
    public function completeOnboarding(): void
    {
        $this->update(['onboarding_completed' => true]);
    }

    // Helper method to check if onboarding is completed
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed;
    }

    // Helper method to verify teacher
    public function verifyTeacher(): void
    {
        $this->update(['verified_teacher' => true]);
    }

    // Helper method to unverify teacher
    public function unverifyTeacher(): void
    {
        $this->update(['verified_teacher' => false]);
    }

    // Helper method to check if teacher is verified
    public function isVerified(): bool
    {
        return $this->verified_teacher;
    }

    // Review statistics methods
    public function getAverageRating(): float
    {
        return round($this->approvedReviews()->avg('rating') ?? 0, 2);
    }

    public function getTotalReviews(): int
    {
        return $this->approvedReviews()->count();
    }

    public function getRatingDistribution(): array
    {
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = $this->approvedReviews()->where('rating', $i)->count();
        }
        return $distribution;
    }

    public function getReviewsWithStudents()
    {
        return $this->approvedReviews()
            ->with(['student.user', 'course','student.medias' => function ($query) {
                $query->where('type', 'profile_photo');
            }])
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get all enrolled students for a specific course taught by this teacher
     */
    public function getStudentsByCourse(int $courseId)
    {
        // First verify the course belongs to this teacher
        $course = $this->courses()->where('id', $courseId)->first();
        
        if (!$course) {
            return collect(); // Return empty collection if course doesn't belong to teacher
        }

        return \App\Models\Student::whereHas('enrollments', function ($query) use ($courseId) {
            $query->where('course_id', $courseId)
                  ->where('status', 'confirmed');
        })->with(['user', 'medias' => function ($query) {
            $query->where('media_purpose', 'profile_photo');
        }])->get();
    }

    /**
     * Get all enrolled students across all courses taught by this teacher
     */
    public function getAllEnrolledStudents()
    {
        $courseIds = $this->courses()->pluck('id');

        return \App\Models\Student::whereHas('enrollments', function ($query) use ($courseIds) {
            $query->whereIn('course_id', $courseIds)
                  ->where('status', 'confirmed');
        })->with(['user', 'medias' => function ($query) {
            $query->where('media_purpose', 'profile_photo');
        }])->distinct()->get();
    }
}
