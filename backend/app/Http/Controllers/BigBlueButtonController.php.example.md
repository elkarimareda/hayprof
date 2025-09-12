# BigBlueButton Integration with Course, Teacher, and Student

## Overview
The BigBlueButton integration now supports linking meetings with courses, teachers, and students through database relationships.

## Database Structure
- `bigbluebutton_meetings` table with foreign keys to:
  - `course_id` (nullable) - Links to courses table
  - `teacher_id` (nullable) - Links to teachers table  
  - `student_id` (nullable) - Links to students table
  - `created_by` - Links to users table

## Model Relationships
- `BigBlueButtonMeeting` belongs to `Course`, `Teacher`, `Student`, and `User` (creator)
- `Course`, `Teacher`, `Student` have many `BigBlueButtonMeeting`

## API Endpoints

### Create Meeting with Relationships
```
POST /api/bigbluebutton/meetings
{
  "name": "French Lesson - Unit 1",
  "course_id": 1,
  "teacher_id": 5,
  "student_id": 12,
  "scheduled_at": "2025-09-13 10:00:00",
  "duration": 60,
  "is_recording": true
}
```

### Get Meetings by Course
```
GET /api/courses/1/meetings
GET /api/bigbluebutton/meetings?course_id=1
```

### Get Meetings by Teacher
```
GET /api/teachers/5/meetings
GET /api/bigbluebutton/meetings?teacher_id=5
```

### Get Meetings by Student
```
GET /api/students/12/meetings
GET /api/bigbluebutton/meetings?student_id=12
```

### Create Meeting for Specific Course
```
POST /api/courses/1/meetings
{
  "name": "French Lesson - Unit 1",
  "teacher_id": 5,
  "student_id": 12,
  "scheduled_at": "2025-09-13 10:00:00"
}
```

## Usage Examples

### 1. Create a lesson meeting
When a student books a lesson with a teacher for a specific course:

```php
$meeting = BigBlueButtonMeeting::create([
    'meeting_id' => Str::uuid(),
    'name' => "French Lesson with {$teacher->first_name}",
    'course_id' => $course->id,
    'teacher_id' => $teacher->id,
    'student_id' => $student->id,
    'created_by' => auth()->id(),
    'scheduled_at' => $lessonDate,
    'duration' => 60,
    'is_recording' => true
]);
```

### 2. Get all meetings for a course
```php
$courseMeetings = $course->bigBlueButtonMeetings()
    ->with(['teacher.user', 'student.user'])
    ->orderBy('scheduled_at')
    ->get();
```

### 3. Get teacher's upcoming meetings
```php
$teacherMeetings = $teacher->bigBlueButtonMeetings()
    ->scheduled()
    ->where('scheduled_at', '>', now())
    ->with(['course', 'student.user'])
    ->get();
```

### 4. Check if user can join meeting
```php
$canJoin = $meeting->canBeJoinedBy(auth()->user());
```

### 5. Get meeting participants
```php
$participants = $meeting->getParticipants();
// Returns array with teacher and student info
```

## Scopes Available
- `forCourse($courseId)` - Filter by course
- `forTeacher($teacherId)` - Filter by teacher
- `forStudent($studentId)` - Filter by student
- `scheduled()` - Only scheduled meetings
- `running()` - Only running meetings
- `ended()` - Only ended meetings

## Helper Methods
- `isRunning()` - Check if meeting is currently running
- `isScheduled()` - Check if meeting is scheduled
- `hasEnded()` - Check if meeting has ended
- `canBeJoinedBy(User $user)` - Check if user can join
- `getParticipants()` - Get array of participants with roles
