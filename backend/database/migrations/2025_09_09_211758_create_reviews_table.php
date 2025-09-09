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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->tinyInteger('rating')->comment('Rating from 1 to 5 stars');
            $table->text('comment')->nullable();
            $table->boolean('is_verified')->default(false)->comment('Verified if student actually took a lesson');
            $table->timestamp('lesson_date')->nullable()->comment('Date of the lesson being reviewed');
            $table->boolean('is_approved')->default(true)->comment('For moderation purposes');
            $table->timestamps();
            
            // Ensure a student can only review a teacher once per lesson
            $table->unique(['teacher_id', 'student_id', 'lesson_date']);
            
            // Add indexes for better performance
            $table->index(['teacher_id', 'is_approved']);
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
