<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Course;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'attendee_password',
        'moderator_password',
        'created_by',
        'course_id',
        'is_recording',
        'started_at',
        'ended_at',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'is_recording' => 'boolean',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // student relationship removed per schema change

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function hasEnded(): bool
    {
        return $this->status === 'ended';
    }

    // Scope methods
    public function scopeForCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeForTeacher($query, $teacherId)
    {
        // teacher_id removed; keep for compatibility but return no-op
        return $query;
    }

    public function scopeForStudent($query, $studentId)
    {
        // student_id removed; keep for compatibility but return no-op
        return $query;
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    public function scopeEnded($query)
    {
        return $query->where('status', 'ended');
    }

    // Helper methods
    public function getParticipants(): array
    {
        $participants = [];
        // Teacher and student relations removed; participants derived elsewhere if needed
        
        return $participants;
    }

    public function canBeJoinedBy(User $user): bool
    {
        // Check if user is the teacher
        // Teacher and student checks removed; fallback to creator
        
        // Check if user created the meeting
        if ($this->created_by === $user->id) {
            return true;
        }
        
        return false;
    }

    /**
     * Generate a standardized meeting name for a course.
     *
     * @param Course|null $course
     * @param string|null $default
     * @return string
     */
    public static function generateNameForCourse(?Course $course, ?string $default = null): string
    {
        $meetingIdFallback = $default ?? 'Meeting';

        if (!$course) {
            return $meetingIdFallback;
        }

        $teacher = $course->teacher ?? null;
        $teacherName = null;
        if ($teacher) {
            $teacherName = trim((string)($teacher->first_name ?? '') . ' ' . (string)($teacher->last_name ?? ''));
            if ($teacherName === '') {
                $teacherName = null;
            }
        }

        $subjectName = $course->subject?->name ?? null;

        if ($teacherName && $subjectName) {
            return "HayProf {$teacherName} - {$subjectName}";
        }

        if ($teacherName) {
            return "HayProf {$teacherName} - {$course->title}";
        }

        if ($subjectName) {
            return "HayProf - {$subjectName}";
        }

        return $course->title ?? $meetingIdFallback;
    }
}