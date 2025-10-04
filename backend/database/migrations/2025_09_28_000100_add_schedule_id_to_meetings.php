<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('meetings')) {
            return;
        }

        Schema::table('meetings', function (Blueprint $table) {
            if (!Schema::hasColumn('meetings', 'schedule_id')) {
                $table->foreignId('schedule_id')->nullable()->constrained('course_schedules')->onDelete('cascade')->after('course_id');
                $table->index('schedule_id');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('meetings')) {
            return;
        }

        Schema::table('meetings', function (Blueprint $table) {
            if (Schema::hasColumn('meetings', 'schedule_id')) {
                $table->dropForeign(['schedule_id']);
                $table->dropIndex(['schedule_id']);
                $table->dropColumn('schedule_id');
            }
        });
    }
};
