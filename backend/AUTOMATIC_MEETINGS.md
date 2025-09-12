# Automatic BigBlueButton Meeting Creation System

## Overview
This system automatically creates BigBlueButton meetings when:
1. **A teacher creates a course** - Creates meetings for all scheduled sessions
2. **A student enrolls in a course** - Updates meetings with student information or creates individual meetings

## Architecture

### Models
- **Course** - Has many schedules and enrollments
- **CourseEnrollment** - Links students to courses with enrollment status
- **CourseSchedule** - Defines when course sessions occur
- **BigBlueButtonMeeting** - Video conference meetings linked to courses, teachers, and students

### Events & Listeners
- **CourseCreated Event** → **CreateMeetingForCourse Listener**
- **StudentEnrolled Event** → **UpdateMeetingForEnrollment Listener**

## Workflow

### 1. Course Creation Flow
```
Teacher creates course → CourseCreated event → CreateMeetingForCourse listener
                                           → Creates BBB meetings for each schedule
```

**What happens:**
- For each `CourseSchedule` in the course
- Creates a `BigBlueButtonMeeting` with:
  - Unique meeting ID and passwords
  - Course and teacher linked
  - `student_id` = null (to be filled when student enrolls)
  - Scheduled for the session datetime
  - Status: 'scheduled'

### 2. Student Enrollment Flow
```
Student enrolls → CourseEnrollment created → StudentEnrolled event → UpdateMeetingForEnrollment listener
                                                                  → Updates or creates student-specific meetings
```

**What happens:**
- Checks if enrollment status is 'confirmed'
- Looks for existing meetings without assigned students
- **Option A:** Updates existing meeting with student info
- **Option B:** Creates new individual meetings for the student

## API Endpoints

### Course Management
```bash
# Create a course (automatically creates meetings)
POST /api/courses
{
  "title": "French Basics",
  "subject": 1,
  "description": "Learn basic French",
  "price_per_student": 50.00,
  "count_session": 10,
  "duration_session": 1.5,
  "min_students": 1,
  "max_students": 5,
  "schedule": [
    {
      "day_of_week": "monday",
      "start_time": "09:00",
      "end_time": "10:30"
    }
  ]
}
```

### Enrollment Management
```bash
# Enroll in a course (automatically updates meetings)
POST /api/courses/{course_id}/enroll
{
  "amount_paid": 50.00,
  "payment_method": "credit_card"
}

# View my enrollments
GET /api/my-enrollments

# View course enrollments (teacher only)
GET /api/courses/{course_id}/enrollments

# Unenroll from course
DELETE /api/courses/{course_id}/enroll
```

### Meeting Management
```bash
# Get meetings for a course
GET /api/courses/{course_id}/meetings

# Get meetings for a teacher
GET /api/teachers/{teacher_id}/meetings

# Get meetings for a student
GET /api/students/{student_id}/meetings

# General meeting operations
GET /api/bigbluebutton/meetings
POST /api/bigbluebutton/meetings
POST /api/bigbluebutton/meetings/join
```

## Database Structure

### course_enrollments table
```sql
- id (primary key)
- course_id (foreign key to courses)
- student_id (foreign key to students)
- status (enum: pending, confirmed, cancelled, completed)
- enrolled_at (timestamp)
- confirmed_at (timestamp)
- amount_paid (decimal)
- metadata (json)
```

### bigbluebutton_meetings table (enhanced)
```sql
- id (primary key)
- meeting_id (unique BBB meeting identifier)
- course_id (foreign key, nullable)
- teacher_id (foreign key, nullable)
- student_id (foreign key, nullable)
- name, passwords, settings...
- scheduled_at (when the meeting should occur)
- status (scheduled, running, ended)
- metadata (json with auto-creation info)
```

## Meeting Types

### 1. Course Template Meetings
- Created when course is created
- `student_id` = null
- Can be assigned to students upon enrollment
- Good for courses with predictable enrollment

### 2. Individual Student Meetings
- Created when student enrolls
- `student_id` = specific student
- One-on-one sessions between teacher and student
- Good for private tutoring

## Example Usage Scenarios

### Scenario 1: Language Tutoring
```bash
# Teacher creates a French course
POST /api/courses
# → Creates 10 scheduled meetings (template meetings)

# Student enrolls
POST /api/courses/1/enroll
# → Assigns first available meeting to student
# → Creates individual meetings for remaining sessions
```

### Scenario 2: Group Classes
```bash
# Teacher creates a group course (max 5 students)
POST /api/courses
# → Creates meetings with max_participants = 6 (5 students + teacher)

# Multiple students enroll
POST /api/courses/1/enroll (Student A)
POST /api/courses/1/enroll (Student B)
# → All students share the same meetings
# → Meeting names updated to reflect participants
```

## Configuration & Customization

### Meeting Settings
- **Recording:** Enabled by default for all auto-created meetings
- **Duration:** Based on course schedule duration
- **Participants:** Teacher + enrolled students
- **Passwords:** Auto-generated unique passwords

### Event Handling
Events are registered in `AppServiceProvider`:
```php
Event::listen(CourseCreated::class, CreateMeetingForCourse::class);
Event::listen(StudentEnrolled::class, UpdateMeetingForEnrollment::class);
```

### Queue Processing
Both listeners implement `ShouldQueue` for background processing:
```bash
# Process queued jobs
php artisan queue:work
```

## Monitoring & Management

### Check Auto-Created Meetings
```bash
# Get meetings with metadata about auto-creation
GET /api/bigbluebutton/meetings?include_bbb_data=false

# Filter by auto-created meetings
BigBlueButtonMeeting::whereJsonContains('metadata->auto_created', true)->get()
```

### Meeting Status Tracking
- **scheduled:** Meeting created, waiting for start time
- **running:** Meeting currently active
- **ended:** Meeting completed

## Benefits

1. **Automation:** No manual meeting creation required
2. **Consistency:** All courses automatically get proper meeting structure
3. **Flexibility:** Supports both group and individual learning models
4. **Integration:** Seamlessly connects course management with video conferencing
5. **Scalability:** Handles multiple courses and enrollments efficiently

## Future Enhancements

- **Recurring Meetings:** For weekly courses over multiple weeks
- **Meeting Reminders:** Email notifications before scheduled sessions
- **Attendance Tracking:** Integration with BigBlueButton attendance data
- **Meeting Templates:** Custom meeting settings per course type
- **Conflict Detection:** Prevent scheduling overlaps for teachers/students
