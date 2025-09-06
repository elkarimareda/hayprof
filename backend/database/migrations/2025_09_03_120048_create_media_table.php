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
        Schema::create('medias', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['photo', 'video'])->index();
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable(); // bytes
            $table->enum('media_purpose', [
                'profile_photo',
                'introduction_video',
                'course_thumbnail',
                'course_video',
                'recording',
                'document',
                'other'
            ]);
            $table->nullableMorphs('mediable'); // Creates mediable_id and mediable_type
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medias');
    }
};
