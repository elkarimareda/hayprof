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
        // Create courses table
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('proficiency_level', ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'proficient'])->nullable();
            $table->decimal('price_per_student', 8, 2);
            $table->integer('count_session');
            $table->integer('min_students')->default(1);
            $table->integer('max_students');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_validated')->default(false);
            $table->timestamps();
        });

        // Create course schedules table
        Schema::create('course_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->dateTime('datetime_scheduled');
            $table->integer('time_of_session'); // duration in minutes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_schedules');
        Schema::dropIfExists('courses');
    }
};
