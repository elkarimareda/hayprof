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
        // Create availabilities table
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });

        // Create certifications table
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->string('subject');
            $table->string('certificate');
            $table->text('description')->nullable();
            $table->string('issue_by')->nullable();
            $table->year('year_of_study_start');
            $table->year('year_of_study_end');
            $table->timestamps();
        });

        // Create educations table
        Schema::create('educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->string('university');
            $table->string('degree');
            $table->string('degree_type');
            $table->string('specialization')->nullable();
            $table->year('year_of_study_start');
            $table->year('year_of_study_end');
            $table->timestamps();
        });

        // Create descriptions table
        Schema::create('descriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->text('yourself')->nullable();
            $table->text('experience')->nullable();
            $table->text('motivation')->nullable();
            $table->string('headline')->nullable();
            $table->timestamps();
        });

        // Create user_languages pivot table
        Schema::create('user_languages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('language_id')->constrained()->onDelete('cascade');
            $table->enum('proficiency_level', ['native', 'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'proficient'])->default('intermediate');
            $table->timestamps();

            $table->unique(['user_id', 'language_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_languages');
        Schema::dropIfExists('descriptions');
        Schema::dropIfExists('educations');
        Schema::dropIfExists('certifications');
        Schema::dropIfExists('availabilities');
    }
};
