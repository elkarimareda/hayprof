<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('courses', function (Blueprint $table) {
      $table->id();
      $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
      $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
      $table->string('title');
      $table->text('description');
      $table->enum('proficiency_level', [
        'beginner',
        'elementary',
        'intermediate',
        'upper_intermediate',
        'advanced',
        'proficient'
      ])->nullable();
      $table->decimal('price_per_student', 8, 2);
      $table->decimal('number_of_hours', 4, 1);
      $table->integer('min_students');
      $table->integer('max_students');
      $table->boolean('is_active')->default(true);
      $table->boolean('is_validated')->default(false);
      $table->timestamp('validated_at')->nullable();
      $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
      $table->text('validation_notes')->nullable();
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('courses');
  }
};
