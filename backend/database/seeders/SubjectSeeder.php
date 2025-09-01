<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH', 'description' => 'Mathematics and arithmetic subjects'],
            ['name' => 'English Language', 'code' => 'ENG', 'description' => 'English language learning and literature'],
            ['name' => 'French Language', 'code' => 'FR', 'description' => 'French language learning and literature'],
            ['name' => 'Spanish Language', 'code' => 'ES', 'description' => 'Spanish language learning and literature'],
            ['name' => 'Computer Science', 'code' => 'CS', 'description' => 'Programming, algorithms, and computer science'],
            ['name' => 'Physics', 'code' => 'PHYS', 'description' => 'Physics and physical sciences'],
            ['name' => 'Chemistry', 'code' => 'CHEM', 'description' => 'Chemistry and chemical sciences'],
            ['name' => 'Biology', 'code' => 'BIO', 'description' => 'Biology and life sciences'],
            ['name' => 'History', 'code' => 'HIST', 'description' => 'History and social studies'],
            ['name' => 'Geography', 'code' => 'GEO', 'description' => 'Geography and earth sciences'],
            ['name' => 'Music', 'code' => 'MUS', 'description' => 'Music theory and practice'],
            ['name' => 'Art', 'code' => 'ART', 'description' => 'Visual arts and design'],
            ['name' => 'Business', 'code' => 'BUS', 'description' => 'Business and economics'],
            ['name' => 'Psychology', 'code' => 'PSY', 'description' => 'Psychology and behavioral sciences'],
            ['name' => 'Philosophy', 'code' => 'PHIL', 'description' => 'Philosophy and critical thinking'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }
}
