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
        Schema::create('big_blue_button_meetings', function (Blueprint $table) {
            $table->id();
            $table->string('meeting_id')->unique()->index();
            $table->string('name');
            $table->string('attendee_password');
            $table->string('moderator_password');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade');
            $table->boolean('is_recording')->default(false);
            $table->unsignedInteger('max_participants')->nullable();
            $table->unsignedInteger('duration')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, running, ended
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['created_by', 'status']);
            $table->index(['course_id', 'teacher_id']);
            $table->index(['student_id', 'status']);
            $table->index('scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('big_blue_button_meetings');
    }
};
