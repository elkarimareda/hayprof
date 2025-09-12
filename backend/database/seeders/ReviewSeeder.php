<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Course;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some teachers, students, and courses
        $teachers = Teacher::take(5)->get();
        $students = Student::take(10)->get();
        $courses = Course::take(10)->get();

        if ($teachers->isEmpty() || $students->isEmpty()) {
            $this->command->info('No teachers or students found. Please run TeacherSeeder and StudentSeeder first.');
            return;
        }

        $sampleReviews = [
            [
                'rating' => 5,
                'comment' => 'Excellent teacher! Very patient and explains concepts clearly. I learned so much in this course.',
            ],
            [
                'rating' => 4,
                'comment' => 'Great course, the teacher was well-prepared and the material was engaging.',
            ],
            [
                'rating' => 5,
                'comment' => 'Outstanding teaching method. Made complex topics easy to understand. Highly recommended!',
            ],
            [
                'rating' => 4,
                'comment' => 'Good teacher with solid knowledge. The pace was perfect for my learning level.',
            ],
            [
                'rating' => 3,
                'comment' => 'Decent course but could use more interactive activities. Still learned valuable content.',
            ],
            [
                'rating' => 5,
                'comment' => 'Amazing experience! The teacher adapted to my learning style and provided excellent feedback.',
            ],
            [
                'rating' => 4,
                'comment' => 'Professional and knowledgeable. The course was well-structured and informative.',
            ],
            [
                'rating' => 5,
                'comment' => 'Best teacher I\'ve had on this platform! Encouraging, patient, and extremely helpful.',
            ],
            [
                'rating' => 4,
                'comment' => 'Very good teaching approach. Clear explanations and good use of examples.',
            ],
            [
                'rating' => 2,
                'comment' => 'The course was okay but I felt it could have been more engaging and interactive.',
            ],
        ];

        foreach ($teachers as $teacher) {
            // Each teacher gets 3-7 random reviews
            $reviewCount = rand(3, 7);
            
            for ($i = 0; $i < $reviewCount; $i++) {
                $student = $students->random();
                $review = $sampleReviews[array_rand($sampleReviews)];
                
                // Optionally assign a course (50% chance)
                $course = rand(0, 1) === 1 && !$courses->isEmpty() ? $courses->random() : null;
                
                Review::create([
                    'teacher_id' => $teacher->id,
                    'student_id' => $student->id,
                    'rating' => $review['rating'],
                    'comment' => $review['comment'],
                    'course_id' => $course ? $course->id : null,
                    'is_verified' => rand(0, 1) === 1, // 50% chance of being verified
                    'is_approved' => true,
                ]);
            }
        }

        $this->command->info('Sample reviews created successfully!');
    }
}
