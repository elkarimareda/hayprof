<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->enum('media_purpose', [
                'profile_photo',
                'introduction_video',
                'certificate',
                'portfolio',
                'other'
            ])->default('other')->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn('media_purpose');
        });
    }
};
