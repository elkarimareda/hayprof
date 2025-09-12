<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop the old unique constraint that includes lesson_date
            $table->dropUnique(['teacher_id', 'student_id', 'lesson_date']);
            
            // Remove lesson_date column
            $table->dropColumn('lesson_date');
            
            // Add course_id foreign key (nullable)
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('set null');
            
            // Add new unique constraint with course_id
            $table->unique(['teacher_id', 'student_id', 'course_id']);
            
            // Add index for course_id
            $table->index('course_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique(['teacher_id', 'student_id', 'course_id']);
            
            // Drop course_id column and its index
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');
            
            // Add back lesson_date column
            $table->timestamp('lesson_date')->nullable()->comment('Date of the lesson being reviewed');
            
            // Restore original unique constraint
            $table->unique(['teacher_id', 'student_id', 'lesson_date']);
        });
    }
};
