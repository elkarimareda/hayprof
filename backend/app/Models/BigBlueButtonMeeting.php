<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BigBlueButtonMeeting extends Model
{
    use HasFactory;

    protected $table = 'big_blue_button_meetings';

    protected $fillable = [
        'meeting_id',
        'name',
        'attendee_password',
        'moderator_password',
        'created_by',
        'course_id',
        'teacher_id',
        'student_id',
        'is_recording',
        'max_participants',
        'duration',
        'scheduled_at',
        'started_at',
        'ended_at',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'is_recording' => 'boolean',
            'scheduled_at' => 'datetime',
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

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

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
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
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
        
        if ($this->teacher) {
            $participants[] = [
                'type' => 'teacher',
                'user' => $this->teacher->user,
                'role' => 'moderator'
            ];
        }
        
        if ($this->student) {
            $participants[] = [
                'type' => 'student', 
                'user' => $this->student->user,
                'role' => 'attendee'
            ];
        }
        
        return $participants;
    }

    public function canBeJoinedBy(User $user): bool
    {
        // Check if user is the teacher
        if ($this->teacher && $this->teacher->user_id === $user->id) {
            return true;
        }
        
        // Check if user is the student
        if ($this->student && $this->student->user_id === $user->id) {
            return true;
        }
        
        // Check if user created the meeting
        if ($this->created_by === $user->id) {
            return true;
        }
        
        return false;
    }
}