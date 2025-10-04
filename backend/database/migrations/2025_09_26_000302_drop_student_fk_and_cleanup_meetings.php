<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('meetings')) {
            return;
        }

        // Drop the specific foreign key by name if present
        try {
            DB::statement('ALTER TABLE `meetings` DROP FOREIGN KEY `big_blue_button_meetings_student_id_foreign`');
        } catch (\Exception $e) {
            // ignore if not present
        }

        Schema::table('meetings', function (Blueprint $table) {
            if (Schema::hasColumn('meetings', 'student_id')) {
                try { $table->dropColumn('student_id'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'name')) {
                try { $table->dropColumn('name'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'duration')) {
                try { $table->dropColumn('duration'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'scheduled_at')) {
                try { $table->dropColumn('scheduled_at'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'max_participants')) {
                try { $table->dropColumn('max_participants'); } catch (\Exception $e) { }
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('meetings')) {
            return;
        }

        Schema::table('meetings', function (Blueprint $table) {
            if (!Schema::hasColumn('meetings', 'name')) {
                $table->string('name')->after('meeting_id');
            }
            if (!Schema::hasColumn('meetings', 'max_participants')) {
                $table->unsignedInteger('max_participants')->nullable()->after('is_recording');
            }
            if (!Schema::hasColumn('meetings', 'duration')) {
                $table->unsignedInteger('duration')->nullable()->after('max_participants');
            }
            if (!Schema::hasColumn('meetings', 'scheduled_at')) {
                $table->timestamp('scheduled_at')->nullable()->after('duration');
                $table->index('scheduled_at');
            }
            if (!Schema::hasColumn('meetings', 'student_id')) {
                $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade')->after('teacher_id');
            }
        });
    }
};
